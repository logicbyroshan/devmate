"""
Contact Message Serializers for Admin API.
"""

from rest_framework import serializers
from portfolio.models import ContactMessage


class AdminContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = [
            "id",
            "full_name",
            "email",
            "message",
            "is_urgent",
            "source",
            "ip_address",
            "user_agent",
            "is_read",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "full_name",
            "email",
            "message",
            "is_urgent",
            "source",
            "ip_address",
            "user_agent",
            "created_at",
        ]


class MessageBulkActionSerializer(serializers.Serializer):
    message_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False
    )
    action = serializers.ChoiceField(
        choices=["mark_read", "mark_unread", "delete"]
    )
