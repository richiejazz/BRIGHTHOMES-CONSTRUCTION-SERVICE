from drf_spectacular.utils import extend_schema
from rest_framework import generics
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import AvatarUploadSerializer, RegisterSerializer, UserSerializer


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
