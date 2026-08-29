"""
Admin Contact Message Views.
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from portfolio.models import ContactMessage
from admin_api.permissions import IsStaffUser
from admin_api.serializers.message_serializers import (
    AdminContactMessageSerializer,
    MessageBulkActionSerializer,
)
from admin_api.utils.pagination import AdminStandardPagination


class AdminContactMessageViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Contact Messages Inbox.
    GET /api/v1/admin/messages/ - List messages (filter by is_read, search)
    GET /api/v1/admin/messages/{id}/ - Retrieve single message
    DELETE /api/v1/admin/messages/{id}/ - Delete message
    POST /api/v1/admin/messages/{id}/toggle-read/ - Toggle read status
    POST /api/v1/admin/messages/bulk-action/ - Bulk mark read/unread/delete
    """

    serializer_class = AdminContactMessageSerializer
    permission_classes = [IsStaffUser]
    pagination_class = AdminStandardPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["full_name", "email", "message"]
    ordering_fields = ["created_at", "is_urgent", "is_read"]
    ordering = ["-created_at"]
    http_method_names = ["get", "delete", "post", "head", "options"]

    def get_queryset(self):
        qs = ContactMessage.objects.all()
        is_read = self.request.query_params.get("is_read")
        if is_read is not None:
            qs = qs.filter(is_read=str(is_read).lower() in {"1", "true", "yes"})

        is_urgent = self.request.query_params.get("is_urgent")
        if is_urgent is not None:
            qs = qs.filter(is_urgent=str(is_urgent).lower() in {"1", "true", "yes"})

        return qs

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Automatically mark as read on retrieve
        if not instance.is_read:
            instance.is_read = True
            instance.save(update_fields=["is_read"])
        serializer = self.get_serializer(instance)
        return Response({"success": True, "data": serializer.data})

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"success": True, "message": "Message deleted."},
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"], url_path="toggle-read")
    def toggle_read(self, request, pk=None):
        """Toggle message read/unread state."""
        message = self.get_object()
        message.is_read = not message.is_read
        message.save(update_fields=["is_read"])
        return Response(
            {
                "success": True,
                "message": f"Message marked as {'read' if message.is_read else 'unread'}.",
                "is_read": message.is_read,
            }
        )

    @action(detail=False, methods=["post"], url_path="bulk-action")
    def bulk_action(self, request):
        """Bulk mark read/unread or delete contact messages."""
        serializer = MessageBulkActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        message_ids = serializer.validated_data["message_ids"]
        action_type = serializer.validated_data["action"]

        if action_type == "mark_read":
            updated = ContactMessage.objects.filter(id__in=message_ids).update(is_read=True)
            msg = f"Marked {updated} messages as read."
        elif action_type == "mark_unread":
            updated = ContactMessage.objects.filter(id__in=message_ids).update(is_read=False)
            msg = f"Marked {updated} messages as unread."
        elif action_type == "delete":
            deleted_count, _ = ContactMessage.objects.filter(id__in=message_ids).delete()
            msg = f"Deleted {deleted_count} messages."
        else:
            return Response(
                {"success": False, "message": "Unknown action."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response({"success": True, "message": msg})
