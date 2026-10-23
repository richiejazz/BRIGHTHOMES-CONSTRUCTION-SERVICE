from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import generics, serializers, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .models import User
from .serializers import AvatarUploadSerializer, PasswordResetConfirmSerializer, PasswordResetRequestSerializer, RegisterSerializer, UserSerializer

DetailSerializer = inline_serializer("Detail", {"detail": serializers.CharField()})


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    # Registration never depends on an existing session, so a stale token must not block it.
    authentication_classes = []


class CurrentUserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "patch", "head", "options"]

    def get_object(self):
        return self.request.user


class CurrentUserAvatarView(APIView):
    """Upload, replace (PUT) or remove (DELETE) the signed-in user's profile photo."""

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    @extend_schema(request={"multipart/form-data": AvatarUploadSerializer}, responses=UserSerializer)
    def put(self, request):
        serializer = AvatarUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        previous = user.avatar.name
        user.avatar.save(serializer.validated_data["avatar"].name, serializer.validated_data["avatar"], save=False)
        user.save(update_fields=["avatar"])
        if previous:
            user.avatar.storage.delete(previous)
        return Response(UserSerializer(user, context={"request": request}).data)

    @extend_schema(request=None, responses=UserSerializer)
    def delete(self, request):
        user = request.user
        if user.avatar:
            user.avatar.delete(save=False)
            user.save(update_fields=["avatar"])
        return Response(UserSerializer(user, context={"request": request}).data)


RESET_REQUESTED = "If an account exists for that email, a reset link is on its way."
RESET_INVALID = "This reset link is invalid or has expired. Please request a new one."


class PasswordResetRequestView(APIView):
    """Email a single-use password-reset link. The response never reveals whether the account exists."""

    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "password_reset"

    @extend_schema(request=PasswordResetRequestSerializer, responses=DetailSerializer)
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = User.objects.normalize_email(serializer.validated_data["email"])
        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user and user.has_usable_password():
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"
            send_mail(
                subject="Reset your BRIGHTHOMES password",
                message=(
                    f"Hello {user.first_name or 'there'},\n\n"
                    "We received a request to reset the password for your BRIGHTHOMES account. "
                    f"Use this link within {settings.PASSWORD_RESET_TIMEOUT // 60} minutes to choose a new one:\n\n{link}\n\n"
                    "If you didn't ask for this, you can ignore this email; your password won't change.\n\n"
                    "BRIGHTHOMES Construction Service"
                ),
                from_email=None,
                recipient_list=[user.email],
            )
        return Response({"detail": RESET_REQUESTED})


class PasswordResetConfirmView(APIView):
    """Set a new password from a reset link. Links are single-use: changing the password invalidates them."""

    permission_classes = [AllowAny]
    authentication_classes = []

    @extend_schema(request=PasswordResetConfirmSerializer, responses=DetailSerializer)
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            user = User.objects.get(pk=force_str(urlsafe_base64_decode(data["uid"])), is_active=True)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            user = None
        if user is None or not default_token_generator.check_token(user, data["token"]):
            return Response({"detail": RESET_INVALID}, status=status.HTTP_400_BAD_REQUEST)
        try:
            validate_password(data["password"], user)
        except DjangoValidationError as error:
            return Response({"password": list(error.messages)}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(data["password"])
        user.save(update_fields=["password"])
        return Response({"detail": "Your password has been reset. You can now sign in."})
