"""
Dashboard & Analytics Serializers for Admin API.
"""

from rest_framework import serializers


class AdminDashboardStatsSerializer(serializers.Serializer):
    total_projects = serializers.IntegerField()
    active_projects = serializers.IntegerField()
    draft_projects = serializers.IntegerField()
    featured_projects = serializers.IntegerField()

    total_experience = serializers.IntegerField()
    active_experience = serializers.IntegerField()

    total_skills = serializers.IntegerField()
    active_skills = serializers.IntegerField()

    total_achievements = serializers.IntegerField()
    active_achievements = serializers.IntegerField()

    total_categories = serializers.IntegerField()
    total_messages = serializers.IntegerField()
    unread_messages = serializers.IntegerField()

    total_project_views = serializers.IntegerField()
    total_project_likes = serializers.IntegerField()
