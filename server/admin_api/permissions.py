"""
Custom Permission Classes for Admin REST API.
Enforces role-based access control, active account verification,
and superuser constraints for maximum security.
"""

from rest_framework import permissions


class IsStaffUser(permissions.BasePermission):
    """
    Allows access only to authenticated staff users.
    Anonymous or regular users receive 401/403.
    """

    message = "Staff administrator privileges required to access this endpoint."

    def has_permission(self, request, view):
        user = getattr(request, "user", None)
        return bool(
            user and user.is_authenticated and user.is_active and user.is_staff
        )


class IsSuperUser(permissions.BasePermission):
    """
    Allows access only to superusers.
    Used for destructive operations such as bulk purges or system settings.
    """

    message = "Superuser privileges required to perform this action."

    def has_permission(self, request, view):
        user = getattr(request, "user", None)
        return bool(
            user and user.is_authenticated and user.is_active and user.is_superuser
        )
