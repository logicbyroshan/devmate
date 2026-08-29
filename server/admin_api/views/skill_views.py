"""
Admin Skill Management ViewSet.
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from portfolio.models import Skill
from admin_api.permissions import IsStaffUser
from admin_api.serializers.skill_serializers import AdminSkillSerializer
from admin_api.utils.pagination import AdminStandardPagination


class AdminSkillViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Skill Management.
    GET /api/v1/admin/skills/ - List skills
    POST /api/v1/admin/skills/ - Create new skill
    GET /api/v1/admin/skills/{id}/ - Retrieve skill
    PUT/PATCH /api/v1/admin/skills/{id}/ - Update skill
    DELETE /api/v1/admin/skills/{id}/ - Delete skill
    """

    serializer_class = AdminSkillSerializer
    permission_classes = [IsStaffUser]
    pagination_class = AdminStandardPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["order", "proficiency", "name", "created_at"]
    ordering = ["-proficiency", "name"]

    def get_queryset(self):
        qs = Skill.objects.select_related("category").all()
        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            qs = qs.filter(is_active=str(is_active).lower() in {"1", "true", "yes"})

        level = self.request.query_params.get("level")
        if level:
            qs = qs.filter(skill_level=level)

        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            {
                "success": True,
                "message": f"Skill '{serializer.data.get('name')}' created successfully!",
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
                "message": f"Skill '{serializer.data.get('name')}' updated successfully!",
                "data": serializer.data,
            }
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        name = instance.name
        self.perform_destroy(instance)
        return Response(
            {"success": True, "message": f"Skill '{name}' deleted successfully."},
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"], url_path="toggle-active")
    def toggle_active(self, request, pk=None):
        """Toggle skill active status."""
        skill = self.get_object()
        skill.is_active = not skill.is_active
        skill.save(update_fields=["is_active", "updated_at"])
        return Response(
            {
                "success": True,
                "message": f"Skill is now {'active' if skill.is_active else 'inactive'}.",
                "is_active": skill.is_active,
            }
        )
