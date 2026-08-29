import io
from PIL import Image
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from portfolio.models import Project, Category, ProjectScreenshot

User = get_user_model()


def generate_dummy_image(name="test.jpg", width=100, height=100):
    file = io.BytesIO()
    image = Image.new("RGB", (width, height), color=(50, 100, 150))
    image.save(file, "jpeg")
    file.seek(0)
    return SimpleUploadedFile(name, file.read(), content_type="image/jpeg")


class AdminProjectAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.staff_user = User.objects.create_user(
            username="staff_admin",
            password="StrongStaffPassword123!",
            is_staff=True,
        )
        self.normal_user = User.objects.create_user(
            username="normal_user",
            password="NormalPassword123!",
            is_staff=False,
        )
        self.category = Category.objects.create(
            name="Full-Stack Web",
            slug="full-stack-web",
            category_type="project",
        )
        self.client.force_authenticate(user=self.staff_user)

    def test_unauthenticated_access_blocked(self):
        self.client.force_authenticate(user=None)
        response = self.client.get("/api/v1/admin/projects/")
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_non_staff_access_blocked(self):
        self.client.force_authenticate(user=self.normal_user)
        response = self.client.get("/api/v1/admin/projects/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_project_with_screenshots(self):
        thumbnail = generate_dummy_image("thumb.jpg")
        shot1 = generate_dummy_image("shot1.jpg")
        shot2 = generate_dummy_image("shot2.jpg")

        payload = {
            "title": "Quantum AI Engine",
            "category_id": self.category.id,
            "description": "<p>A high-speed engine.</p>",
            "technologies": "Python, Rust, React",
            "status": "active",
            "is_active": True,
            "thumbnail": thumbnail,
            "screenshots": [shot1, shot2],
        }

        response = self.client.post("/api/v1/admin/projects/", payload, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["success"])
        project_id = response.data["data"]["id"]

        # Verify database creation
        project = Project.objects.get(id=project_id)
        self.assertEqual(project.title, "Quantum AI Engine")
        self.assertEqual(project.screenshots.count(), 2)
        self.assertIsNotNone(project.thumbnail)

    def test_update_and_partial_update_project(self):
        project = Project.objects.create(
            title="Initial Title",
            description="Initial description",
            technologies="Django",
            category=self.category,
            status="draft",
        )

        response = self.client.patch(
            f"/api/v1/admin/projects/{project.id}/",
            {"status": "active", "is_featured": True},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        project.refresh_from_db()
        self.assertEqual(project.status, "active")
        self.assertTrue(project.is_featured)

    def test_delete_project(self):
        project = Project.objects.create(
            title="To Delete",
            description="Delete me",
            technologies="None",
            category=self.category,
        )
        response = self.client.delete(f"/api/v1/admin/projects/{project.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Project.objects.filter(id=project.id).exists())

    def test_upload_and_delete_project_screenshot_actions(self):
        project = Project.objects.create(
            title="Gallery App",
            description="Gallery",
            technologies="React",
            category=self.category,
        )

        shot = generate_dummy_image("extra.jpg")
        upload_resp = self.client.post(
            f"/api/v1/admin/projects/{project.id}/upload-screenshots/",
            {"screenshots": [shot]},
            format="multipart",
        )
        self.assertEqual(upload_resp.status_code, status.HTTP_201_CREATED)
        screenshot_id = upload_resp.data["screenshots"][0]["id"]
        self.assertEqual(project.screenshots.count(), 1)

        # Delete screenshot
        del_resp = self.client.delete(
            f"/api/v1/admin/projects/{project.id}/screenshots/{screenshot_id}/"
        )
        self.assertEqual(del_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(project.screenshots.count(), 0)

    def test_reorder_projects(self):
        p1 = Project.objects.create(title="P1", technologies="T", category=self.category, order=0)
        p2 = Project.objects.create(title="P2", technologies="T", category=self.category, order=1)

        response = self.client.post(
            "/api/v1/admin/projects/reorder/",
            {"order_map": {str(p1.id): 10, str(p2.id): 20}},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        p1.refresh_from_db()
        p2.refresh_from_db()
        self.assertEqual(p1.order, 10)
        self.assertEqual(p2.order, 20)
