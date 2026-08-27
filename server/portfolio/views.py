from decimal import Decimal, InvalidOperation
from pathlib import Path
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db import IntegrityError, transaction
from django.db.models import Count
from django.utils.text import slugify
from .models import (
    Project,
    Category,
    UserProfile,
    ProjectScreenshot,
    Experience,
    ExperienceImage,
    Skill,
    Achievement,
)
from .forms import (
    ProjectForm,
    CategoryForm,
    UserProfileForm,
    ExperienceForm,
    SkillForm,
    AchievementForm,
)


def parse_int(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def parse_decimal(value):
    if value is None or str(value).strip() == "":
        return None
    try:
        cleaned = str(value).strip().replace("$", "").replace(",", "")
        dec = Decimal(cleaned)
        return dec if dec >= 0 else None
    except (InvalidOperation, TypeError, ValueError):
        return None


def generate_unique_slug(model_class, raw_value, slug_field="slug", max_attempts=1000):
    """Generate a unique slug for a model class using numeric suffixes when needed."""
    base_slug = slugify(raw_value or "item") or "item"

    existing_slugs = set(
        model_class.objects.filter(
            **{f"{slug_field}__startswith": base_slug}
        ).values_list(slug_field, flat=True)
    )

    if base_slug not in existing_slugs:
        return base_slug

    slug_prefix = f"{base_slug}-"
    used_suffixes = {
        int(suffix)
        for slug in existing_slugs
        if slug.startswith(slug_prefix)
        for suffix in [slug[len(slug_prefix):]]
        if suffix.isdigit()
    }

    for counter in range(1, max_attempts + 1):
        if counter not in used_suffixes:
            return f"{base_slug}-{counter}"

    raise ValueError(f"Could not generate a unique slug for '{base_slug}'")


# Dashboard Views
@staff_member_required(login_url="/admin/login/")
def dashboard(request):
    """Main dashboard view with real data"""
    
    # Get counts
    total_projects = Project.objects.count()
    total_experience = Experience.objects.count()
    total_achievements = Achievement.objects.count()
    total_skills = Skill.objects.count()
    
    # Get recent items (last 3)
    recent_projects = Project.objects.order_by('-created_at')[:3]
    recent_experience = Experience.objects.order_by('-start_date')[:3]
    recent_achievements = Achievement.objects.order_by('-achievement_date')[:3]
    
    # Get top 5 skills (by proficiency percentage)
    top_skills = Skill.objects.filter(is_active=True).order_by('-proficiency')[:5]
    
    # Get category counts (top 5 only)
    category_counts = Project.objects.values('category__name', 'category__icon').annotate(count=Count('id')).order_by('-count')[:5]
    
    context = {
        'total_projects': total_projects,
        'total_experience': total_experience,
        'total_achievements': total_achievements,
        'total_skills': total_skills,
        'recent_projects': recent_projects,
        'recent_experience': recent_experience,
        'recent_achievements': recent_achievements,
        'top_skills': top_skills,
        'category_counts': category_counts,
    }
    
    return render(request, "dashboard.html", context)


# Project Views
@staff_member_required(login_url="/admin/login/")
def manage_projects(request):
    """Manage projects view with AJAX support"""
    if request.method == "POST":
        # Handle toggle active/inactive
        if request.headers.get("X-Requested-With") == "XMLHttpRequest":
            project_id = parse_int(request.POST.get("project_id"))
            is_active = request.POST.get("is_active") == "true"

            if project_id is None:
                return JsonResponse(
                    {"success": False, "message": "Invalid project id"},
                    status=400,
                )

            try:
                project = Project.objects.get(id=project_id)
                project.is_active = is_active
                project.save()
                return JsonResponse(
                    {"success": True, "message": "Project status updated"}
                )
            except Project.DoesNotExist:
                return JsonResponse(
                    {"success": False, "message": "Project not found"}, status=404
                )

    # Get recent projects (latest 6 projects regardless of status)
    recent_projects = Project.objects.select_related("category").all().order_by("-created_at")[:6]

    context = {
        "recent_projects": recent_projects,
        "total_count": Project.objects.count(),
    }
    return render(request, "manage_projects.html", context)


@staff_member_required(login_url="/admin/login/")
def create_project(request):
    """Create new project view with AJAX support"""
    if request.method == "POST":
        form = ProjectForm(request.POST, request.FILES)
        if form.is_valid():
            try:
                with transaction.atomic():
                    project = form.save()

                    # Handle screenshot uploads
                    screenshot_files = request.FILES.getlist("screenshots")
                    if screenshot_files:
                        ProjectScreenshot.objects.bulk_create(
                            [
                                ProjectScreenshot(
                                    project=project,
                                    image=screenshot_file,
                                    order=index,
                                )
                                for index, screenshot_file in enumerate(screenshot_files)
                            ]
                        )
            except IntegrityError:
                error_payload = {
                    "slug": [
                        "Unable to save project due to a duplicate URL slug. Please try a different title."
                    ]
                }
                if request.headers.get("X-Requested-With") == "XMLHttpRequest":
                    return JsonResponse(
                        {"success": False, "errors": error_payload},
                        status=400,
                    )
                messages.error(
                    request,
                    "Unable to save project due to a duplicate URL slug. Please try again.",
                )
                categories = Category.objects.all()
                return render(
                    request,
                    "create_project.html",
                    {
                        "form": form,
                        "categories": categories,
                    },
                )

            if request.headers.get("X-Requested-With") == "XMLHttpRequest":
                return JsonResponse(
                    {
                        "success": True,
                        "message": "Project created successfully!",
                        "project_id": project.id,
                        "redirect_url": "/projects/",
                    }
                )
            else:
                messages.success(request, "Project created successfully!")
                return redirect("manage_projects")
        else:
            if request.headers.get("X-Requested-With") == "XMLHttpRequest":
                return JsonResponse(
                    {"success": False, "errors": form.errors}, status=400
                )
    else:
        form = ProjectForm()

    categories = Category.objects.all()
    context = {
        "form": form,
        "categories": categories,
    }
    return render(request, "create_project.html", context)


@staff_member_required(login_url="/admin/login/")
def edit_project(request, project_id):
    """Edit existing project"""
    project = get_object_or_404(Project, id=project_id)

    if request.method == "POST":
        form = ProjectForm(request.POST, request.FILES, instance=project)
        if form.is_valid():
            try:
                with transaction.atomic():
                    project = form.save()

                    # Handle screenshot uploads
                    screenshot_files = request.FILES.getlist("screenshots")
                    if screenshot_files:
                        # Delete old screenshots if new ones are uploaded
                        project.screenshots.all().delete()

                        # Add new screenshots
                        ProjectScreenshot.objects.bulk_create(
                            [
                                ProjectScreenshot(
                                    project=project,
                                    image=screenshot_file,
                                    order=index,
                                )
                                for index, screenshot_file in enumerate(screenshot_files)
                            ]
                        )
            except IntegrityError:
                error_payload = {
                    "slug": [
                        "Unable to save project due to a duplicate URL slug. Please try a different title."
                    ]
                }
                if request.headers.get("X-Requested-With") == "XMLHttpRequest":
                    return JsonResponse(
                        {"success": False, "errors": error_payload},
                        status=400,
                    )
                messages.error(
                    request,
                    "Unable to save project due to a duplicate URL slug. Please try again.",
                )
                categories = Category.objects.all()
                return render(
                    request,
                    "create_project.html",
                    {
                        "form": form,
                        "project": project,
                        "categories": categories,
                        "is_edit": True,
                    },
                )

            if request.headers.get("X-Requested-With") == "XMLHttpRequest":
                return JsonResponse(
                    {
                        "success": True,
                        "message": "Project updated successfully!",
                        "redirect_url": "/projects/",
                    }
                )
            else:
                messages.success(request, "Project updated successfully!")
                return redirect("manage_projects")
        else:
            if request.headers.get("X-Requested-With") == "XMLHttpRequest":
                return JsonResponse(
                    {"success": False, "errors": form.errors}, status=400
                )
    else:
        form = ProjectForm(instance=project)

    categories = Category.objects.all()
    context = {
        "form": form,
        "project": project,
        "categories": categories,
        "is_edit": True,
    }
    return render(request, "create_project.html", context)


@staff_member_required(login_url="/admin/login/")
def delete_project(request, project_id):
    """Delete project"""
    if request.method == "POST":
        project = get_object_or_404(Project, id=project_id)
        project_title = project.title
        project.delete()

        if request.headers.get("X-Requested-With") == "XMLHttpRequest":
            return JsonResponse(
                {
                    "success": True,
                    "message": f'Project "{project_title}" deleted successfully!',
                }
            )
        else:
            messages.success(
                request, f'Project "{project_title}" deleted successfully!'
            )
            return redirect("manage_projects")

    return JsonResponse({"success": False, "message": "Invalid request"}, status=400)


@staff_member_required(login_url="/admin/login/")
def list_projects(request):
    """List all projects view with filtering"""
    filter_type = request.GET.get("filter", "all")

    if filter_type == "draft":
        projects = Project.objects.select_related("category").filter(status="draft")
    else:
        projects = Project.objects.select_related("category").all()

    context = {
        "projects": projects,
        "current_filter": filter_type,
        "total_count": Project.objects.count(),
        "draft_count": Project.objects.filter(status="draft").count(),
    }
    return render(request, "list_projects.html", context)


# Experience Views
@staff_member_required(login_url="/admin/login/")
def manage_experience(request):
    """Manage experience view"""
    if request.method == "POST":
        # Handle toggle active/inactive
        if request.headers.get("X-Requested-With") == "XMLHttpRequest":
            experience_id = parse_int(request.POST.get("experience_id"))
            is_active = request.POST.get("is_active") == "true"

            if experience_id is None:
                return JsonResponse(
                    {"success": False, "message": "Invalid experience id"},
                    status=400,
                )

            try:
                experience = Experience.objects.get(id=experience_id)
                experience.is_active = is_active
                experience.save()
                return JsonResponse(
                    {"success": True, "message": "Experience status updated"}
                )
            except Experience.DoesNotExist:
                return JsonResponse(
                    {"success": False, "message": "Experience not found"}, status=404
                )

    experiences = Experience.objects.select_related("category").all()[:6]  # Get latest 6
    total_count = Experience.objects.count()

    context = {
        "experiences": experiences,
        "total_count": total_count,
    }
    return render(request, "manage_experience.html", context)


@staff_member_required(login_url="/admin/login/")
def create_experience(request):
    """Create new experience view"""
    if request.method == "POST":
        # Handle month input conversion to date
        post_data = request.POST.copy()
        
        # Convert start_date from YYYY-MM to YYYY-MM-01
        if 'start_date' in post_data and post_data['start_date']:
            start_date = post_data['start_date']
            if len(start_date) == 7:  # Format: YYYY-MM
                post_data['start_date'] = f"{start_date}-01"
        
        # Convert end_date from YYYY-MM to YYYY-MM-01 or clear if currently working
        is_currently_working = post_data.get("currently_working") in {"on", "true", "1", True}
        if is_currently_working or not post_data.get('end_date'):
            post_data['end_date'] = ''
        elif 'end_date' in post_data and post_data['end_date']:
            end_date = post_data['end_date']
            if len(end_date) == 7:  # Format: YYYY-MM
                post_data['end_date'] = f"{end_date}-01"
        
        # Set default order if not provided
        if 'order' not in post_data or not post_data['order']:
            post_data['order'] = '0'
        
        form = ExperienceForm(post_data, request.FILES)
        if form.is_valid():
            experience = form.save(commit=False)

            # Handle draft status from button click
            is_draft = request.POST.get("is_draft", "false")
            experience.is_draft = is_draft == "true"
            if is_currently_working:
                experience.end_date = None

            # Generate a collision-safe slug from position.
            if not experience.slug:
                experience.slug = generate_unique_slug(Experience, experience.position)

            try:
                with transaction.atomic():
                    experience.save()

                    # Handle workplace image uploads
                    workplace_files = request.FILES.getlist("workplace_images")
                    if workplace_files:
                        ExperienceImage.objects.bulk_create(
                            [
                                ExperienceImage(
                                    experience=experience,
                                    image=image_file,
                                    order=index,
                                )
                                for index, image_file in enumerate(workplace_files)
                            ]
                        )
            except IntegrityError:
                if request.headers.get("X-Requested-With") == "XMLHttpRequest":
                    return JsonResponse(
                        {
                            "success": False,
                            "errors": {
                                "slug": [
                                    "Unable to save experience due to a duplicate URL slug. Please try a different position title."
                                ]
                            },
                        },
                        status=400,
                    )
                messages.error(
                    request,
                    "Unable to save experience due to a duplicate URL slug. Please try again.",
                )
                context = {
                    "form": form,
                }
                return render(request, "create_experience.html", context)

            if request.headers.get("X-Requested-With") == "XMLHttpRequest":
                return JsonResponse(
                    {
                        "success": True,
                        "message": "Experience created successfully!",
                        "experience_id": experience.id,
                        "redirect_url": "/experience/",
                    }
                )
            else:
                messages.success(request, "Experience created successfully!")
                return redirect("manage_experience")
        else:
            if request.headers.get("X-Requested-With") == "XMLHttpRequest":
                return JsonResponse(
                    {"success": False, "errors": form.errors}, status=400
                )
            # Pass form with errors back to template
            messages.error(request, "Please correct the errors below.")
    else:
        form = ExperienceForm()

    context = {
        "form": form,
    }
    return render(request, "create_experience.html", context)


@staff_member_required(login_url="/admin/login/")
def edit_experience(request, experience_id):
    """Edit existing experience"""
    experience = get_object_or_404(Experience, id=experience_id)

    if request.method == "POST":
        # Handle month input conversion to date
        post_data = request.POST.copy()
        
        # Convert start_date from YYYY-MM to YYYY-MM-01
        if 'start_date' in post_data and post_data['start_date']:
            start_date = post_data['start_date']
            if len(start_date) == 7:  # Format: YYYY-MM
                post_data['start_date'] = f"{start_date}-01"
        
        # Convert end_date from YYYY-MM to YYYY-MM-01 or clear if currently working
        is_currently_working = post_data.get("currently_working") in {"on", "true", "1", True}
        if is_currently_working or not post_data.get('end_date'):
            post_data['end_date'] = ''
        elif 'end_date' in post_data and post_data['end_date']:
            end_date = post_data['end_date']
            if len(end_date) == 7:  # Format: YYYY-MM
                post_data['end_date'] = f"{end_date}-01"
        
        form = ExperienceForm(post_data, request.FILES, instance=experience)
        if form.is_valid():
            with transaction.atomic():
                experience = form.save(commit=False)
                if is_currently_working:
                    experience.end_date = None
                experience.save()

                # Handle workplace image uploads
                workplace_files = request.FILES.getlist("workplace_images")
                if workplace_files:
                    # Delete old images if new ones are uploaded
                    experience.images.all().delete()

                    # Add new images
                    ExperienceImage.objects.bulk_create(
                        [
                            ExperienceImage(
                                experience=experience,
                                image=image_file,
                                order=index,
                            )
                            for index, image_file in enumerate(workplace_files)
                        ]
                    )

            if request.headers.get("X-Requested-With") == "XMLHttpRequest":
                return JsonResponse(
                    {
                        "success": True,
                        "message": "Experience updated successfully!",
                        "redirect_url": "/experience/",
                    }
                )
            else:
                messages.success(request, "Experience updated successfully!")
                return redirect("manage_experience")
        else:
            if request.headers.get("X-Requested-With") == "XMLHttpRequest":
                return JsonResponse(
                    {"success": False, "errors": form.errors}, status=400
                )
    else:
        form = ExperienceForm(instance=experience)

    context = {
        "form": form,
        "experience": experience,
        "is_edit": True,
    }
    return render(request, "create_experience.html", context)


@staff_member_required(login_url="/admin/login/")
def delete_experience(request, experience_id):
    """Delete experience"""
    if request.method == "POST":
        experience = get_object_or_404(Experience, id=experience_id)
        position = experience.position
        experience.delete()

        if request.headers.get("X-Requested-With") == "XMLHttpRequest":
            return JsonResponse(
                {
                    "success": True,
                    "message": f'Experience "{position}" deleted successfully!',
                }
            )
        else:
            messages.success(request, f'Experience "{position}" deleted successfully!')
            return redirect("manage_experience")

    return JsonResponse({"success": False, "message": "Invalid request"}, status=400)


@staff_member_required(login_url="/admin/login/")
def list_experience(request):
    """List all experience view"""
    filter_type = request.GET.get("filter", "all")

    if filter_type == "draft":
        experiences = Experience.objects.select_related("category").filter(is_draft=True)
    else:
        experiences = Experience.objects.select_related("category").all()

    context = {
        "experiences": experiences,
        "current_filter": filter_type,
        "total_count": Experience.objects.count(),
        "draft_count": Experience.objects.filter(is_draft=True).count(),
    }
    return render(request, "list_experience.html", context)


# Skills Views
@staff_member_required(login_url="/admin/login/")
def manage_skills(request):
    """Manage skills view - show recent 6 skills only"""
    # Handle AJAX toggle
    if (
        request.method == "POST"
        and request.headers.get("X-Requested-With") == "XMLHttpRequest"
    ):
        skill_id = parse_int(request.POST.get("skill_id"))
        is_active = request.POST.get("is_active") == "true"

        if skill_id is None:
            return JsonResponse(
                {"success": False, "error": "Invalid skill id"},
                status=400,
            )

        try:
            skill = Skill.objects.get(id=skill_id)
            skill.is_active = is_active
            skill.save()
            return JsonResponse({"success": True, "message": "Skill status updated!"})
        except Skill.DoesNotExist:
            return JsonResponse({"success": False, "error": "Skill not found"}, status=404)

    # Get latest 6 skills (regardless of draft status)
    recent_skills = Skill.objects.select_related("category").all().order_by("-created_at")[:6]
    total_count = Skill.objects.count()

    context = {
        "recent_skills": recent_skills,
        "total_count": total_count,
    }
    return render(request, "manage_skills.html", context)


@staff_member_required(login_url="/admin/login/")
def create_skill(request):
    """Create new skill view"""
    if request.method == "POST":
        form = SkillForm(request.POST, request.FILES)
        if form.is_valid():
            skill = form.save(commit=False)
            
            # Generate a collision-safe slug from the skill name.
            skill.slug = generate_unique_slug(Skill, skill.name)
            
            # Set default order if not provided
            if not skill.order:
                skill.order = 0
            
            skill.save()
            messages.success(request, f"Skill '{skill.name}' created successfully!")
            return redirect("manage_skills")
        else:
            messages.error(request, "Please correct the errors below.")
    else:
        form = SkillForm()
    
    return render(request, "create_skill.html", {"form": form})


@staff_member_required(login_url="/admin/login/")
def list_skills(request):
    """List all skills view with filtering (All/Draft only)"""
    filter_type = request.GET.get("filter", "all")

    if filter_type == "draft":
        skills = Skill.objects.select_related("category").filter(is_draft=True).order_by("-created_at")
    else:  # all
        skills = Skill.objects.select_related("category").all().order_by("-created_at")

    # Get counts
    total_count = Skill.objects.count()
    draft_count = Skill.objects.filter(is_draft=True).count()

    context = {
        "skills": skills,
        "current_filter": filter_type,
        "total_count": total_count,
        "draft_count": draft_count,
    }
    return render(request, "list_skills.html", context)


@staff_member_required(login_url="/admin/login/")
def edit_skill(request, skill_id):
    """Edit skill view"""
    skill = get_object_or_404(Skill, id=skill_id)

    if request.method == "POST":
        form = SkillForm(request.POST, request.FILES, instance=skill)
        if form.is_valid():
            form.save()
            messages.success(request, f"Skill '{skill.name}' updated successfully!")
            return redirect("manage_skills")
        else:
            messages.error(request, "Please correct the errors below.")
    else:
        form = SkillForm(instance=skill)

    return render(request, "create_skill.html", {"form": form, "skill": skill})


@staff_member_required(login_url="/admin/login/")
def delete_skill(request, skill_id):
    """Delete skill"""
    if request.method == "POST":
        skill = get_object_or_404(Skill, id=skill_id)
        skill_name = skill.name
        skill.delete()

        if request.headers.get("X-Requested-With") == "XMLHttpRequest":
            return JsonResponse(
                {
                    "success": True,
                    "message": f'Skill "{skill_name}" deleted successfully!',
                }
            )
        else:
            messages.success(request, f'Skill "{skill_name}" deleted successfully!')
            return redirect("manage_skills")

    return JsonResponse({"success": False, "message": "Invalid request"}, status=400)


# Achievements Views
@staff_member_required(login_url="/admin/login/")
def manage_achievements(request):
    """Manage achievements view - show recent 6 achievements"""
    if request.method == "POST" and request.headers.get("X-Requested-With") == "XMLHttpRequest":
        achievement_id = parse_int(request.POST.get("achievement_id"))
        is_active = request.POST.get("is_active") == "true"

        if achievement_id is None:
            return JsonResponse(
                {"success": False, "error": "Invalid achievement id"},
                status=400,
            )

        try:
            achievement = Achievement.objects.get(id=achievement_id)
            achievement.is_active = is_active
            achievement.save()
            return JsonResponse({"success": True})
        except Achievement.DoesNotExist:
            return JsonResponse({"success": False, "error": "Achievement not found"}, status=404)

    recent_achievements = Achievement.objects.select_related("category").all().order_by("-created_at")[:6]
    total_count = Achievement.objects.count()

    context = {
        "recent_achievements": recent_achievements,
        "total_count": total_count,
    }
    return render(request, "manage_achievements.html", context)


@staff_member_required(login_url="/admin/login/")
def create_achievement(request):
    """Create new achievement view"""
    if request.method == "POST":
        form = AchievementForm(request.POST, request.FILES)
        if form.is_valid():
            achievement = form.save(commit=False)
            
            # Generate slug if not provided
            if not achievement.slug:
                achievement.slug = generate_unique_slug(Achievement, achievement.title)
            
            achievement.save()
            messages.success(request, f'Achievement "{achievement.title}" created successfully!')
            return redirect("manage_achievements")
        else:
            messages.error(request, "Please correct the errors below.")
    else:
        form = AchievementForm()

    return render(request, "create_achievement.html", {"form": form})


@staff_member_required(login_url="/admin/login/")
def edit_achievement(request, achievement_id):
    """Edit achievement view"""
    achievement = get_object_or_404(Achievement, id=achievement_id)

    if request.method == "POST":
        form = AchievementForm(request.POST, request.FILES, instance=achievement)
        if form.is_valid():
            achievement = form.save()
            messages.success(request, f'Achievement "{achievement.title}" updated successfully!')
            return redirect("manage_achievements")
        else:
            messages.error(request, "Please correct the errors below.")
    else:
        form = AchievementForm(instance=achievement)

    context = {
        "form": form,
        "achievement": achievement,
        "is_edit": True,
    }
    return render(request, "create_achievement.html", context)


@staff_member_required(login_url="/admin/login/")
def delete_achievement(request, achievement_id):
    """Delete achievement"""
    if request.method == "POST":
        achievement = get_object_or_404(Achievement, id=achievement_id)
        achievement_title = achievement.title
        achievement.delete()

        if request.headers.get("X-Requested-With") == "XMLHttpRequest":
            return JsonResponse(
                {
                    "success": True,
                    "message": f'Achievement "{achievement_title}" deleted successfully!',
                }
            )
        else:
            messages.success(request, f'Achievement "{achievement_title}" deleted successfully!')
            return redirect("manage_achievements")

    return JsonResponse({"success": False, "message": "Invalid request"}, status=400)


@staff_member_required(login_url="/admin/login/")
def list_achievements(request):
    """List all achievements view"""
    filter_type = request.GET.get("filter", "all")

    if filter_type == "draft":
        achievements = Achievement.objects.select_related("category").filter(is_draft=True)
    else:
        achievements = Achievement.objects.select_related("category").all()

    achievements = achievements.order_by("-achievement_date")

    # Count for filters
    total_count = Achievement.objects.count()
    draft_count = Achievement.objects.filter(is_draft=True).count()

    context = {
        "achievements": achievements,
        "current_filter": filter_type,
        "total_count": total_count,
        "draft_count": draft_count,
    }
    return render(request, "list_achievements.html", context)


# Categories Views
@staff_member_required(login_url="/admin/login/")
def manage_categories(request):
    """Manage categories view with AJAX support"""
    if (
        request.method == "POST"
        and request.headers.get("X-Requested-With") == "XMLHttpRequest"
    ):
        action = request.POST.get("action")

        # Create new category
        if action == "create":
            form = CategoryForm(request.POST)
            if form.is_valid():
                category = form.save()
                return JsonResponse(
                    {
                        "success": True,
                        "message": "Category created successfully!",
                        "category": {
                            "id": category.id,
                            "name": category.name,
                            "slug": category.slug,
                            "category_type": category.category_type,
                            "category_type_display": category.get_category_type_display(),
                            "description": category.description or "",
                            "icon": category.icon,
                            "color": category.color,
                            "item_count": category.item_count(),
                        },
                    }
                )
            else:
                return JsonResponse(
                    {
                        "success": False,
                        "message": "Invalid data. Please check the form.",
                        "errors": form.errors,
                    },
                    status=400,
                )

        # Update category
        elif action == "update":
            category_id = request.POST.get("category_id")
            try:
                category = Category.objects.get(id=category_id)
                form = CategoryForm(request.POST, instance=category)
                if form.is_valid():
                    category = form.save()
                    return JsonResponse(
                        {
                            "success": True,
                            "message": "Category updated successfully!",
                            "category": {
                                "id": category.id,
                                "name": category.name,
                                "slug": category.slug,
                                "category_type": category.category_type,
                                "category_type_display": category.get_category_type_display(),
                                "description": category.description or "",
                                "icon": category.icon,
                                "color": category.color,
                                "item_count": category.item_count(),
                            },
                        }
                    )
                else:
                    return JsonResponse(
                        {
                            "success": False,
                            "message": "Invalid data. Please check the form.",
                            "errors": form.errors,
                        },
                        status=400,
                    )
            except Category.DoesNotExist:
                return JsonResponse(
                    {"success": False, "message": "Category not found."},
                    status=404,
                )

        # Delete category
        elif action == "delete":
            category_id = request.POST.get("category_id")
            try:
                category = Category.objects.get(id=category_id)
                category_name = category.name
                category.delete()
                return JsonResponse(
                    {
                        "success": True,
                        "message": f"Category '{category_name}' deleted successfully!",
                    }
                )
            except Category.DoesNotExist:
                return JsonResponse(
                    {"success": False, "message": "Category not found."},
                    status=404,
                )

        # Get category for editing
        elif action == "get":
            category_id = request.POST.get("category_id")
            try:
                category = Category.objects.get(id=category_id)
                return JsonResponse(
                    {
                        "success": True,
                        "category": {
                            "id": category.id,
                            "name": category.name,
                            "slug": category.slug,
                            "category_type": category.category_type,
                            "description": category.description or "",
                            "icon": category.icon,
                            "color": category.color,
                        },
                    }
                )
            except Category.DoesNotExist:
                return JsonResponse(
                    {"success": False, "message": "Category not found."},
                    status=404,
                )

    # GET request - display categories
    categories = Category.objects.all()
    form = CategoryForm()
    context = {"categories": categories, "form": form}
    return render(request, "manage_categories.html", context)


# Details Views
@staff_member_required(login_url="/admin/login/")
def manage_details(request):
    """Manage user profile details with AJAX support and input validation"""
    # Get or create user profile (assuming single user)
    profile, created = UserProfile.objects.get_or_create(
        id=1,
        defaults={
            "full_name": "Your Name",
            "email": "your.email@example.com",
            "title": "Your Professional Title",
        },
    )

    if request.method == "POST":
        if request.headers.get("X-Requested-With") == "XMLHttpRequest":
            # Handle AJAX form submissions
            form_type = request.POST.get("form_type")

            if form_type == "personal_info":
                full_name = request.POST.get("full_name", "").strip()
                email = request.POST.get("email", "").strip().lower()
                title = request.POST.get("title", "").strip()

                if len(full_name) < 2:
                    return JsonResponse(
                        {"success": False, "message": "Full name must be at least 2 characters."},
                        status=400,
                    )
                try:
                    validate_email(email)
                except ValidationError:
                    return JsonResponse(
                        {"success": False, "message": "Please enter a valid email address."},
                        status=400,
                    )
                if not title:
                    return JsonResponse(
                        {"success": False, "message": "Professional title is required."},
                        status=400,
                    )

                profile.full_name = full_name
                profile.email = email
                profile.phone = request.POST.get("phone", "").strip()
                profile.location = request.POST.get("location", "").strip()
                profile.title = title
                profile.bio = request.POST.get("bio", "").strip()
                profile.save()
                return JsonResponse(
                    {
                        "success": True,
                        "message": "Personal information updated successfully!",
                    }
                )

            elif form_type == "social_links":
                profile.github = request.POST.get("github", "").strip()
                profile.linkedin = request.POST.get("linkedin", "").strip()
                profile.twitter = request.POST.get("twitter", "").strip()
                profile.instagram = request.POST.get("instagram", "").strip()
                profile.youtube = request.POST.get("youtube", "").strip()
                profile.website = request.POST.get("website", "").strip()
                profile.save()
                return JsonResponse(
                    {"success": True, "message": "Social links updated successfully!"}
                )

            elif form_type == "seo":
                profile.meta_title = request.POST.get("meta_title", "").strip()
                profile.meta_description = request.POST.get("meta_description", "").strip()
                profile.meta_keywords = request.POST.get("meta_keywords", "").strip()
                profile.save()
                return JsonResponse(
                    {"success": True, "message": "SEO settings updated successfully!"}
                )

            elif form_type == "preferences":
                status_val = request.POST.get("status", "available").strip()
                work_type_val = request.POST.get("work_type", "remote").strip()
                hourly_rate_raw = request.POST.get("hourly_rate")
                exp_years_raw = request.POST.get("experience_years")

                hourly_rate = parse_decimal(hourly_rate_raw)
                exp_years = parse_int(exp_years_raw)
                if exp_years is None or exp_years < 0:
                    exp_years = 0

                profile.status = status_val if status_val in dict(UserProfile.STATUS_CHOICES) else "available"
                profile.work_type = work_type_val if work_type_val in dict(UserProfile.WORK_TYPE_CHOICES) else "remote"
                profile.hourly_rate = hourly_rate
                profile.experience_years = exp_years
                profile.open_to_opportunities = (
                    request.POST.get("open_to_opportunities") in {"on", "true", "1", True}
                )
                profile.available_for_freelance = (
                    request.POST.get("available_for_freelance") in {"on", "true", "1", True}
                )
                profile.save()
                return JsonResponse(
                    {"success": True, "message": "Preferences updated successfully!"}
                )

            elif form_type == "profile_image":
                if "profile_image" in request.FILES:
                    img_file = request.FILES["profile_image"]
                    ext = Path(img_file.name).suffix.lower()
                    if ext not in {".jpg", ".jpeg", ".png", ".webp", ".gif"}:
                        return JsonResponse(
                            {"success": False, "message": "Invalid image format. Allowed: JPG, PNG, WebP, GIF."},
                            status=400,
                        )
                    if img_file.size > 10 * 1024 * 1024:
                        return JsonResponse(
                            {"success": False, "message": "Image size exceeds 10MB limit."},
                            status=400,
                        )
                    profile.profile_image = img_file
                    profile.save()
                    return JsonResponse(
                        {
                            "success": True,
                            "message": "Profile image updated successfully!",
                            "image_url": (
                                profile.profile_image.url
                                if profile.profile_image
                                else None
                            ),
                        }
                    )
                return JsonResponse(
                    {"success": False, "message": "No image file provided"},
                    status=400,
                )

            elif form_type == "delete_profile_image":
                if profile.profile_image:
                    profile.profile_image.delete()
                    profile.save()
                    return JsonResponse(
                        {
                            "success": True,
                            "message": "Profile image deleted successfully!",
                        }
                    )
                return JsonResponse(
                    {"success": False, "message": "No profile image to delete"}
                )

            elif form_type == "upload_resume":
                if "resume" in request.FILES:
                    doc_file = request.FILES["resume"]
                    ext = Path(doc_file.name).suffix.lower()
                    if ext not in {".pdf", ".doc", ".docx"}:
                        return JsonResponse(
                            {"success": False, "message": "Invalid document format. Allowed: PDF, DOC, DOCX."},
                            status=400,
                        )
                    if doc_file.size > 15 * 1024 * 1024:
                        return JsonResponse(
                            {"success": False, "message": "File size exceeds 15MB limit."},
                            status=400,
                        )
                    profile.resume = doc_file
                    profile.save()
                    return JsonResponse(
                        {"success": True, "message": "Resume uploaded successfully!"}
                    )
                return JsonResponse({"success": False, "message": "No file provided"}, status=400)

            elif form_type == "upload_cover_letter":
                if "cover_letter" in request.FILES:
                    doc_file = request.FILES["cover_letter"]
                    ext = Path(doc_file.name).suffix.lower()
                    if ext not in {".pdf", ".doc", ".docx"}:
                        return JsonResponse(
                            {"success": False, "message": "Invalid document format. Allowed: PDF, DOC, DOCX."},
                            status=400,
                        )
                    if doc_file.size > 15 * 1024 * 1024:
                        return JsonResponse(
                            {"success": False, "message": "File size exceeds 15MB limit."},
                            status=400,
                        )
                    profile.cover_letter = doc_file
                    profile.save()
                    return JsonResponse(
                        {
                            "success": True,
                            "message": "Cover letter uploaded successfully!",
                        }
                    )
                return JsonResponse({"success": False, "message": "No file provided"}, status=400)

            elif form_type == "delete_resume":
                if profile.resume:
                    profile.resume.delete()
                    profile.save()
                    return JsonResponse(
                        {"success": True, "message": "Resume deleted successfully!"}
                    )
                return JsonResponse(
                    {"success": False, "message": "No resume to delete"}
                )

            elif form_type == "delete_cover_letter":
                if profile.cover_letter:
                    profile.cover_letter.delete()
                    profile.save()
                    return JsonResponse(
                        {
                            "success": True,
                            "message": "Cover letter deleted successfully!",
                        }
                    )
                return JsonResponse(
                    {"success": False, "message": "No cover letter to delete"}
                )

            elif form_type == "video_resume":
                profile.video_resume = request.POST.get("video_resume", "").strip()
                profile.save()
                return JsonResponse(
                    {
                        "success": True,
                        "message": "Video resume link updated successfully!",
                    }
                )

            return JsonResponse({"success": False, "message": "Invalid form type"}, status=400)

    form = UserProfileForm(instance=profile)
    
    # Check if resume and cover letter files exist
    resume_exists = False
    resume_size = 0
    if profile.resume:
        try:
            resume_exists = profile.resume.storage.exists(profile.resume.name)
            if resume_exists:
                resume_size = profile.resume.size
        except (OSError, ValueError):
            resume_exists = False
    
    cover_letter_exists = False
    cover_letter_size = 0
    if profile.cover_letter:
        try:
            cover_letter_exists = profile.cover_letter.storage.exists(profile.cover_letter.name)
            if cover_letter_exists:
                cover_letter_size = profile.cover_letter.size
        except (OSError, ValueError):
            cover_letter_exists = False
    
    context = {
        "profile": profile,
        "form": form,
        "resume_exists": resume_exists,
        "resume_size": resume_size,
        "cover_letter_exists": cover_letter_exists,
        "cover_letter_size": cover_letter_size,
    }
    return render(request, "manage_details.html", context)
