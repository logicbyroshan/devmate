from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from portfolio.models import Category

User = get_user_model()


class AdminCategoryAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.staff_user = User.objects.create_user(
            username="staff_admin",
            password="StrongStaffPassword123!",
            is_staff=True,
        )
        self.client.force_authenticate(user=self.staff_user)

    def test_create_and_filter_category(self):
        payload = {
            "name": "Machine Learning",
            "category_type": "project",
            "icon": "fas fa-brain",
            "color": "#8b5cf6",
            "description": "AI and ML projects.",
        }
        response = self.client.post("/api/v1/admin/categories/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["data"]["slug"], "machine-learning")

        # Test filter
        list_resp = self.client.get("/api/v1/admin/categories/?type=project")
        self.assertEqual(list_resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(list_resp.data["count"], 1)

    def test_delete_category(self):
        cat = Category.objects.create(name="Temp Cat", slug="temp-cat", category_type="skill")
        del_resp = self.client.delete(f"/api/v1/admin/categories/{cat.id}/")
        self.assertEqual(del_resp.status_code, status.HTTP_200_OK)
        self.assertFalse(Category.objects.filter(id=cat.id).exists())
