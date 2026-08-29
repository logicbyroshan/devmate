from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from portfolio.models import UserProfile, ContactMessage

User = get_user_model()


class AdminProfileAndMessageAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.staff_user = User.objects.create_user(
            username="staff_admin",
            password="StrongStaffPassword123!",
            is_staff=True,
        )
        self.client.force_authenticate(user=self.staff_user)

    def test_get_and_update_profile(self):
        get_resp = self.client.get("/api/v1/admin/profile/")
        self.assertEqual(get_resp.status_code, status.HTTP_200_OK)

        patch_resp = self.client.patch(
            "/api/v1/admin/profile/",
            {
                "full_name": "Roshan Damor",
                "title": "Principal Solutions Architect",
                "hourly_rate": "85.00",
                "experience_years": 4,
            },
            format="json",
        )
        self.assertEqual(patch_resp.status_code, status.HTTP_200_OK)
        profile = UserProfile.objects.first()
        self.assertEqual(profile.title, "Principal Solutions Architect")
        self.assertEqual(profile.experience_years, 4)

    def test_contact_messages_inbox_and_toggle_read(self):
        msg = ContactMessage.objects.create(
            full_name="Alice Smith",
            email="alice@example.com",
            message="Interested in hiring for a React project.",
            is_read=False,
            is_urgent=True,
        )

        list_resp = self.client.get("/api/v1/admin/messages/?is_read=false")
        self.assertEqual(list_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(list_resp.data["count"], 1)

        # Retrieve automatically marks as read
        get_resp = self.client.get(f"/api/v1/admin/messages/{msg.id}/")
        self.assertEqual(get_resp.status_code, status.HTTP_200_OK)
        msg.refresh_from_db()
        self.assertTrue(msg.is_read)

        # Bulk action mark unread
        bulk_resp = self.client.post(
            "/api/v1/admin/messages/bulk-action/",
            {"message_ids": [msg.id], "action": "mark_unread"},
            format="json",
        )
        self.assertEqual(bulk_resp.status_code, status.HTTP_200_OK)
        msg.refresh_from_db()
        self.assertFalse(msg.is_read)

    def test_dashboard_analytics_endpoint(self):
        response = self.client.get("/api/v1/admin/analytics/dashboard/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("projects", response.data["data"])
        self.assertIn("messages", response.data["data"])
