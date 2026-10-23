from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .avatars import process_avatar
from .models import User

PHONE_PATTERN = r"^[+\d][\d\s()-]{6,}$"


class UserSerializer(serializers.ModelSerializer):
    phone = serializers.RegexField(PHONE_PATTERN, max_length=40, required=False, allow_blank=True, error_messages={"invalid": "Please enter a valid phone number."})

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "phone", "avatar", "role", "date_joined"]
        read_only_fields = ["id", "email", "avatar", "role", "date_joined"]


class AvatarUploadSerializer(serializers.Serializer):
    avatar = serializers.FileField()

    def validate_avatar(self, upload):
        return process_avatar(upload)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, trim_whitespace=False, style={"input_type": "password"})
    # Optional; international numbers are accepted (spec: diaspora-friendly).
    phone = serializers.RegexField(PHONE_PATTERN, max_length=40, required=False, allow_blank=True, error_messages={"invalid": "Please enter a valid phone number."})

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "phone", "password"]
        read_only_fields = ["id"]
        # Uniqueness is checked case-insensitively in validate_email instead of the default validator.
        extra_kwargs = {"email": {"validators": []}, "first_name": {"required": True, "allow_blank": False}, "last_name": {"required": True, "allow_blank": False}}

    def validate_email(self, value):
        email = User.objects.normalize_email(value)
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("An account with this email address already exists.")
        return email

    def validate(self, attrs):
        candidate = User(email=attrs.get("email"), first_name=attrs.get("first_name", ""), last_name=attrs.get("last_name", ""))
        try:
            validate_password(attrs["password"], candidate)
        except DjangoValidationError as error:
            raise serializers.ValidationError({"password": list(error.messages)})
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(role=User.Role.CLIENT, **validated_data)


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    password = serializers.CharField(trim_whitespace=False, style={"input_type": "password"})
