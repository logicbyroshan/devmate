"""
Admin User Profile & Details API Views.
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from portfolio.models import UserProfile
from admin_api.permissions import IsStaffUser
from admin_api.serializers.profile_serializers import AdminUserProfileSerializer
from admin_api.utils.security import validate_uploaded_image, validate_uploaded_document


def get_or_create_user_profile():
    profile = UserProfile.objects.first()
    if not profile:
        profile = UserProfile.objects.create(
            full_name="Roshan Damor",
            email="mail@logicbyroshan.in",
            title="Full-Stack Software Engineer",
            bio="Software Engineer specializing in scalable full-stack web applications.",
        )
    return profile


@api_view(["GET", "PUT", "PATCH"])
@permission_classes([IsStaffUser])
@parser_classes([JSONParser, MultiPartParser, FormParser])
def admin_profile_detail(request):
    """
    GET /api/v1/admin/profile/ - Retrieve user profile
    PUT / PATCH /api/v1/admin/profile/ - Update profile fields
    """
    profile = get_or_create_user_profile()

    if request.method == "GET":
        serializer = AdminUserProfileSerializer(profile)
        return Response({"success": True, "data": serializer.data})

    partial = request.method == "PATCH"
    serializer = AdminUserProfileSerializer(profile, data=request.data, partial=partial)
    if serializer.is_valid():
        serializer.save()
        return Response(
            {
                "success": True,
                "message": "Profile updated successfully!",
                "data": serializer.data,
            }
        )
    return Response(
        {"success": False, "errors": serializer.errors},
        status=status.HTTP_400_BAD_REQUEST,
    )


@api_view(["POST"])
@permission_classes([IsStaffUser])
@parser_classes([MultiPartParser, FormParser])
def admin_profile_upload_image(request):
    """
    POST /api/v1/admin/profile/upload-image/
    Upload profile picture.
    """
    file_obj = request.FILES.get("profile_image")
    if not file_obj:
        return Response(
            {"success": False, "message": "No 'profile_image' file provided."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    validate_uploaded_image(file_obj)
    profile = get_or_create_user_profile()
    profile.profile_image = file_obj
    profile.save()

    return Response(
        {
            "success": True,
            "message": "Profile image updated successfully!",
            "image_url": profile.profile_image.url if profile.profile_image else None,
        }
    )


@api_view(["DELETE"])
@permission_classes([IsStaffUser])
def admin_profile_delete_image(request):
    """
    DELETE /api/v1/admin/profile/delete-image/
    Remove profile picture.
    """
    profile = get_or_create_user_profile()
    if profile.profile_image:
        profile.profile_image.delete(save=False)
        profile.profile_image = None
        profile.save()

    return Response(
        {"success": True, "message": "Profile image removed successfully."}
    )


@api_view(["POST"])
@permission_classes([IsStaffUser])
@parser_classes([MultiPartParser, FormParser])
def admin_profile_upload_document(request):
    """
    POST /api/v1/admin/profile/upload-document/
    Upload resume or cover letter document (PDF).
    Payload: doc_type ('resume' or 'cover_letter'), file
    """
    doc_type = request.data.get("doc_type", "resume")
    file_obj = request.FILES.get("file") or request.FILES.get("resume") or request.FILES.get("cover_letter")

    if not file_obj:
        return Response(
            {"success": False, "message": "No document file provided."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    validate_uploaded_document(file_obj)
    profile = get_or_create_user_profile()

    if doc_type == "cover_letter":
        profile.cover_letter = file_obj
        profile.save()
        url = profile.cover_letter.url
    else:
        profile.resume = file_obj
        profile.save()
        url = profile.resume.url

    return Response(
        {
            "success": True,
            "message": f"{doc_type.replace('_', ' ').title()} uploaded successfully!",
            "document_url": url,
        }
    )


@api_view(["DELETE"])
@permission_classes([IsStaffUser])
def admin_profile_delete_document(request):
    """
    DELETE /api/v1/admin/profile/delete-document/?type=resume|cover_letter
    """
    doc_type = request.query_params.get("type", "resume")
    profile = get_or_create_user_profile()

    if doc_type == "cover_letter":
        if profile.cover_letter:
            profile.cover_letter.delete(save=False)
            profile.cover_letter = None
            profile.save()
    else:
        if profile.resume:
            profile.resume.delete(save=False)
            profile.resume = None
            profile.save()

    return Response(
        {"success": True, "message": f"{doc_type.replace('_', ' ').title()} removed successfully."}
    )


@api_view(["POST"])
@permission_classes([IsStaffUser])
@parser_classes([MultiPartParser, FormParser])
def admin_profile_upload_hero_image(request):
    """
    POST /api/v1/admin/profile/upload-hero-image/
    Upload custom hero image.
    """
    file_obj = request.FILES.get("hero_image")
    if not file_obj:
        return Response(
            {"success": False, "message": "No 'hero_image' file provided."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    validate_uploaded_image(file_obj)
    profile = get_or_create_user_profile()
    profile.hero_image = file_obj
    profile.save()

    return Response(
        {
            "success": True,
            "message": "Hero visual image updated successfully!",
            "hero_image_url": profile.hero_image.url if profile.hero_image else None,
        }
    )


@api_view(["DELETE"])
@permission_classes([IsStaffUser])
def admin_profile_delete_hero_image(request):
    """
    DELETE /api/v1/admin/profile/delete-hero-image/
    Remove custom hero image.
    """
    profile = get_or_create_user_profile()
    if profile.hero_image:
        profile.hero_image.delete(save=False)
        profile.hero_image = None
        profile.save()

    return Response(
        {"success": True, "message": "Hero image removed successfully."}
    )
