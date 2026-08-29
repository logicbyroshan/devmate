"""
Achievement and Credential Serializers for Admin API.
"""

from rest_framework import serializers
from portfolio.models import Achievement, Category
from admin_api.serializers.category_serializers import AdminCategorySerializer
from admin_api.utils.security import sanitize_html, validate_uploaded_document


class AdminAchievementSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False, allow_blank=True)
    short_description = serializers.CharField(required=False, allow_blank=True, default="")
    category_detail = AdminCategorySerializer(source="category", read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.filter(category_type="achievement"),
        source="category",
        required=False,
        allow_null=True,
    )
    icon = serializers.SerializerMethodField()

    class Meta:
        model = Achievement
        fields = [
            "id",
            "title",
            "slug",
            "category",
            "category_id",
            "category_detail",
            "icon",
            "issuing_organization",
            "achievement_date",
            "expiration_date",
            "no_expiration",
            "short_description",
            "full_description",
            "credential_type",
            "credential_file",
            "credential_url",
            "credential_id",
            "related_link",
            "is_active",
            "is_draft",
            "order",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "category",
            "icon",
            "created_at",
            "updated_at",
        ]

    def get_icon(self, obj):
        return obj.get_icon()

    def validate_credential_file(self, value):
        if value:
            validate_uploaded_document(value)
        return value

    def validate_short_description(self, value):
        return sanitize_html(value)

    def validate_full_description(self, value):
        return sanitize_html(value)

    def validate(self, attrs):
        if attrs.get("no_expiration"):
            attrs["expiration_date"] = None
        return attrs
