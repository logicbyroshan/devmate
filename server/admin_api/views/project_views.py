"""
Admin Project Management ViewSet with Screenshot and Bulk Action Support.
"""

from django.db import transaction
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from portfolio.models import Project, ProjectScreenshot
from admin_api.permissions import IsStaffUser
from admin_api.serializers.project_serializers import (
    AdminProjectSerializer,
    AdminProjectScreenshotSerializer,
    ProjectReorderSerializer,
    ProjectBulkStatusSerializer,
)
from admin_api.utils.pagination import AdminStandardPagination
from admin_api.utils.security import validate_uploaded_image


class AdminProjectViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Project Management.
    GET /api/v1/admin/projects/ - List all projects (drafts + active)
    POST /api/v1/admin/projects/ - Create new project (supports multipart + screenshots)
    GET /api/v1/admin/projects/{id}/ - Retrieve single project
    PUT/PATCH /api/v1/admin/projects/{id}/ - Update project
    DELETE /api/v1/admin/projects/{id}/ - Delete project

    Custom Actions:
    POST /api/v1/admin/projects/{id}/upload-screenshots/ - Upload screenshots
    DELETE /api/v1/admin/projects/{id}/screenshots/{screenshot_id}/ - Delete single screenshot
    POST /api/v1/admin/projects/reorder/ - Reorder projects
    POST /api/v1/admin/projects/bulk-status/ - Bulk update status / active flags
    POST /api/v1/admin/projects/{id}/toggle-active/ - Fast toggle active state
    """

    serializer_class = AdminProjectSerializer
    permission_classes = [IsStaffUser]
    pagination_class = AdminStandardPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "project_name", "description", "technologies"]
    ordering_fields = ["order", "created_at", "title", "views", "likes", "start_date"]
    ordering = ["-order", "-created_at"]

    def get_queryset(self):
        qs = Project.objects.select_related("category").prefetch_related("screenshots").all()
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)

        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            qs = qs.filter(is_active=str(is_active).lower() in {"1", "true", "yes"})

        is_featured = self.request.query_params.get("is_featured")
        if is_featured is not None:
            qs = qs.filter(is_featured=str(is_featured).lower() in {"1", "true", "yes"})

        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category__slug=category)

        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            project = serializer.save()

            # Process any attached screenshot files in multipart payload
            screenshot_files = request.FILES.getlist("screenshots")
            for index, s_file in enumerate(screenshot_files):
                validate_uploaded_image(s_file)
                ProjectScreenshot.objects.create(
                    project=project,
                    image=s_file,
                    order=index,
                )

        # Refresh project instance to include screenshots
        project.refresh_from_db()
        response_serializer = self.get_serializer(project)
        headers = self.get_success_headers(response_serializer.data)

        return Response(
            {
                "success": True,
                "message": f"Project '{project.title}' created successfully!",
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
            project = serializer.save()

            # Process replacement screenshots if provided
            screenshot_files = request.FILES.getlist("screenshots")
            if screenshot_files:
                # Append new screenshots
                current_count = project.screenshots.count()
                for index, s_file in enumerate(screenshot_files):
                    validate_uploaded_image(s_file)
                    ProjectScreenshot.objects.create(
                        project=project,
                        image=s_file,
                        order=current_count + index,
                    )

        project.refresh_from_db()
        response_serializer = self.get_serializer(project)

        return Response(
            {
                "success": True,
                "message": f"Project '{project.title}' updated successfully!",
                "data": response_serializer.data,
            }
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        title = instance.title
        self.perform_destroy(instance)
        return Response(
            {
                "success": True,
                "message": f"Project '{title}' deleted successfully.",
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"], url_path="upload-screenshots")
    def upload_screenshots(self, request, pk=None):
        """Upload one or more screenshots to an existing project."""
        project = self.get_object()
        files = request.FILES.getlist("screenshots")
        if not files:
            return Response(
                {"success": False, "message": "No screenshot files provided in 'screenshots' field."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        created_screenshots = []
        with transaction.atomic():
            start_order = project.screenshots.count()
            for index, f in enumerate(files):
                validate_uploaded_image(f)
                screenshot = ProjectScreenshot.objects.create(
                    project=project,
                    image=f,
                    order=start_order + index,
                )
                created_screenshots.append(screenshot)

        serializer = AdminProjectScreenshotSerializer(created_screenshots, many=True)
        return Response(
            {
                "success": True,
                "message": f"Uploaded {len(created_screenshots)} screenshot(s) successfully.",
                "screenshots": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["delete"], url_path=r"screenshots/(?P<screenshot_id>\d+)")
    def delete_screenshot(self, request, pk=None, screenshot_id=None):
        """Delete a specific screenshot from the project."""
        project = self.get_object()
        try:
            screenshot = project.screenshots.get(id=screenshot_id)
            screenshot.delete()
            return Response(
                {"success": True, "message": f"Screenshot {screenshot_id} removed successfully."},
                status=status.HTTP_200_OK,
            )
        except ProjectScreenshot.DoesNotExist:
            return Response(
                {"success": False, "message": "Screenshot not found for this project."},
                status=status.HTTP_404_NOT_FOUND,
            )

    @action(detail=True, methods=["post"], url_path="toggle-active")
    def toggle_active(self, request, pk=None):
        """Toggle project active status."""
        project = self.get_object()
        project.is_active = not project.is_active
        project.save(update_fields=["is_active", "updated_at"])
        return Response(
            {
                "success": True,
                "message": f"Project is now {'active' if project.is_active else 'inactive'}.",
                "is_active": project.is_active,
            }
        )

    @action(detail=False, methods=["post"])
    def reorder(self, request):
        """Reorder multiple projects by ID."""
        serializer = ProjectReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order_map = serializer.validated_data["order_map"]

        with transaction.atomic():
            for project_id_str, new_order in order_map.items():
                Project.objects.filter(id=int(project_id_str)).update(order=new_order)

        return Response(
            {"success": True, "message": "Project order updated successfully."},
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["post"], url_path="bulk-status")
    def bulk_status(self, request):
        """Bulk update project status or visibility flags."""
        serializer = ProjectBulkStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        project_ids = serializer.validated_data["project_ids"]
        update_fields = {}

        if "status" in serializer.validated_data:
            update_fields["status"] = serializer.validated_data["status"]
        if "is_active" in serializer.validated_data:
            update_fields["is_active"] = serializer.validated_data["is_active"]
        if "is_featured" in serializer.validated_data:
            update_fields["is_featured"] = serializer.validated_data["is_featured"]

        if not update_fields:
            return Response(
                {"success": False, "message": "No update attributes specified."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        updated_count = Project.objects.filter(id__in=project_ids).update(**update_fields)
        return Response(
            {
                "success": True,
                "message": f"Successfully updated {updated_count} project(s).",
                "updated_count": updated_count,
            }
        )
