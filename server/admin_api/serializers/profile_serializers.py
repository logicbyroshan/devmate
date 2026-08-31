"""
User Profile and Details Serializers for Admin API.
"""

from rest_framework import serializers
from portfolio.models import UserProfile
from admin_api.utils.security import sanitize_html, validate_uploaded_image, validate_uploaded_document


class AdminUserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            "id",
            "full_name",
            "email",
            "phone",
            "location",
            "title",
            "bio",
            "profile_image",
            "hero_image",
            "hero_badge",
            "hero_description",
            "hero_stat_1_value",
            "hero_stat_1_label",
            "hero_stat_1_icon",
            "hero_stat_2_value",
            "hero_stat_2_label",
            "hero_stat_2_icon",
            "hero_stat_3_value",
            "hero_stat_3_label",
            "hero_stat_3_icon",
            "github",
            "linkedin",
            "twitter",
            "instagram",
            "youtube",
            "website",
            "resume",
            "cover_letter",
            "video_resume",
            "meta_title",
            "meta_description",
            "meta_keywords",
            "status",
            "work_type",
            "hourly_rate",
            "experience_years",
            "open_to_opportunities",
            "available_for_freelance",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_profile_image(self, value):
        if value:
            validate_uploaded_image(value)
        return value

    def validate_hero_image(self, value):
        if value:
            validate_uploaded_image(value)
        return value

    def validate_resume(self, value):
        if value:
            validate_uploaded_document(value)
        return value

    def validate_cover_letter(self, value):
        if value:
            validate_uploaded_document(value)
        return value

    def validate_bio(self, value):
        return sanitize_html(value)
