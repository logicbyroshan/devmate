from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from portfolio.models import Skill, Category

User = get_user_model()


class AdminSkillAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.staff_user = User.objects.create_user(
            username="staff_admin",
            password="StrongStaffPassword123!",
            is_staff=True,
        )
        self.category = Category.objects.create(
            name="Languages",
            slug="languages",
            category_type="skill",
        )
        self.client.force_authenticate(user=self.staff_user)

    def test_create_skill_and_proficiency_validation(self):
        payload = {
            "name": "Rust Systems Programming",
            "skill_level": "advanced",
            "proficiency": 92,
            "category_id": self.category.id,
            "icon_type": "fontawesome",
            "icon_class": "fab fa-rust",
            "is_active": True,
        }
        response = self.client.post("/api/v1/admin/skills/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["success"])

        # Invalid proficiency (>100)
        invalid_payload = payload.copy()
        invalid_payload["proficiency"] = 150
        inv_resp = self.client.post("/api/v1/admin/skills/", invalid_payload, format="json")
        self.assertEqual(inv_resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_and_delete_skill(self):
        skill = Skill.objects.create(
            name="Python",
            proficiency=85,
            skill_level="advanced",
            category=self.category,
        )
        patch_resp = self.client.patch(
            f"/api/v1/admin/skills/{skill.id}/",
            {"proficiency": 98},
            format="json",
        )
        self.assertEqual(patch_resp.status_code, status.HTTP_200_OK)
        skill.refresh_from_db()
        self.assertEqual(skill.proficiency, 98)

        del_resp = self.client.delete(f"/api/v1/admin/skills/{skill.id}/")
        self.assertEqual(del_resp.status_code, status.HTTP_200_OK)
        self.assertFalse(Skill.objects.filter(id=skill.id).exists())
