"""
REST API URL Routing Configuration.
Registers ViewSets with DefaultRouter and binds custom action/service endpoints.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter
from . import api_views

# Register REST ViewSets
router = DefaultRouter()
router.register(r'projects', api_views.ProjectViewSet, basename='api-projects')
router.register(r'experience', api_views.ExperienceViewSet, basename='api-experience')
router.register(r'skills', api_views.SkillViewSet, basename='api-skills')
router.register(r'achievements', api_views.AchievementViewSet, basename='api-achievements')
router.register(r'categories', api_views.CategoryViewSet, basename='api-categories')
router.register(r'profile', api_views.UserProfileViewSet, basename='api-profile')

urlpatterns = [
    # Router endpoints: /projects/, /experience/, /skills/, /achievements/, /categories/, /profile/
    path('', include(router.urls)),

    # Core Custom Service Endpoints
    path('bootstrap/', api_views.portfolio_bootstrap, name='api-bootstrap'),
    path('summary/', api_views.portfolio_summary, name='api-summary'),
    path('health/', api_views.api_health_check, name='api-health'),
    path('contact/', api_views.create_contact_message, name='api-contact-create'),
    path('rexi/chat/', api_views.rexi_chat_api, name='api-rexi-chat'),
    path('csrf/', api_views.get_csrf_token, name='api-csrf'),
    path('auth/csrf/', api_views.get_csrf_token, name='api-auth-csrf'),
    path('auth/login/', api_views.api_auth_login, name='api-auth-login'),
    path('banners/', api_views.api_banners_list, name='api-banners-list'),

    # Interaction Endpoints
    path('projects/<slug:slug>/like/', api_views.project_like, name='api-project-like'),
    path('projects/<slug:slug>/view/', api_views.project_view, name='api-project-view'),

    # Blog Endpoints
    path('blogs/', api_views.api_blogs_list, name='api-blogs-list'),
    path('blogs/<slug:slug>/', api_views.api_blog_detail, name='api-blog-detail'),
]
