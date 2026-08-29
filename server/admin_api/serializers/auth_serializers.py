"""
Authentication and Staff User Serializers for Admin API.
"""

from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class AdminLoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        username = attrs.get("username", "").strip()
        password = attrs.get("password", "")

        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError("Invalid username or password.")

        if not user.is_active:
            raise serializers.ValidationError("This account has been disabled.")

        if not user.is_staff:
            raise serializers.ValidationError(
                "Access denied. Staff administrator privileges required."
            )

        refresh = RefreshToken.for_user(user)

        return {
            "user": user,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }


class StaffUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_staff",
            "is_superuser",
            "last_login",
            "date_joined",
        ]
        read_only_fields = fields
