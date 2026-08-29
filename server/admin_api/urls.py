"""
Admin REST API URL Routing Configuration.
Registers all admin ViewSets and custom actions for dynamic portfolio administration.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from admin_api import views
from admin_api.docs_views import admin_api_docs

router = DefaultRouter()
router.register(r"categories", views.AdminCategoryViewSet, basename="admin-categories")
router.register(r"projects", views.AdminProjectViewSet, basename="admin-projects")
router.register(r"experience", views.AdminExperienceViewSet, basename="admin-experience")
router.register(r"skills", views.AdminSkillViewSet, basename="admin-skills")
router.register(r"achievements", views.AdminAchievementViewSet, basename="admin-achievements")
router.register(r"messages", views.AdminContactMessageViewSet, basename="admin-messages")

urlpatterns = [
    # Interactive Documentation Portal
    path("docs/", admin_api_docs, name="admin-api-docs"),

    # Staff JWT Authentication
    path("auth/login/", views.admin_login, name="admin-auth-login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="admin-auth-refresh"),
    path("auth/me/", views.admin_me, name="admin-auth-me"),

    # Profile & Document Endpoints
    path("profile/", views.admin_profile_detail, name="admin-profile-detail"),
    path("profile/upload-image/", views.admin_profile_upload_image, name="admin-profile-upload-image"),
    path("profile/delete-image/", views.admin_profile_delete_image, name="admin-profile-delete-image"),
    path("profile/upload-document/", views.admin_profile_upload_document, name="admin-profile-upload-document"),
    path("profile/delete-document/", views.admin_profile_delete_document, name="admin-profile-delete-document"),

    # Analytics & Live Dashboard
    path("analytics/dashboard/", views.admin_dashboard_analytics, name="admin-analytics-dashboard"),

    # Router ViewSets
    path("", include(router.urls)),
]
