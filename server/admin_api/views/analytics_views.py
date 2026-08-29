"""
Admin Dashboard & Analytics API Views.
"""

from django.db.models import Sum
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from portfolio.models import (
    Project,
    Experience,
    Skill,
    Achievement,
    Category,
    ContactMessage,
)
from admin_api.permissions import IsStaffUser


@api_view(["GET"])
@permission_classes([IsStaffUser])
def admin_dashboard_analytics(request):
    """
    GET /api/v1/admin/analytics/dashboard/
    Aggregate statistics for admin dashboard widgets and graphs.
    """
    project_views = Project.objects.aggregate(total_views=Sum("views"))["total_views"] or 0
    project_likes = Project.objects.aggregate(total_likes=Sum("likes"))["total_likes"] or 0

    stats = {
        "projects": {
            "total": Project.objects.count(),
            "active": Project.objects.filter(is_active=True).count(),
            "drafts": Project.objects.filter(status="draft").count(),
            "featured": Project.objects.filter(is_featured=True).count(),
            "total_views": project_views,
            "total_likes": project_likes,
        },
        "experience": {
            "total": Experience.objects.count(),
            "active": Experience.objects.filter(is_active=True, is_draft=False).count(),
        },
        "skills": {
            "total": Skill.objects.count(),
            "active": Skill.objects.filter(is_active=True, is_draft=False).count(),
        },
        "achievements": {
            "total": Achievement.objects.count(),
            "active": Achievement.objects.filter(is_active=True, is_draft=False).count(),
        },
        "categories": {
            "total": Category.objects.count(),
        },
        "messages": {
            "total": ContactMessage.objects.count(),
            "unread": ContactMessage.objects.filter(is_read=False).count(),
            "urgent": ContactMessage.objects.filter(is_urgent=True, is_read=False).count(),
        },
        "recent_activity": {
            "recent_projects": list(
                Project.objects.order_by("-created_at").values("id", "title", "status", "created_at")[:5]
            ),
            "recent_messages": list(
                ContactMessage.objects.order_by("-created_at").values(
                    "id", "full_name", "email", "is_urgent", "is_read", "created_at"
                )[:5]
            ),
        },
    }

    return Response({"success": True, "data": stats})
