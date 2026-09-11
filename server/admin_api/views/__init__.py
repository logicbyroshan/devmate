"""Admin API Views Package."""

from .auth_views import admin_login, admin_me
from .category_views import AdminCategoryViewSet
from .project_views import AdminProjectViewSet
from .experience_views import AdminExperienceViewSet
from .skill_views import AdminSkillViewSet
from .achievement_views import AdminAchievementViewSet
from .profile_views import (
    admin_profile_detail,
    admin_profile_upload_image,
    admin_profile_delete_image,
    admin_profile_upload_hero_image,
    admin_profile_delete_hero_image,
    admin_profile_upload_document,
    admin_profile_delete_document,
)
from .message_views import AdminContactMessageViewSet
from .analytics_views import admin_dashboard_analytics
