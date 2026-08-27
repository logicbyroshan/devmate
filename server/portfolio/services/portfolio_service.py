"""
Portfolio Query and Data Selector Service.
Encapsulates all database query optimization, prefetching, aggregation,
caching, and lean data projections for the portfolio application.
"""

from typing import Any, Dict, List, Optional
from django.db.models import Count, Prefetch, Q, QuerySet
from ..models import (
    Achievement,
    Category,
    Experience,
    ExperienceImage,
    Project,
    ProjectScreenshot,
    Skill,
    UserProfile,
)


class PortfolioQueryService:
    """High-performance selector service for portfolio data."""

    @staticmethod
    def get_category_queryset() -> QuerySet[Category]:
        """Category queryset with annotated item counts and lean fields."""
        return Category.objects.with_item_counts().only(
            "id",
            "name",
            "slug",
            "category_type",
            "description",
            "icon",
            "color",
            "created_at",
            "updated_at",
        )

    @staticmethod
    def get_user_profile() -> Optional[UserProfile]:
        """Fetch the primary user profile with optimized lean field selection."""
        return UserProfile.objects.only(
            "id",
            "full_name",
            "email",
            "phone",
            "location",
            "title",
            "bio",
            "profile_image",
            "github",
            "linkedin",
            "twitter",
            "instagram",
            "youtube",
            "website",
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
        ).first()

    @classmethod
    def get_projects_queryset(
        cls,
        category_slug: Optional[str] = None,
        status_filter: Optional[str] = None,
        is_featured: Optional[bool] = None,
        active_only: bool = True,
    ) -> QuerySet[Project]:
        """
        Build optimized project queryset with pre-joined categories & ordered screenshots.
        """
        qs = Project.objects.all()

        if active_only:
            qs = qs.filter(is_active=True).exclude(status="draft")

        if category_slug:
            qs = qs.filter(category__slug=category_slug)

        if status_filter:
            qs = qs.filter(status=status_filter)

        if is_featured is not None:
            qs = qs.filter(is_featured=is_featured)

        return (
            qs.only(
                "id",
                "title",
                "slug",
                "description",
                "project_name",
                "documentation",
                "category_id",
                "technologies",
                "thumbnail",
                "github_url",
                "live_url",
                "demo_url",
                "other_url",
                "start_date",
                "end_date",
                "client",
                "status",
                "is_active",
                "is_featured",
                "views",
                "likes",
                "order",
                "created_at",
                "updated_at",
            )
            .prefetch_related(
                Prefetch("category", queryset=cls.get_category_queryset()),
                Prefetch(
                    "screenshots",
                    queryset=ProjectScreenshot.objects.only(
                        "id",
                        "project_id",
                        "image",
                        "caption",
                        "order",
                        "uploaded_at",
                    ).order_by("order", "-uploaded_at"),
                ),
            )
            .order_by("-order", "-created_at")
        )

    @classmethod
    def get_project_by_slug(cls, slug: str) -> Optional[Project]:
        """Retrieve single project by slug."""
        return cls.get_projects_queryset(active_only=False).filter(slug=slug).first()

    @classmethod
    def get_experiences_queryset(
        cls,
        employment_type: Optional[str] = None,
        category_slug: Optional[str] = None,
        active_only: bool = True,
    ) -> QuerySet[Experience]:
        """Build optimized experience queryset with pre-joined categories & images."""
        qs = Experience.objects.all()

        if active_only:
            qs = qs.filter(is_active=True, is_draft=False)

        if employment_type:
            qs = qs.filter(employment_type=employment_type)

        if category_slug:
            qs = qs.filter(category__slug=category_slug)

        return (
            qs.only(
                "id",
                "position",
                "slug",
                "employment_type",
                "employment_status",
                "category_id",
                "location",
                "company_name",
                "company_about",
                "company_website",
                "company_logo",
                "start_date",
                "end_date",
                "currently_working",
                "short_description",
                "detailed_description",
                "is_active",
                "is_draft",
                "order",
                "created_at",
                "updated_at",
            )
            .prefetch_related(
                Prefetch("category", queryset=cls.get_category_queryset()),
                Prefetch(
                    "images",
                    queryset=ExperienceImage.objects.only(
                        "id",
                        "experience_id",
                        "image",
                        "caption",
                        "order",
                    ).order_by("order"),
                ),
            )
            .order_by("-order", "-start_date")
        )

    @classmethod
    def get_experience_by_slug(cls, slug: str) -> Optional[Experience]:
        """Retrieve single experience by slug."""
        return cls.get_experiences_queryset(active_only=False).filter(slug=slug).first()

    @classmethod
    def get_skills_queryset(
        cls,
        level: Optional[str] = None,
        category_slug: Optional[str] = None,
        active_only: bool = True,
    ) -> QuerySet[Skill]:
        """Build optimized skills queryset."""
        qs = Skill.objects.all()

        if active_only:
            qs = qs.filter(is_active=True, is_draft=False)

        if level:
            qs = qs.filter(skill_level=level)

        if category_slug:
            qs = qs.filter(category__slug=category_slug)

        return (
            qs.only(
                "id",
                "name",
                "slug",
                "skill_level",
                "category_id",
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
            )
            .prefetch_related(Prefetch("category", queryset=cls.get_category_queryset()))
            .order_by("-proficiency", "name")
        )

    @classmethod
    def get_skill_by_slug(cls, slug: str) -> Optional[Skill]:
        """Retrieve single skill by slug."""
        return cls.get_skills_queryset(active_only=False).filter(slug=slug).first()

    @classmethod
    def get_achievements_queryset(
        cls,
        category_slug: Optional[str] = None,
        active_only: bool = True,
    ) -> QuerySet[Achievement]:
        """Build optimized achievements queryset."""
        qs = Achievement.objects.all()

        if active_only:
            qs = qs.filter(is_active=True, is_draft=False)

        if category_slug:
            qs = qs.filter(category__slug=category_slug)

        return (
            qs.only(
                "id",
                "title",
                "slug",
                "category_id",
                "issuing_organization",
                "achievement_date",
                "expiration_date",
                "no_expiration",
                "short_description",
                "full_description",
                "credential_type",
                "credential_file",
                "credential_url",
                "credential_id",
                "related_link",
                "is_active",
                "is_draft",
                "order",
                "created_at",
                "updated_at",
            )
            .prefetch_related(Prefetch("category", queryset=cls.get_category_queryset()))
            .order_by("-achievement_date", "-created_at")
        )

    @classmethod
    def get_achievement_by_slug(cls, slug: str) -> Optional[Achievement]:
        """Retrieve single achievement by slug."""
        return cls.get_achievements_queryset(active_only=False).filter(slug=slug).first()

    @classmethod
    def get_categories_queryset(
        cls, category_type: Optional[str] = None
    ) -> QuerySet[Category]:
        """Build categories queryset with item counts."""
        qs = cls.get_category_queryset()
        if category_type:
            qs = qs.filter(category_type=category_type)
        return qs.order_by("category_type", "name")

    @classmethod
    def get_summary_statistics(cls) -> Dict[str, int]:
        """Single-pass aggregations for portfolio summary stats."""
        project_counts = Project.objects.aggregate(
            total=Count("id"),
            active=Count("id", filter=Q(is_active=True) & ~Q(status="draft")),
        )
        experience_counts = Experience.objects.aggregate(
            total=Count("id"),
            active=Count("id", filter=Q(is_active=True, is_draft=False)),
        )
        skill_counts = Skill.objects.aggregate(
            total=Count("id"),
            active=Count("id", filter=Q(is_active=True, is_draft=False)),
        )
        achievement_counts = Achievement.objects.aggregate(
            total=Count("id"),
            active=Count("id", filter=Q(is_active=True, is_draft=False)),
        )
        years_of_experience = (
            UserProfile.objects.values_list("experience_years", flat=True).first() or 0
        )

        return {
            "total_projects": project_counts["total"] or 0,
            "total_experience": experience_counts["total"] or 0,
            "total_skills": skill_counts["total"] or 0,
            "total_achievements": achievement_counts["total"] or 0,
            "active_projects": project_counts["active"] or 0,
            "active_experience": experience_counts["active"] or 0,
            "active_skills": skill_counts["active"] or 0,
            "active_achievements": achievement_counts["active"] or 0,
            "years_of_experience": years_of_experience,
        }

    @classmethod
    def get_bootstrap_payload(cls) -> Dict[str, Any]:
        """
        Unified bootstrap payload for instant frontend hydration.
        Returns profile, featured projects, top skills, and recent experience.
        """
        profile = cls.get_user_profile()
        featured_projects = list(cls.get_projects_queryset(is_featured=True)[:6])
        if not featured_projects:
            featured_projects = list(cls.get_projects_queryset()[:6])

        top_skills = list(cls.get_skills_queryset()[:10])
        recent_experience = list(cls.get_experiences_queryset()[:6])

        return {
            "profile": profile,
            "projects": featured_projects,
            "skills": top_skills,
            "experience": recent_experience,
        }
