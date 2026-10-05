from io import StringIO

from django.core.management import call_command
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from appointments.models import Appointment
from dashboard.models import Achievement
from enquiries.models import Enquiry
from projects.models import Project, ProjectCategory
from services.models import Service

from .models import User

STRONG_PASSWORD = "brick-and-mortar-2026"


class RegistrationAndCurrentUserTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

    def register(self, **overrides):
        data = {"email": "new.client@example.com", "first_name": "Ada", "last_name": "Client", "password": STRONG_PASSWORD, **overrides}
        return self.client.post("/api/v1/auth/register/", data, format="json")

    def test_register_creates_client_who_can_obtain_tokens(self):
        response = self.register(role="admin")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertNotIn("password", response.data)
        user = User.objects.get(email="new.client@example.com")
        self.assertEqual(user.role, User.Role.CLIENT)
        self.assertFalse(user.is_staff)
        token = self.client.post("/api/v1/auth/token/", {"email": "new.client@example.com", "password": STRONG_PASSWORD}, format="json")
        self.assertEqual(token.status_code, status.HTTP_200_OK)
        self.assertIn("access", token.data)

    def test_register_rejects_duplicate_email_and_weak_password(self):
        User.objects.create_user("taken@example.com", STRONG_PASSWORD)
        for email in ("taken@example.com", "TAKEN@example.com"):
            self.assertEqual(self.register(email=email).data["email"], ["An account with this email address already exists."])
        weak = self.register(password="12345678")
        self.assertEqual(weak.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", weak.data)

    def test_register_ignores_stale_authorization_header(self):
        self.client.credentials(HTTP_AUTHORIZATION="Bearer not-a-valid-token")
        self.assertEqual(self.register().status_code, status.HTTP_201_CREATED)

    def test_current_user_requires_auth_and_only_updates_names(self):
        self.assertEqual(self.client.get("/api/v1/auth/me/").status_code, status.HTTP_401_UNAUTHORIZED)
        user = User.objects.create_user("me@example.com", STRONG_PASSWORD)
        self.client.force_authenticate(user)
        self.assertEqual(self.client.get("/api/v1/auth/me/").data["email"], "me@example.com")
        response = self.client.patch("/api/v1/auth/me/", {"first_name": "Updated", "email": "other@example.com", "role": "admin"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertEqual((user.first_name, user.email, user.role), ("Updated", "me@example.com", User.Role.CLIENT))
        self.assertEqual(self.client.put("/api/v1/auth/me/", {}, format="json").status_code, status.HTTP_405_METHOD_NOT_ALLOWED)


class RecordSummaryTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        category = ProjectCategory.objects.create(name="Residential", slug="residential")
        self.service = Service.objects.create(name="Renovation", slug="renovation", short_description="R", description="R", is_published=True)
        self.project = Project.objects.create(title="Demo house", slug="demo-house", summary="S", description="D", category=category, status=Project.Status.COMPLETED, is_published=True, is_demo=True)
        self.user = User.objects.create_user("owner@example.com", STRONG_PASSWORD)
        self.client.force_authenticate(self.user)

    def test_saved_projects_include_project_summary(self):
        self.client.post("/api/v1/saved-projects/", {"project": self.project.id}, format="json")
        summary = self.client.get("/api/v1/saved-projects/").data["results"][0]["project_summary"]
        self.assertEqual((summary["slug"], summary["category"], summary["is_demo"], summary["cover_image"]), ("demo-house", "Residential", True, None))

    def test_enquiries_and_appointments_include_summaries(self):
        Enquiry.objects.create(user=self.user, name="O", email="owner@example.com", message="M", project=self.project, service=self.service)
        Appointment.objects.create(user=self.user, name="O", email="owner@example.com", preferred_date="2030-01-02", service=self.service)
        enquiry = self.client.get("/api/v1/enquiries/").data["results"][0]
        self.assertEqual(enquiry["project_summary"]["title"], "Demo house")
        self.assertEqual(enquiry["service_summary"]["name"], "Renovation")
        appointment = self.client.get("/api/v1/appointments/").data["results"][0]
        self.assertIsNone(appointment["project_summary"])
        self.assertEqual(appointment["service_summary"]["slug"], "renovation")


class SeedCompanyContentTestCase(TestCase):
    def test_seed_is_idempotent_and_preserves_admin_edits(self):
        call_command("seed_company_content", stdout=StringIO())
        self.assertEqual(Service.objects.filter(is_published=True).count(), 8)
        self.assertEqual(list(Achievement.objects.values_list("value", flat=True)), ["40+", "10+", "100%"])
        self.assertEqual(ProjectCategory.objects.count(), 5)
        self.assertFalse(Project.objects.exists())
        Service.objects.filter(slug="renovation").update(short_description="Edited in admin")
        call_command("seed_company_content", stdout=StringIO())
        self.assertEqual(Service.objects.count(), 8)
        self.assertEqual(Achievement.objects.count(), 3)
        self.assertEqual(Service.objects.get(slug="renovation").short_description, "Edited in admin")
