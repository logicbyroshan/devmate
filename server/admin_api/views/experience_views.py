"""
Admin Experience Management ViewSet.
"""

from django.db import transaction
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from portfolio.models import Experience, ExperienceImage
from admin_api.permissions import IsStaffUser
from admin_api.serializers.experience_serializers import (
    AdminExperienceSerializer,
    AdminExperienceImageSerializer,
)
from admin_api.utils.pagination import AdminStandardPagination
from admin_api.utils.security import validate_uploaded_image


class AdminExperienceViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Work Experience Management.
    GET /api/v1/admin/experience/ - List experiences
    POST /api/v1/admin/experience/ - Create new experience
    GET /api/v1/admin/experience/{id}/ - Retrieve experience
    PUT/PATCH /api/v1/admin/experience/{id}/ - Update experience
    DELETE /api/v1/admin/experience/{id}/ - Delete experience
    """

    serializer_class = AdminExperienceSerializer
    permission_classes = [IsStaffUser]
    pagination_class = AdminStandardPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["position", "company_name", "short_description", "location"]
    ordering_fields = ["order", "start_date", "created_at"]
    ordering = ["-order", "-start_date"]

    def get_queryset(self):
        qs = Experience.objects.select_related("category").prefetch_related("images").all()
        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            qs = qs.filter(is_active=str(is_active).lower() in {"1", "true", "yes"})

        is_draft = self.request.query_params.get("is_draft")
        if is_draft is not None:
            qs = qs.filter(is_draft=str(is_draft).lower() in {"1", "true", "yes"})

        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            experience = serializer.save()

            # Process attached workplace images
            workplace_files = request.FILES.getlist("workplace_images")
            for index, f in enumerate(workplace_files):
                validate_uploaded_image(f)
                ExperienceImage.objects.create(
                    experience=experience,
                    image=f,
                    order=index,
                )

        experience.refresh_from_db()
        response_serializer = self.get_serializer(experience)
        headers = self.get_success_headers(response_serializer.data)

        return Response(
            {
                "success": True,
                "message": f"Experience '{experience.position}' created successfully!",
                "data": response_serializer.data,
            },
            status=status.HTTP_201_CREATED,
            headers=headers,
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            experience = serializer.save()

            workplace_files = request.FILES.getlist("workplace_images")
            if workplace_files:
                start_order = experience.images.count()
                for index, f in enumerate(workplace_files):
                    validate_uploaded_image(f)
                    ExperienceImage.objects.create(
                        experience=experience,
                        image=f,
                        order=start_order + index,
                    )

        experience.refresh_from_db()
        response_serializer = self.get_serializer(experience)

        return Response(
            {
                "success": True,
                "message": f"Experience '{experience.position}' updated successfully!",
                "data": response_serializer.data,
            }
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        pos = instance.position
        self.perform_destroy(instance)
        return Response(
            {"success": True, "message": f"Experience '{pos}' deleted successfully."},
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"], url_path="toggle-active")
    def toggle_active(self, request, pk=None):
        """Toggle experience active status."""
        experience = self.get_object()
        experience.is_active = not experience.is_active
        experience.save(update_fields=["is_active", "updated_at"])
        return Response(
            {
                "success": True,
                "message": f"Experience is now {'active' if experience.is_active else 'inactive'}.",
                "is_active": experience.is_active,
            }
        )

    @action(detail=True, methods=["delete"], url_path=r"images/(?P<image_id>\d+)")
    def delete_image(self, request, pk=None, image_id=None):
        """Delete an attached workplace image."""
        experience = self.get_object()
        try:
            img = experience.images.get(id=image_id)
            img.delete()
            return Response(
                {"success": True, "message": "Workplace image removed."},
                status=status.HTTP_200_OK,
            )
        except ExperienceImage.DoesNotExist:
            return Response(
                {"success": False, "message": "Image not found for this experience."},
                status=status.HTTP_404_NOT_FOUND,
            )
