"""
Experience and Workplace Image Serializers for Admin API.
"""

from rest_framework import serializers
from portfolio.models import Experience, ExperienceImage, Category
from admin_api.serializers.category_serializers import AdminCategorySerializer
from admin_api.utils.security import sanitize_html, validate_uploaded_image


class AdminExperienceImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExperienceImage
        fields = ["id", "experience", "image", "caption", "order"]
        read_only_fields = ["id"]

    def validate_image(self, value):
        if value:
            validate_uploaded_image(value)
        return value


class AdminExperienceSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False, allow_blank=True)
    category_detail = AdminCategorySerializer(source="category", read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.filter(category_type="experience"),
        source="category",
        required=False,
        allow_null=True,
    )
    images = AdminExperienceImageSerializer(many=True, read_only=True)
    duration = serializers.CharField(read_only=True)

    class Meta:
        model = Experience
        fields = [
            "id",
            "position",
            "slug",
            "employment_type",
            "employment_status",
            "category",
            "category_id",
            "category_detail",
            "location",
            "company_name",
            "company_about",
            "company_website",
            "company_logo",
            "start_date",
            "end_date",
            "currently_working",
            "duration",
            "short_description",
            "detailed_description",
            "is_active",
            "is_draft",
            "order",
            "images",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "category",
            "duration",
            "created_at",
            "updated_at",
        ]

    def validate_company_logo(self, value):
        if value:
            validate_uploaded_image(value)
        return value

    def validate_short_description(self, value):
        return sanitize_html(value)

    def validate_detailed_description(self, value):
        return sanitize_html(value)

    def validate(self, attrs):
        if attrs.get("currently_working"):
            attrs["end_date"] = None
        return attrs
