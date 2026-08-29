"""
Skill and Certification Serializers for Admin API.
"""

from rest_framework import serializers
from portfolio.models import Skill, Category
from admin_api.serializers.category_serializers import AdminCategorySerializer
from admin_api.utils.security import sanitize_html, validate_uploaded_image, validate_uploaded_document


class AdminSkillSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False, allow_blank=True)
    category_detail = AdminCategorySerializer(source="category", read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.filter(category_type="skill"),
        source="category",
        required=False,
        allow_null=True,
    )
    skill_level_display = serializers.CharField(
        source="get_skill_level_display", read_only=True
    )

    class Meta:
        model = Skill
        fields = [
            "id",
            "name",
            "slug",
            "skill_level",
            "skill_level_display",
            "category",
            "category_id",
            "category_detail",
            "proficiency",
            "description",
            "icon_type",
            "icon_image",
            "icon_class",
            "certificate_type",
            "certificate_file",
            "certificate_url",
            "is_active",
            "is_draft",
            "order",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "category",
            "created_at",
            "updated_at",
        ]

    def validate_proficiency(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Proficiency must be an integer between 0 and 100.")
        return value

    def validate_icon_image(self, value):
        if value:
            validate_uploaded_image(value)
        return value

    def validate_certificate_file(self, value):
        if value:
            validate_uploaded_document(value)
        return value

    def validate_description(self, value):
        return sanitize_html(value)
