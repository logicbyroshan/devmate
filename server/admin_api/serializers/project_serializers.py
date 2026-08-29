"""
Project and Screenshot Serializers for Admin API.
"""

from rest_framework import serializers
from portfolio.models import Project, ProjectScreenshot, Category
from admin_api.serializers.category_serializers import AdminCategorySerializer
from admin_api.utils.security import sanitize_html, validate_uploaded_image


class AdminProjectScreenshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectScreenshot
        fields = ["id", "project", "image", "caption", "order", "uploaded_at"]
        read_only_fields = ["id", "uploaded_at"]

    def validate_image(self, value):
        if value:
            validate_uploaded_image(value)
        return value


class AdminProjectSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False, allow_blank=True)
    category_detail = AdminCategorySerializer(source="category", read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.filter(category_type="project"),
        source="category",
        required=False,
        allow_null=True,
    )
    screenshots = AdminProjectScreenshotSerializer(many=True, read_only=True)
    technologies_list = serializers.ListField(source="tech_list", read_only=True)

    class Meta:
        model = Project
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "project_name",
            "documentation",
            "category",
            "category_id",
            "category_detail",
            "technologies",
            "technologies_list",
            "thumbnail",
            "github_url",
            "live_url",
            "demo_url",
            "other_url",
            "start_date",
            "end_date",
            "client",
            "status",
            "is_active",
            "is_featured",
            "views",
            "likes",
            "order",
            "screenshots",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "views",
            "likes",
            "category",
            "created_at",
            "updated_at",
        ]

    def validate_thumbnail(self, value):
        if value:
            validate_uploaded_image(value)
        return value

    def validate_description(self, value):
        return sanitize_html(value)

    def validate_documentation(self, value):
        return sanitize_html(value)


class ProjectReorderSerializer(serializers.Serializer):
    order_map = serializers.DictField(
        child=serializers.IntegerField(min_value=0),
        help_text="Dictionary mapping project ID to integer order index (e.g. {'1': 0, '2': 1})"
    )


class ProjectBulkStatusSerializer(serializers.Serializer):
    project_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False
    )
    status = serializers.ChoiceField(
        choices=Project.STATUS_CHOICES,
        required=False
    )
    is_active = serializers.BooleanField(required=False)
    is_featured = serializers.BooleanField(required=False)
