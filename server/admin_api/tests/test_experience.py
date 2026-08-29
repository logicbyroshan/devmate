from datetime import date
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from portfolio.models import Experience, Category

User = get_user_model()


class AdminExperienceAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.staff_user = User.objects.create_user(
            username="staff_admin",
            password="StrongStaffPassword123!",
            is_staff=True,
        )
        self.category = Category.objects.create(
            name="Engineering",
            slug="engineering",
            category_type="experience",
        )
        self.client.force_authenticate(user=self.staff_user)

    def test_create_experience(self):
        payload = {
            "position": "Senior Software Architect",
            "company_name": "Acme Global Tech",
            "start_date": "2024-01-01",
            "currently_working": True,
            "short_description": "Architecting microservices and real-time streaming pipelines.",
            "employment_type": "full-time",
            "employment_status": "current",
            "category_id": self.category.id,
            "is_active": True,
        }
        response = self.client.post("/api/v1/admin/experience/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["success"])
        exp_id = response.data["data"]["id"]

        exp = Experience.objects.get(id=exp_id)
        self.assertEqual(exp.position, "Senior Software Architect")
        self.assertTrue(exp.currently_working)
        self.assertIsNone(exp.end_date)

    def test_update_and_delete_experience(self):
        exp = Experience.objects.create(
            position="Junior Developer",
            company_name="Startup Inc",
            start_date=date(2023, 1, 1),
            short_description="Dev work",
        )

        # Update
        patch_resp = self.client.patch(
            f"/api/v1/admin/experience/{exp.id}/",
            {"position": "Lead Developer"},
            format="json",
        )
        self.assertEqual(patch_resp.status_code, status.HTTP_200_OK)
        exp.refresh_from_db()
        self.assertEqual(exp.position, "Lead Developer")

        # Delete
        del_resp = self.client.delete(f"/api/v1/admin/experience/{exp.id}/")
        self.assertEqual(del_resp.status_code, status.HTTP_200_OK)
        self.assertFalse(Experience.objects.filter(id=exp.id).exists())
