from datetime import date
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from portfolio.models import Achievement, Category

User = get_user_model()


class AdminAchievementAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.staff_user = User.objects.create_user(
            username="staff_admin",
            password="StrongStaffPassword123!",
            is_staff=True,
        )
        self.category = Category.objects.create(
            name="Certifications",
            slug="certifications",
            category_type="achievement",
        )
        self.client.force_authenticate(user=self.staff_user)

    def test_create_achievement(self):
        payload = {
            "title": "AWS Certified Solutions Architect",
            "issuing_organization": "Amazon Web Services",
            "achievement_date": "2024-05-15",
            "no_expiration": True,
            "category_id": self.category.id,
            "short_description": "Cloud architecture credentials.",
            "credential_type": "link",
            "credential_url": "https://aws.amazon.com/verify/12345",
            "is_active": True,
        }
        response = self.client.post("/api/v1/admin/achievements/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["success"])
        ach_id = response.data["data"]["id"]

        ach = Achievement.objects.get(id=ach_id)
        self.assertEqual(ach.title, "AWS Certified Solutions Architect")
        self.assertTrue(ach.no_expiration)
        self.assertIsNone(ach.expiration_date)

    def test_delete_achievement(self):
        ach = Achievement.objects.create(
            title="Hackathon Winner",
            issuing_organization="Tech Fest",
            achievement_date=date(2023, 10, 1),
            short_description="1st Place",
            category=self.category,
        )
        del_resp = self.client.delete(f"/api/v1/admin/achievements/{ach.id}/")
        self.assertEqual(del_resp.status_code, status.HTTP_200_OK)
        self.assertFalse(Achievement.objects.filter(id=ach.id).exists())
