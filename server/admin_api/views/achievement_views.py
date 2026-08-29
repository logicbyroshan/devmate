"""
Admin Achievement Management ViewSet.
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from portfolio.models import Achievement
from admin_api.permissions import IsStaffUser
from admin_api.serializers.achievement_serializers import AdminAchievementSerializer
from admin_api.utils.pagination import AdminStandardPagination


class AdminAchievementViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Achievement Management.
    GET /api/v1/admin/achievements/ - List achievements
    POST /api/v1/admin/achievements/ - Create new achievement
    GET /api/v1/admin/achievements/{id}/ - Retrieve achievement
    PUT/PATCH /api/v1/admin/achievements/{id}/ - Update achievement
    DELETE /api/v1/admin/achievements/{id}/ - Delete achievement
    """

    serializer_class = AdminAchievementSerializer
    permission_classes = [IsStaffUser]
    pagination_class = AdminStandardPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "issuing_organization", "short_description"]
    ordering_fields = ["order", "achievement_date", "created_at", "title"]
    ordering = ["-achievement_date", "title"]

    def get_queryset(self):
        qs = Achievement.objects.select_related("category").all()
        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            qs = qs.filter(is_active=str(is_active).lower() in {"1", "true", "yes"})

        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            {
                "success": True,
                "message": f"Achievement '{serializer.data.get('title')}' created successfully!",
                "data": serializer.data,
            },
            status=status.HTTP_201_CREATED,
            headers=headers,
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(
            {
                "success": True,
                "message": f"Achievement '{serializer.data.get('title')}' updated successfully!",
                "data": serializer.data,
            }
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        title = instance.title
        self.perform_destroy(instance)
        return Response(
            {"success": True, "message": f"Achievement '{title}' deleted successfully."},
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"], url_path="toggle-active")
    def toggle_active(self, request, pk=None):
        """Toggle achievement active status."""
        achievement = self.get_object()
        achievement.is_active = not achievement.is_active
        achievement.save(update_fields=["is_active", "updated_at"])
        return Response(
            {
                "success": True,
                "message": f"Achievement is now {'active' if achievement.is_active else 'inactive'}.",
                "is_active": achievement.is_active,
            }
        )
