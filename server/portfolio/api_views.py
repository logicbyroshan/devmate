"""
REST API Views and Endpoints for Portfolio.
Consumes the modular Service Layer for clean separation of concerns,
high performance, and strict security.
"""

from django.db import connection
from django.middleware.csrf import get_token
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .serializers import (
    AchievementSerializer,
    CategorySerializer,
    ContactMessageCreateSerializer,
    ExperienceSerializer,
    PortfolioSummarySerializer,
    ProjectSerializer,
    SkillSerializer,
    UserProfileSerializer,
)
from .services import (
    ContactMessageService,
    InteractionService,
    PortfolioQueryService,
    RexiChatService,
    SecurityService,
)


class ReadOnlyPermission(permissions.BasePermission):
    """Allow safe methods (GET, HEAD, OPTIONS) only."""

    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS


class APIKeyPermission(permissions.BasePermission):
    """
    Optional API Key permission.
    Verifies X-API-Key header using constant-time comparison.
    """

    def has_permission(self, request, view):
        return SecurityService.verify_api_key(request)


# ── Model ViewSets (Read Only) ─────────────────────────────────────────


class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for Projects.
    GET /api/v1/projects/ - List active projects (filterable by category, status, featured)
    GET /api/v1/projects/{slug}/ - Retrieve single project by slug
    GET /api/v1/projects/featured/ - Retrieve top featured projects
    POST /api/v1/projects/{slug}/like/ - Increment project likes counter
    POST /api/v1/projects/{slug}/view/ - Increment project views counter
    """

    serializer_class = ProjectSerializer
    permission_classes = [ReadOnlyPermission, APIKeyPermission]
    lookup_field = "slug"

    def get_queryset(self):
        category = self.request.query_params.get("category", None)
        status_filter = self.request.query_params.get("status", None)
        featured = self.request.query_params.get("featured", None)

        is_featured = None
        if featured is not None:
            is_featured = str(featured).lower() in {"1", "true", "yes"}

        return PortfolioQueryService.get_projects_queryset(
            category_slug=category,
            status_filter=status_filter,
            is_featured=is_featured,
            active_only=True,
        )

    @action(detail=False, methods=["get"])
    def featured(self, request):
        """Retrieve top 6 featured active projects."""
        projects = PortfolioQueryService.get_projects_queryset(
            is_featured=True, active_only=True
        )[:6]
        serializer = self.get_serializer(projects, many=True)
        return Response(serializer.data)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[AllowAny],
    )
    def like(self, request, slug=None):
        """Increment like count for project."""
        success, count = InteractionService.increment_likes(slug)
        if success:
            return Response({"success": True, "likes": count})
        return Response(
            {"success": False, "message": "Project not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[AllowAny],
    )
    def view(self, request, slug=None):
        """Increment view count for project."""
        success, count = InteractionService.increment_views(slug)
        if success:
            return Response({"success": True, "views": count})
        return Response(
            {"success": False, "message": "Project not found"},
            status=status.HTTP_404_NOT_FOUND,
        )


class ExperienceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for Work Experience.
    GET /api/v1/experience/ - List all active experiences
    GET /api/v1/experience/{slug}/ - Retrieve single experience by slug
    """

    serializer_class = ExperienceSerializer
    permission_classes = [ReadOnlyPermission, APIKeyPermission]
    lookup_field = "slug"

    def get_queryset(self):
        employment_type = self.request.query_params.get("employment_type", None)
        category = self.request.query_params.get("category", None)
        return PortfolioQueryService.get_experiences_queryset(
            employment_type=employment_type,
            category_slug=category,
            active_only=True,
        )


class SkillViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for Skills.
    GET /api/v1/skills/ - List all active skills
    GET /api/v1/skills/{slug}/ - Retrieve single skill by slug
    GET /api/v1/skills/top/ - Retrieve top 10 skills by proficiency
    """

    serializer_class = SkillSerializer
    permission_classes = [ReadOnlyPermission, APIKeyPermission]
    lookup_field = "slug"

    def get_queryset(self):
        level = self.request.query_params.get("level", None)
        category = self.request.query_params.get("category", None)
        return PortfolioQueryService.get_skills_queryset(
            level=level,
            category_slug=category,
            active_only=True,
        )

    @action(detail=False, methods=["get"])
    def top(self, request):
        """Retrieve top 10 skills by proficiency."""
        skills = self.get_queryset()[:10]
        serializer = self.get_serializer(skills, many=True)
        return Response(serializer.data)


class AchievementViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for Achievements.
    GET /api/v1/achievements/ - List all active achievements
    GET /api/v1/achievements/{slug}/ - Retrieve single achievement by slug
    """

    serializer_class = AchievementSerializer
    permission_classes = [ReadOnlyPermission, APIKeyPermission]
    lookup_field = "slug"

    def get_queryset(self):
        category = self.request.query_params.get("category", None)
        return PortfolioQueryService.get_achievements_queryset(
            category_slug=category,
            active_only=True,
        )


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for Categories.
    GET /api/v1/categories/ - List all categories with item counts
    GET /api/v1/categories/{slug}/ - Retrieve single category by slug
    """

    serializer_class = CategorySerializer
    permission_classes = [ReadOnlyPermission, APIKeyPermission]
    lookup_field = "slug"

    def get_queryset(self):
        category_type = self.request.query_params.get("type", None)
        return PortfolioQueryService.get_categories_queryset(category_type=category_type)


class UserProfileViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for User Profile.
    GET /api/v1/profile/ - Retrieve user profile object
    """

    serializer_class = UserProfileSerializer
    permission_classes = [ReadOnlyPermission, APIKeyPermission]

    def get_queryset(self):
        profile = PortfolioQueryService.get_user_profile()
        if profile:
            return UserProfile.objects.filter(pk=profile.pk)
        return UserProfile.objects.none()

    def list(self, request, *args, **kwargs):
        profile = PortfolioQueryService.get_user_profile()
        if profile:
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        return Response({}, status=status.HTTP_404_NOT_FOUND)


# ── Custom Function Endpoints ──────────────────────────────────────────


@api_view(["GET"])
@permission_classes([ReadOnlyPermission, APIKeyPermission])
def portfolio_summary(request):
    """
    Get aggregated portfolio summary metrics in a single query.
    GET /api/v1/summary/
    """
    stats = PortfolioQueryService.get_summary_statistics()
    serializer = PortfolioSummarySerializer(stats)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([ReadOnlyPermission, APIKeyPermission])
def portfolio_bootstrap(request):
    """
    Unified payload returning profile, featured projects, top skills,
    and recent experiences for fast single-roundtrip frontend hydration.
    GET /api/v1/bootstrap/
    """
    serializer_context = {"request": request}
    data = PortfolioQueryService.get_bootstrap_payload()

    return Response(
        {
            "profile": (
                UserProfileSerializer(data["profile"], context=serializer_context).data
                if data["profile"]
                else None
            ),
            "projects": ProjectSerializer(
                data["projects"],
                many=True,
                context=serializer_context,
            ).data,
            "skills": SkillSerializer(
                data["skills"],
                many=True,
                context=serializer_context,
            ).data,
            "experience": ExperienceSerializer(
                data["experience"],
                many=True,
                context=serializer_context,
            ).data,
        }
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def get_csrf_token(request):
    """
    Returns CSRF cookie and token for frontend state synchronization.
    GET /api/v1/auth/csrf/ or /api/v1/csrf/
    """
    token = get_token(request)
    return Response({"csrftoken": token, "status": "ok"})


@api_view(["GET"])
@permission_classes([AllowAny])
def api_health_check(request):
    """
    Health check and diagnostics endpoint to verify API and DB connectivity.
    GET /api/v1/health/
    """
    db_ok = True
    db_message = "Connected"
    try:
        connection.ensure_connection()
    except Exception as exc:
        db_ok = False
        db_message = str(exc)

    return Response(
        {
            "status": "healthy" if db_ok else "degraded",
            "message": "Portfolio API is operational",
            "version": "1.0.0",
            "api_version": "v1",
            "timestamp": timezone.now().isoformat(),
            "database": {
                "status": "ok" if db_ok else "error",
                "engine": connection.vendor,
                "message": db_message,
            },
        },
        status=status.HTTP_200_OK if db_ok else status.HTTP_503_SERVICE_UNAVAILABLE,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def create_contact_message(request):
    """
    Secure public contact message submission with spam & rate-limit defenses.
    POST /api/v1/contact/
    """
    full_name = str(request.data.get("full_name", "")).strip()
    email = str(request.data.get("email", "")).strip().lower()
    raw_message = str(request.data.get("message", "")).strip()
    is_urgent = str(request.data.get("is_urgent", "")).strip().lower() in {
        "1",
        "true",
        "yes",
        "on",
    }

    # 1. Content validation & spam checks
    is_valid, error_msg = ContactMessageService.validate_content_and_spam(
        full_name=full_name,
        email=email,
        message=raw_message,
    )
    if not is_valid:
        return Response(
            {"success": False, "message": error_msg},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # 2. Serializer validation
    serializer = ContactMessageCreateSerializer(
        data={
            "full_name": full_name,
            "email": email,
            "message": raw_message,
            "is_urgent": is_urgent,
        }
    )
    serializer.is_valid(raise_exception=True)

    # 3. Rate-limit and duplicate submission checks
    ip_address = SecurityService.extract_client_ip(request)
    allowed, status_code, limit_msg = ContactMessageService.check_rate_limits_and_duplicates(
        email=email,
        message=raw_message,
        ip_address=ip_address,
    )
    if not allowed:
        return Response(
            {"success": False, "message": limit_msg},
            status=status_code,
        )

    # 4. Create and persist message via service
    msg_instance = ContactMessageService.create_message(
        full_name=full_name,
        email=email,
        message=raw_message,
        is_urgent=is_urgent,
        source="portfolio_site",
        request=request,
    )

    return Response(
        {
            "success": True,
            "id": msg_instance.id,
            "message": "Thank you for reaching out. Your message has been received.",
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def rexi_chat_api(request):
    """
    Qwen3-0.6B Powered AI Assistant Endpoint for Rexi.
    Answers in 3rd person perspective about Roshan with varied responses.
    POST /api/v1/rexi/chat/
    """
    user_message = str(request.data.get("message", "")).strip()
    result = RexiChatService.generate_reply(user_message=user_message)

    if not result.get("success"):
        return Response(
            {"success": False, "message": result.get("message", "Invalid request.")},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(result, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([AllowAny])
def project_like(request, slug):
    """Increment likes on a project by slug."""
    success, likes_count = InteractionService.increment_likes(slug)
    if success:
        return Response({"success": True, "likes": likes_count})
    return Response(
        {"success": False, "message": "Project not found"},
        status=status.HTTP_404_NOT_FOUND,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def project_view(request, slug):
    """Increment views on a project by slug."""
    success, views_count = InteractionService.increment_views(slug)
    if success:
        return Response({"success": True, "views": views_count})
    return Response(
        {"success": False, "message": "Project not found"},
        status=status.HTTP_404_NOT_FOUND,
    )
