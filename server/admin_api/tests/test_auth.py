from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

User = get_user_model()


class AdminAuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.staff_user = User.objects.create_user(
            username="staff_admin",
            password="StrongStaffPassword123!",
            email="staff@example.com",
            is_staff=True,
        )
        self.normal_user = User.objects.create_user(
            username="normal_user",
            password="NormalPassword123!",
            email="normal@example.com",
            is_staff=False,
        )

    def test_staff_login_success(self):
        response = self.client.post(
            "/api/v1/admin/auth/login/",
            {"username": "staff_admin", "password": "StrongStaffPassword123!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["username"], "staff_admin")

    def test_non_staff_login_rejected(self):
        response = self.client.post(
            "/api/v1/admin/auth/login/",
            {"username": "normal_user", "password": "NormalPassword123!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])

    def test_invalid_credentials_rejected(self):
        response = self.client.post(
            "/api/v1/admin/auth/login/",
            {"username": "staff_admin", "password": "WrongPassword!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_admin_me_endpoint_requires_auth(self):
        # Anonymous
        response = self.client.get("/api/v1/admin/auth/me/")
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

        # Authenticated Staff
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.get("/api/v1/admin/auth/me/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["user"]["username"], "staff_admin")

    def test_admin_docs_endpoint_accessible(self):
        response = self.client.get("/api/v1/admin/docs/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("DevMate", response.content.decode("utf-8"))
