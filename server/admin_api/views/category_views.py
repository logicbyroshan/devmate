"""
Admin Category Management ViewSet.
"""

from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from portfolio.models import Category
from admin_api.permissions import IsStaffUser
from admin_api.serializers.category_serializers import AdminCategorySerializer
from admin_api.utils.pagination import AdminStandardPagination


class AdminCategoryViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Category Management.
    GET /api/v1/admin/categories/ - List categories (filterable by type)
    POST /api/v1/admin/categories/ - Create new category
    GET /api/v1/admin/categories/{id}/ - Retrieve category
    PUT/PATCH /api/v1/admin/categories/{id}/ - Update category
    DELETE /api/v1/admin/categories/{id}/ - Delete category
    """

    serializer_class = AdminCategorySerializer
    permission_classes = [IsStaffUser]
    pagination_class = AdminStandardPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "slug", "description"]
    ordering_fields = ["name", "category_type", "created_at"]
    ordering = ["category_type", "name"]

    def get_queryset(self):
        qs = Category.objects.all()
        cat_type = self.request.query_params.get("type")
        if cat_type:
            qs = qs.filter(category_type=cat_type)
        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            {
                "success": True,
                "message": f"Category '{serializer.data.get('name')}' created successfully!",
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
                "message": f"Category '{serializer.data.get('name')}' updated successfully!",
                "data": serializer.data,
            }
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        name = instance.name
        self.perform_destroy(instance)
        return Response(
            {
                "success": True,
                "message": f"Category '{name}' deleted successfully.",
            },
            status=status.HTTP_200_OK,
        )
