from datetime import date
from django.db import connection
from django.test import TestCase, override_settings
from django.test.utils import CaptureQueriesContext
from django.urls import reverse

from portfolio.models import Achievement, Category, Experience, Project, Skill, UserProfile
from portfolio.views import generate_unique_slug


@override_settings(API_KEY="", SECURE_SSL_REDIRECT=False)
class PortfolioDraftFilteringTests(TestCase):
	def setUp(self):
		self.category = Category.objects.create(
			name="Web Apps",
			slug="web-apps",
			category_type="project",
		)
		self.published_project = Project.objects.create(
			title="Published Project",
			slug="published-project",
			description="Published description",
			technologies="Django, React",
			category=self.category,
			status="active",
			is_active=True,
		)
		self.draft_project = Project.objects.create(
			title="Draft Project",
			slug="draft-project",
			description="Draft description",
			technologies="Django, Vue",
			category=self.category,
			status="draft",
			is_active=False,
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

	def test_generate_unique_slug_handles_collisions(self):
		Skill.objects.create(name="JavaScript", slug="javascript", proficiency=80)
		self.assertEqual(
			generate_unique_slug(Skill, "JavaScript"),
			"javascript-1",
		)


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
			proficiency=85,
			is_active=True,
		)
		Skill.objects.create(
			name="Rust",
			slug="rust",
			category=skill_category,
			proficiency=75,
			is_active=True,
		)
		Skill.objects.create(
			name="Deprecated Skill",
			slug="deprecated-skill",
			category=skill_category,
			proficiency=50,
			is_active=False,
		)

		Experience.objects.create(
			position="Platform Engineer",
			slug="platform-engineer",
			company_name="Cloud Corp",
			category=experience_category,
			start_date=date(2023, 1, 1),
			is_active=True,
		)

		self.assertEqual(skill_category.item_count(), 3)
		self.assertEqual(experience_category.item_count(), 1)


@override_settings(API_KEY="", SECURE_SSL_REDIRECT=False)
class CacheAndQueryPerformanceTests(TestCase):
	def setUp(self):
		self.project_category = Category.objects.create(
			name="Performance Project",
			slug="perf-project",
			category_type="project",
		)
		self.skill_category = Category.objects.create(
			name="Performance Skill",
			slug="perf-skill",
			category_type="skill",
		)
		self.experience_category = Category.objects.create(
			name="Performance Experience",
			slug="perf-experience",
			category_type="experience",
		)

		UserProfile.objects.create(
			full_name="Roshan Damor",
			email="mail@logicbyroshan.in",
			title="Software Engineer · Full Stack AI",
			bio="High-throughput systems specialist.",
			status="available",
			work_type="remote",
			hourly_rate=45,
			experience_years=3,
		)

		for idx in range(3):
			Project.objects.create(
				title=f"Project {idx}",
				slug=f"project-{idx}",
				description="Scalable system architecture",
				technologies="Django, PostgreSQL, Redis",
				category=self.project_category,
				status="active",
				is_active=True,
				views=10 + idx,
				likes=2 + idx,
			)

		for idx in range(4):
			Skill.objects.create(
				name=f"Skill {idx}",
				slug=f"skill-{idx}",
				category=self.skill_category,
				proficiency=80 + idx,
				is_active=True,
			)

		Experience.objects.create(
			position="Lead Systems Engineer",
			slug="lead-systems-engineer",
			company_name="Scale Labs",
			category=self.experience_category,
			start_date=date(2023, 6, 1),
			is_active=True,
		)

	def test_public_api_endpoints_accessible(self):
		endpoints = [
			reverse("api-bootstrap"),
			reverse("api-summary"),
			reverse("api-projects-list"),
			reverse("api-skills-list"),
			reverse("api-experience-list"),
			reverse("api-categories-list"),
			reverse("api-banners-list"),
		]

		for endpoint in endpoints:
			response = self.client.get(endpoint)
			self.assertEqual(response.status_code, 200, msg=f"Failed for {endpoint}")

	def test_projects_list_uses_bounded_queries(self):
		with CaptureQueriesContext(connection) as ctx:
			response = self.client.get(reverse("api-projects-list"))

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

	def test_api_v1_banners_endpoint(self):
		response = self.client.get("/api/v1/banners/")
		self.assertEqual(response.status_code, 200)
		data = response.json()
		self.assertEqual(data.get("status"), "ok")
		self.assertIn("banners", data)
		self.assertGreater(len(data["banners"]), 0)

	def test_api_v1_profile_endpoint(self):
		response = self.client.get("/api/v1/profile/")
		self.assertEqual(response.status_code, 200)
		data = response.json()
		self.assertEqual(data["full_name"], "Roshan Damor")

	def test_api_v1_projects_detail_endpoint(self):
		response = self.client.get(f"/api/v1/projects/{self.project.slug}/")
		self.assertEqual(response.status_code, 200)
		data = response.json()
		self.assertEqual(data["slug"], "cardflow-saas")

	def test_api_v1_project_like_and_view_endpoints(self):
		like_resp = self.client.post(f"/api/v1/projects/{self.project.slug}/like/")
		self.assertEqual(like_resp.status_code, 200)
		self.assertEqual(like_resp.json()["likes"], 6)

		view_resp = self.client.post(f"/api/v1/projects/{self.project.slug}/view/")
		self.assertEqual(view_resp.status_code, 200)
		self.assertEqual(view_resp.json()["views"], 11)

	def test_api_v1_skills_top_endpoint(self):
		Skill.objects.create(
			name="Python",
			slug="python",
			category=self.cat,
			proficiency=90,
			is_active=True,
		)
		response = self.client.get("/api/v1/skills/top/")
		self.assertEqual(response.status_code, 200)
		data = response.json()
		self.assertGreater(len(data), 0)
		self.assertEqual(data[0]["name"], "Python")

	def test_api_v1_contact_submission(self):
		payload = {
			"full_name": "Jane Doe",
			"email": "jane@example.com",
			"message": "Hi Roshan, let's discuss an enterprise SaaS project.",
		}
		response = self.client.post("/api/v1/contact/", payload, format="json")
		self.assertEqual(response.status_code, 201)
		data = response.json()
		self.assertTrue(data.get("success", False))

	def test_api_v1_rexi_chat_endpoint(self):
		payload = {
			"message": "Tell me about your experience.",
		}
		response = self.client.post("/api/v1/rexi/chat/", payload, format="json")
		self.assertEqual(response.status_code, 200)
		data = response.json()
		self.assertTrue(data.get("success", False))
		self.assertIn("reply", data)
		self.assertIn("model", data)

	def test_api_blogs_list_and_detail(self):
		list_res = self.client.get("/api/blogs/")
		self.assertEqual(list_res.status_code, 200)
		self.assertGreater(list_res.json()["count"], 0)

		detail_res = self.client.get("/api/blogs/understanding-microservices-architecture/")
		self.assertEqual(detail_res.status_code, 200)
		self.assertEqual(detail_res.json()["data"]["slug"], "understanding-microservices-architecture")
