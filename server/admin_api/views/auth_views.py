"""
Admin Authentication and Staff Session API Views.
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenRefreshView

from admin_api.permissions import IsStaffUser
from admin_api.serializers.auth_serializers import (
    AdminLoginSerializer,
    StaffUserSerializer,
)


@api_view(["POST"])
@permission_classes([AllowAny])
def admin_login(request):
    """
    POST /api/v1/admin/auth/login/
    Staff authentication endpoint. Returns JWT token pair.
    """
    serializer = AdminLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data["user"]
        return Response(
            {
                "success": True,
                "message": f"Welcome back, {user.get_full_name() or user.username}!",
                "access": serializer.validated_data["access"],
                "refresh": serializer.validated_data["refresh"],
                "user": StaffUserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )
    return Response(
        {"success": False, "errors": serializer.errors},
        status=status.HTTP_400_BAD_REQUEST,
    )


@api_view(["GET"])
@permission_classes([IsStaffUser])
def admin_me(request):
    """
    GET /api/v1/admin/auth/me/
    Returns current authenticated staff user profile.
    """
    serializer = StaffUserSerializer(request.user)
    return Response(
        {"success": True, "user": serializer.data},
        status=status.HTTP_200_OK,
    )
