from datetime import date

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import connection
from django.test import TestCase, override_settings
from django.test.utils import CaptureQueriesContext
from django.urls import reverse

from .models import (
	Achievement,
	Category,
	ContactMessage,
	Experience,
	Project,
	Skill,
	UserProfile,
)
from .views import generate_unique_slug

User = get_user_model()


@override_settings(API_KEY="", SECURE_SSL_REDIRECT=False)
class ProjectApiVisibilityTests(TestCase):
	def setUp(self):
		self.category = Category.objects.create(
			name="Web Development",
			slug="web-development",
			category_type="project",
		)
		Project.objects.create(
			title="Published Project",
			slug="published-project",
			description="Visible project",
			technologies="Django, React",
			category=self.category,
			status="active",
			is_active=True,
		)
		Project.objects.create(
			title="Draft Project",
			slug="draft-project",
			description="Should stay hidden",
			technologies="Django",
			category=self.category,
			status="draft",
			is_active=True,
		)

	def test_projects_list_excludes_drafts(self):
		response = self.client.get(reverse("api-projects-list"))
		self.assertEqual(response.status_code, 200)

		payload = response.json()
		results = payload.get("results", payload)
		slugs = {item["slug"] for item in results}

		self.assertIn("published-project", slugs)
		self.assertNotIn("draft-project", slugs)

	def test_summary_excludes_drafts_from_active_count(self):
		response = self.client.get(reverse("api-summary"))
		self.assertEqual(response.status_code, 200)

		payload = response.json()
		self.assertEqual(payload["active_projects"], 1)
		self.assertEqual(payload["total_projects"], 2)


@override_settings(API_KEY="", SECURE_SSL_REDIRECT=False)
class SlugGenerationTests(TestCase):
	def test_generate_unique_slug_for_skill(self):
		Skill.objects.create(name="Python", slug="python", proficiency=90)
		self.assertEqual(generate_unique_slug(Skill, "Python"), "python-1")

	def test_generate_unique_slug_for_achievement(self):
		Achievement.objects.create(
			title="AWS Certified",
			slug="aws-certified",
			issuing_organization="AWS",
			achievement_date=date.today(),
			short_description="Cloud certification",
		)
		self.assertEqual(
			generate_unique_slug(Achievement, "AWS Certified"),
			"aws-certified-1",
		)

	def test_create_skill_view_handles_slug_collisions(self):
		Skill.objects.create(name="JavaScript", slug="javascript", proficiency=80)

		user_model = get_user_model()
		user = user_model.objects.create_user(
			username="admin",
			password="pass1234",
			is_staff=True,
		)
		self.client.force_login(user)

		response = self.client.post(
			reverse("create_skill"),
			{
				"name": "JavaScript",
				"skill_level": "advanced",
				"proficiency": 85,
				"description": "Frontend language",
				"icon_type": "fontawesome",
				"icon_class": "fab fa-js",
				"certificate_type": "link",
				"certificate_url": "https://example.com/cert",
				"is_active": "on",
				"is_draft": "",
				"order": 0,
			},
			follow=True,
		)

		self.assertEqual(response.status_code, 200)
		self.assertTrue(Skill.objects.filter(slug="javascript-1").exists())


@override_settings(API_KEY="", SECURE_SSL_REDIRECT=False)
class CategoryItemCountTests(TestCase):
	def test_skill_and_experience_category_item_counts(self):
		skill_category = Category.objects.create(
			name="Languages",
			slug="languages",
			category_type="skill",
		)
		experience_category = Category.objects.create(
			name="Full Time",
			slug="full-time-experience",
			category_type="experience",
		)

		Skill.objects.create(
			name="Go",
			slug="go",
			category=skill_category,
			proficiency=75,
		)
		Experience.objects.create(
			position="Backend Engineer",
			slug="backend-engineer",
			category=experience_category,
			company_name="Example Inc",
			start_date=date(2024, 1, 1),
			short_description="Built APIs",
			is_active=True,
			is_draft=False,
		)

		self.assertEqual(skill_category.item_count(), 1)
		self.assertEqual(experience_category.item_count(), 1)


@override_settings(API_KEY="", SECURE_SSL_REDIRECT=False)
class SkillValidationTests(TestCase):
	def test_proficiency_above_100_is_invalid(self):
		skill = Skill(name="Invalid High", slug="invalid-high", proficiency=101)
		with self.assertRaises(ValidationError):
			skill.full_clean()

	def test_proficiency_below_0_is_invalid(self):
		skill = Skill(name="Invalid Low", slug="invalid-low", proficiency=-1)
		with self.assertRaises(ValidationError):
			skill.full_clean()


@override_settings(API_KEY="test-api-key", SECURE_SSL_REDIRECT=False)
class APIKeyPermissionTests(TestCase):
	def setUp(self):
		category = Category.objects.create(
			name="Backend",
			slug="backend",
			category_type="project",
		)
		Project.objects.create(
			title="API Service",
			slug="api-service",
			description="Public API",
			technologies="Django",
			category=category,
			status="active",
			is_active=True,
		)

	def test_request_without_api_key_is_forbidden_when_configured(self):
		response = self.client.get(reverse("api-projects-list"))
		self.assertIn(response.status_code, {401, 403})

	def test_request_with_api_key_is_allowed(self):
		response = self.client.get(
			reverse("api-projects-list"),
			HTTP_X_API_KEY="test-api-key",
		)
		self.assertEqual(response.status_code, 200)


@override_settings(API_KEY="", SECURE_SSL_REDIRECT=False)
class ApiQueryPerformanceTests(TestCase):
	def setUp(self):
		self.category = Category.objects.create(
			name="Performance Category",
			slug="performance-category",
			category_type="project",
		)

		for index in range(8):
			Project.objects.create(
				title=f"Perf Project {index}",
				slug=f"perf-project-{index}",
				description="Performance payload",
				technologies="Django",
				category=self.category,
				status="active",
				is_active=True,
				is_featured=True,
			)

		skill_category = Category.objects.create(
			name="Performance Skill Category",
			slug="performance-skill-category",
			category_type="skill",
		)
		experience_category = Category.objects.create(
			name="Performance Experience Category",
			slug="performance-experience-category",
			category_type="experience",
		)

		Skill.objects.create(
			name="Performance Skill",
			slug="performance-skill",
			skill_level="advanced",
			proficiency=90,
			category=skill_category,
			is_active=True,
			is_draft=False,
		)
		Experience.objects.create(
			position="Performance Engineer",
			slug="performance-engineer",
			company_name="Perf Company",
			start_date=date(2024, 1, 1),
			short_description="Performance test entry",
			category=experience_category,
			is_active=True,
			is_draft=False,
		)

	def test_projects_endpoint_query_count_stays_bounded(self):
		with CaptureQueriesContext(connection) as ctx:
			response = self.client.get(reverse("api-projects-list"))

		self.assertEqual(response.status_code, 200)
		self.assertLessEqual(len(ctx.captured_queries), 8)

	def test_categories_endpoint_query_count_stays_bounded(self):
		with CaptureQueriesContext(connection) as ctx:
			response = self.client.get(reverse("api-categories-list"))

		self.assertEqual(response.status_code, 200)
		self.assertLessEqual(len(ctx.captured_queries), 4)

	def test_bootstrap_endpoint_uses_single_payload_and_bounded_queries(self):
		with CaptureQueriesContext(connection) as ctx:
			response = self.client.get(reverse("api-bootstrap"))

		self.assertEqual(response.status_code, 200)
		payload = response.json()
		self.assertIn("profile", payload)
		self.assertIn("projects", payload)
		self.assertIn("skills", payload)
		self.assertIn("experience", payload)
		self.assertLessEqual(len(ctx.captured_queries), 14)


@override_settings(
	API_KEY="",
	SECURE_SSL_REDIRECT=False,
	ALLOWED_HOSTS=["admin.logicbyroshan.in", "logicbyroshan.in", "www.logicbyroshan.in", "testserver"],
)
class AdminSubdomainAccessTests(TestCase):
	def test_intended_admin_subdomain_reaches_login(self):
		response = self.client.get("/", HTTP_HOST="admin.logicbyroshan.in")

		self.assertEqual(response.status_code, 302)
		self.assertIn("/admin/login/", response["Location"])

	def test_root_domain_also_reaches_login_when_unauthenticated(self):
		response = self.client.get("/", HTTP_HOST="logicbyroshan.in")

		self.assertEqual(response.status_code, 302)
		self.assertIn("/admin/login/", response["Location"])


@override_settings(API_KEY="", SECURE_SSL_REDIRECT=False)
class AdminStaffAccessTests(TestCase):
	def test_non_staff_user_is_redirected_from_management_pages(self):
		user_model = get_user_model()
		non_staff = user_model.objects.create_user(
			username="content-user",
			password="pass1234",
			is_staff=False,
		)
		self.client.force_login(non_staff)

		response = self.client.get(reverse("dashboard"))
		self.assertEqual(response.status_code, 302)
		self.assertIn("/admin/login/", response["Location"])


@override_settings(API_KEY="", SECURE_SSL_REDIRECT=False)
class AdminCrudFlowTests(TestCase):
	def setUp(self):
		user_model = get_user_model()
		self.user = user_model.objects.create_user(
			username="admin-flow",
			password="pass1234",
			is_staff=True,
		)
		self.client.force_login(self.user)

		self.project_category = Category.objects.create(
			name="Flow Project",
			slug="flow-project",
			category_type="project",
		)
		self.experience_category = Category.objects.create(
			name="Flow Experience",
			slug="flow-experience",
			category_type="experience",
		)
		self.skill_category = Category.objects.create(
			name="Flow Skill",
			slug="flow-skill",
			category_type="skill",
		)
		self.achievement_category = Category.objects.create(
			name="Flow Achievement",
			slug="flow-achievement",
			category_type="achievement",
		)

		self.project = Project.objects.create(
			title="Existing Project",
			slug="existing-project",
			description="Existing project",
			technologies="Django",
			category=self.project_category,
			status="active",
			is_active=True,
		)
		self.experience = Experience.objects.create(
			position="Existing Engineer",
			slug="existing-engineer",
			company_name="Example Corp",
			start_date=date(2024, 1, 1),
			short_description="Existing experience",
			category=self.experience_category,
			is_active=True,
			is_draft=False,
		)
		self.skill = Skill.objects.create(
			name="Existing Skill",
			slug="existing-skill",
			skill_level="advanced",
			proficiency=85,
			category=self.skill_category,
			is_active=True,
			is_draft=False,
		)
		self.achievement = Achievement.objects.create(
			title="Existing Achievement",
			slug="existing-achievement",
			issuing_organization="Org",
			achievement_date=date(2024, 5, 1),
			short_description="Existing achievement",
			category=self.achievement_category,
			is_active=True,
			is_draft=False,
		)

	def test_management_urls_load_for_authenticated_user(self):
		urls = [
			reverse("dashboard"),
			reverse("manage_projects"),
			reverse("create_project"),
			reverse("edit_project", args=[self.project.id]),
			reverse("list_projects"),
			reverse("manage_experience"),
			reverse("create_experience"),
			reverse("edit_experience", args=[self.experience.id]),
			reverse("list_experience"),
			reverse("manage_skills"),
			reverse("create_skill"),
			reverse("edit_skill", args=[self.skill.id]),
			reverse("list_skills"),
			reverse("manage_achievements"),
			reverse("create_achievement"),
			reverse("edit_achievement", args=[self.achievement.id]),
			reverse("list_achievements"),
			reverse("manage_categories"),
			reverse("manage_details"),
		]

		for url in urls:
			response = self.client.get(url)
			self.assertEqual(response.status_code, 200, msg=f"URL failed: {url}")

	def test_project_create_generates_unique_slug_and_ajax_validation(self):
		first_response = self.client.post(
			reverse("create_project"),
			{
				"title": "Flow Generated Slug",
				"project_name": "Flow Generated Slug",
				"category": self.project_category.id,
				"description": "Project body",
				"technologies": "Django,React",
				"status": "active",
				"is_active": "on",
				"order": 0,
			},
		)
		self.assertEqual(first_response.status_code, 302)

		first_project = Project.objects.get(title="Flow Generated Slug")
		self.assertTrue(first_project.slug)

		second_response = self.client.post(
			reverse("create_project"),
			{
				"title": "Flow Generated Slug",
				"project_name": "Flow Generated Slug Copy",
				"category": self.project_category.id,
				"description": "Second project body",
				"technologies": "Django",
				"status": "active",
				"is_active": "on",
				"order": 0,
			},
		)
		self.assertEqual(second_response.status_code, 302)

		projects = Project.objects.filter(title="Flow Generated Slug").order_by("id")
		self.assertEqual(projects.count(), 2)
		self.assertNotEqual(projects[0].slug, projects[1].slug)

		invalid_response = self.client.post(
			reverse("create_project"),
			{
				"title": "",
				"description": "",
				"technologies": "",
			},
			HTTP_X_REQUESTED_WITH="XMLHttpRequest",
		)
		self.assertEqual(invalid_response.status_code, 400)
		self.assertFalse(invalid_response.json()["success"])

	def test_project_edit_and_delete_ajax(self):
		response = self.client.post(
			reverse("edit_project", args=[self.project.id]),
			{
				"title": "Updated Existing Project",
				"project_name": "Updated Existing Project",
				"category": self.project_category.id,
				"description": "Updated description",
				"technologies": "Django,HTMX",
				"status": "active",
				"is_active": "on",
				"order": 1,
			},
		)
		self.assertEqual(response.status_code, 302)
		self.project.refresh_from_db()
		self.assertEqual(self.project.title, "Updated Existing Project")

		delete_response = self.client.post(
			reverse("delete_project", args=[self.project.id]),
			HTTP_X_REQUESTED_WITH="XMLHttpRequest",
		)
		self.assertEqual(delete_response.status_code, 200)
		self.assertTrue(delete_response.json()["success"])
		self.assertFalse(Project.objects.filter(id=self.project.id).exists())

	def test_experience_skill_and_achievement_crud_flows(self):
		experience_create = self.client.post(
			reverse("create_experience"),
			{
				"position": "Flow Experience",
				"employment_type": "full-time",
				"employment_status": "current",
				"category": self.experience_category.id,
				"company_name": "Flow Company",
				"start_date": "2024-01-01",
				"short_description": "Flow experience description",
				"is_draft": "false",
			},
		)
		self.assertEqual(experience_create.status_code, 302)
		experience_obj = Experience.objects.get(position="Flow Experience")
		self.assertTrue(experience_obj.slug)

		experience_edit = self.client.post(
			reverse("edit_experience", args=[experience_obj.id]),
			{
				"position": "Flow Experience Updated",
				"employment_type": "full-time",
				"employment_status": "current",
				"category": self.experience_category.id,
				"company_name": "Flow Company",
				"start_date": "2024-01-01",
				"short_description": "Updated flow experience",
				"is_draft": "false",
				"order": 0,
			},
		)
		self.assertEqual(experience_edit.status_code, 302)

		experience_delete = self.client.post(
			reverse("delete_experience", args=[experience_obj.id]),
			HTTP_X_REQUESTED_WITH="XMLHttpRequest",
		)
		self.assertEqual(experience_delete.status_code, 200)
		self.assertTrue(experience_delete.json()["success"])

		skill_create = self.client.post(
			reverse("create_skill"),
			{
				"name": "Flow Skill",
				"skill_level": "advanced",
				"category": self.skill_category.id,
				"proficiency": 90,
				"description": "Flow skill description",
				"icon_type": "fontawesome",
				"icon_class": "fas fa-code",
				"certificate_type": "link",
				"certificate_url": "https://example.com/skill-cert",
				"is_active": "on",
				"is_draft": "",
				"order": 0,
			},
		)
		self.assertEqual(skill_create.status_code, 302)
		skill_obj = Skill.objects.get(name="Flow Skill")

		skill_edit = self.client.post(
			reverse("edit_skill", args=[skill_obj.id]),
			{
				"name": "Flow Skill Updated",
				"skill_level": "expert",
				"category": self.skill_category.id,
				"proficiency": 95,
				"description": "Updated flow skill",
				"icon_type": "fontawesome",
				"icon_class": "fas fa-code",
				"certificate_type": "link",
				"certificate_url": "https://example.com/skill-cert",
				"is_active": "on",
				"is_draft": "",
				"order": 0,
			},
		)
		self.assertEqual(skill_edit.status_code, 302)

		skill_delete = self.client.post(
			reverse("delete_skill", args=[skill_obj.id]),
			HTTP_X_REQUESTED_WITH="XMLHttpRequest",
		)
		self.assertEqual(skill_delete.status_code, 200)
		self.assertTrue(skill_delete.json()["success"])

		achievement_create = self.client.post(
			reverse("create_achievement"),
			{
				"title": "Flow Achievement",
				"category": self.achievement_category.id,
				"issuing_organization": "Flow Org",
				"achievement_date": "2024-04-01",
				"short_description": "Flow achievement description",
				"credential_type": "link",
				"credential_url": "https://example.com/achievement",
				"is_active": "True",
				"is_draft": "False",
				"order": 0,
			},
		)
		self.assertEqual(achievement_create.status_code, 302)
		achievement_obj = Achievement.objects.get(title="Flow Achievement")

		achievement_edit = self.client.post(
			reverse("edit_achievement", args=[achievement_obj.id]),
			{
				"title": "Flow Achievement Updated",
				"category": self.achievement_category.id,
				"issuing_organization": "Flow Org",
				"achievement_date": "2024-04-01",
				"short_description": "Updated flow achievement",
				"credential_type": "link",
				"credential_url": "https://example.com/achievement",
				"is_active": "True",
				"is_draft": "False",
				"order": 0,
			},
		)
		self.assertEqual(achievement_edit.status_code, 302)

		achievement_delete = self.client.post(
			reverse("delete_achievement", args=[achievement_obj.id]),
			HTTP_X_REQUESTED_WITH="XMLHttpRequest",
		)
		self.assertEqual(achievement_delete.status_code, 200)
		self.assertTrue(achievement_delete.json()["success"])

	def test_toggle_endpoints_return_400_for_invalid_ids(self):
		cases = [
			(reverse("manage_projects"), {"project_id": "abc", "is_active": "true"}),
			(reverse("manage_experience"), {"experience_id": "abc", "is_active": "true"}),
			(reverse("manage_skills"), {"skill_id": "abc", "is_active": "true"}),
			(reverse("manage_achievements"), {"achievement_id": "abc", "is_active": "true"}),
		]

		for url, payload in cases:
			response = self.client.post(
				url,
				payload,
				HTTP_X_REQUESTED_WITH="XMLHttpRequest",
			)
			self.assertEqual(response.status_code, 400, msg=f"Expected 400 for {url}")
			self.assertFalse(response.json().get("success", False))


@override_settings(API_KEY="", SECURE_SSL_REDIRECT=False)
class ServiceLayerAndV1ApiTests(TestCase):
	def setUp(self):
		self.cat = Category.objects.create(
			name="Full Stack",
			slug="full-stack",
			category_type="project",
		)
		self.project = Project.objects.create(
			title="CardFlow SaaS",
			slug="cardflow-saas",
			description="ID Card SaaS",
			technologies="Django, React",
			category=self.cat,
			status="active",
			is_active=True,
			is_featured=True,
			views=10,
			likes=5,
		)
		self.profile = UserProfile.objects.create(
			full_name="Roshan Damor",
			email="mail@logicbyroshan.in",
			title="AI Full Stack Developer",
			location="India",
			experience_years=3,
		)

	def test_api_v1_health_endpoint(self):
		response = self.client.get("/api/v1/health/")
		self.assertEqual(response.status_code, 200)
		data = response.json()
		self.assertEqual(data["status"], "healthy")
		self.assertEqual(data["api_version"], "v1")
		self.assertEqual(data["database"]["status"], "ok")

	def test_api_canonical_health_endpoint(self):
		response = self.client.get("/api/health/")
		self.assertEqual(response.status_code, 200)
		data = response.json()
		self.assertEqual(data["status"], "healthy")

	def test_api_v1_projects_and_actions(self):
		# List
		response = self.client.get("/api/v1/projects/")
		self.assertEqual(response.status_code, 200)

		# Featured
		response_featured = self.client.get("/api/v1/projects/featured/")
		self.assertEqual(response_featured.status_code, 200)
		self.assertTrue(len(response_featured.json()) >= 1)

		# Detail
		response_detail = self.client.get("/api/v1/projects/cardflow-saas/")
		self.assertEqual(response_detail.status_code, 200)
		self.assertEqual(response_detail.json()["slug"], "cardflow-saas")

		# Like action
		response_like = self.client.post("/api/v1/projects/cardflow-saas/like/")
		self.assertEqual(response_like.status_code, 200)
		self.assertEqual(response_like.json()["likes"], 6)

		# View action
		response_view = self.client.post("/api/v1/projects/cardflow-saas/view/")
		self.assertEqual(response_view.status_code, 200)
		self.assertEqual(response_view.json()["views"], 11)

	def test_contact_service_spam_and_rate_limiting(self):
		# Short message rejected
		resp = self.client.post(
			"/api/v1/contact/",
			{"full_name": "Alice", "email": "alice@example.com", "message": "Hi"},
		)
		self.assertEqual(resp.status_code, 400)
		self.assertFalse(resp.json()["success"])

		# Crypto spam rejected
		resp_spam = self.client.post(
			"/api/v1/contact/",
			{"full_name": "Spammer", "email": "spammer@example.com", "message": "Buy best crypto investment now on our site!"},
		)
		self.assertEqual(resp_spam.status_code, 400)
		self.assertIn("spam", resp_spam.json()["message"].lower())

		# Too many links rejected
		resp_links = self.client.post(
			"/api/v1/contact/",
			{"full_name": "Linker", "email": "linker@example.com", "message": "Check https://site1.com and https://site2.com and https://site3.com for deals!"},
		)
		self.assertEqual(resp_links.status_code, 400)
		self.assertIn("links", resp_links.json()["message"].lower())

		# Valid submission
		resp_ok = self.client.post(
			"/api/v1/contact/",
			{
				"full_name": "Valid Client",
				"email": "client@example.com",
				"message": "Hello Roshan, we would like to discuss a software engineering contract with you.",
			},
		)
		self.assertEqual(resp_ok.status_code, 201)
		self.assertTrue(resp_ok.json()["success"])

		# Duplicate rejected
		resp_dup = self.client.post(
			"/api/v1/contact/",
			{
				"full_name": "Valid Client",
				"email": "client@example.com",
				"message": "Hello Roshan, we would like to discuss a software engineering contract with you.",
			},
		)
		self.assertEqual(resp_dup.status_code, 409)

	def test_rexi_chat_service(self):
		# Empty query rejected
		resp_empty = self.client.post("/api/v1/rexi/chat/", {"message": ""})
		self.assertEqual(resp_empty.status_code, 400)

		# Identity query
		resp_id = self.client.post("/api/v1/rexi/chat/", {"message": "Who are you?"})
		self.assertEqual(resp_id.status_code, 200)
		self.assertIn("Rexi", resp_id.json()["reply"])

		# Skill query
		resp_skill = self.client.post("/api/v1/rexi/chat/", {"message": "What is Roshan's tech stack?"})
		self.assertEqual(resp_skill.status_code, 200)
		self.assertIn("Roshan", resp_skill.json()["reply"])


@override_settings(API_KEY="prod-secret-key", SECURE_SSL_REDIRECT=False)
class ProductionSecurityHardeningTests(TestCase):
	def setUp(self):
		category = Category.objects.create(
			name="Security Cat",
			slug="sec-cat",
			category_type="project",
		)
		Project.objects.create(
			title="Sec Project",
			slug="sec-project",
			description="Sec desc",
			category=category,
			status="active",
			is_active=True,
		)

	@override_settings(DEBUG=False)
	def test_api_key_cannot_be_bypassed_by_localhost_in_production(self):
		"""When DEBUG=False, localhost request without X-API-Key MUST be rejected."""
		response = self.client.get(
			reverse("api-projects-list"),
			HTTP_HOST="localhost",
		)
		self.assertIn(response.status_code, {401, 403})

	@override_settings(DEBUG=True)
	def test_api_key_can_be_bypassed_by_localhost_in_debug_only(self):
		"""When DEBUG=True, localhost request without X-API-Key is permitted for dev."""
		response = self.client.get(
			reverse("api-projects-list"),
			HTTP_HOST="localhost",
		)
		self.assertEqual(response.status_code, 200)


@override_settings(API_KEY="", SECURE_SSL_REDIRECT=False)
class ManageDetailsValidationTests(TestCase):
	def setUp(self):
		self.user = User.objects.create_superuser(
			username="detailadmin",
			email="admin@example.com",
			password="strongpassword123",
		)
		self.client.force_login(self.user)

	def test_personal_info_valid(self):
		resp = self.client.post(
			reverse("manage_details"),
			{
				"form_type": "personal_info",
				"full_name": "Roshan Damor",
				"email": "roshan@example.com",
				"title": "Software Engineer",
				"bio": "Building reliable systems.",
			},
			HTTP_X_REQUESTED_WITH="XMLHttpRequest",
		)
		self.assertEqual(resp.status_code, 200)
		self.assertTrue(resp.json()["success"])

	def test_personal_info_invalid_email_rejected(self):
		resp = self.client.post(
			reverse("manage_details"),
			{
				"form_type": "personal_info",
				"full_name": "Roshan Damor",
				"email": "not-a-valid-email",
				"title": "Software Engineer",
			},
			HTTP_X_REQUESTED_WITH="XMLHttpRequest",
		)
		self.assertEqual(resp.status_code, 400)
		self.assertFalse(resp.json()["success"])

	def test_personal_info_short_name_rejected(self):
		resp = self.client.post(
			reverse("manage_details"),
			{
				"form_type": "personal_info",
				"full_name": "R",
				"email": "valid@example.com",
				"title": "Software Engineer",
			},
			HTTP_X_REQUESTED_WITH="XMLHttpRequest",
		)
		self.assertEqual(resp.status_code, 400)
		self.assertFalse(resp.json()["success"])

	def test_preferences_invalid_numbers_handled_gracefully(self):
		resp = self.client.post(
			reverse("manage_details"),
			{
				"form_type": "preferences",
				"status": "available",
				"work_type": "remote",
				"hourly_rate": "invalid-rate-string",
				"experience_years": "not-an-int",
			},
			HTTP_X_REQUESTED_WITH="XMLHttpRequest",
		)
		self.assertEqual(resp.status_code, 200)
		profile = UserProfile.objects.get(id=1)
		self.assertIsNone(profile.hourly_rate)
		self.assertEqual(profile.experience_years, 0)

	def test_profile_image_invalid_extension_rejected(self):
		from django.core.files.uploadedfile import SimpleUploadedFile
		fake_exe = SimpleUploadedFile("malicious.exe", b"binary content", content_type="application/octet-stream")
		resp = self.client.post(
			reverse("manage_details"),
			{"form_type": "profile_image", "profile_image": fake_exe},
			HTTP_X_REQUESTED_WITH="XMLHttpRequest",
		)
		self.assertEqual(resp.status_code, 400)
		self.assertIn("Invalid image format", resp.json()["message"])

	def test_resume_upload_invalid_extension_rejected(self):
		from django.core.files.uploadedfile import SimpleUploadedFile
		fake_script = SimpleUploadedFile("bad_script.py", b"print('hack')", content_type="text/x-python")
		resp = self.client.post(
			reverse("manage_details"),
			{"form_type": "upload_resume", "resume": fake_script},
			HTTP_X_REQUESTED_WITH="XMLHttpRequest",
		)
		self.assertEqual(resp.status_code, 400)
		self.assertIn("Invalid document format", resp.json()["message"])

