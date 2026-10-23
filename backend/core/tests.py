from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from appointments.models import Appointment
from dashboard.models import Achievement
from enquiries.models import Enquiry
from projects.models import Project, ProjectCategory, ProjectImage
from saved.models import SavedProject
from services.models import Service
from users.models import User


class Phase2APITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.category = ProjectCategory.objects.create(name="Residential", slug="residential")
        self.service = Service.objects.create(name="Build", slug="build", short_description="Build", description="Build", is_published=True)
        self.published = Project.objects.create(title="Published", slug="published", summary="Published", description="Published", category=self.category, status=Project.Status.COMPLETED, is_published=True)
        self.unpublished = Project.objects.create(title="Unpublished", slug="unpublished", summary="Unpublished", description="Unpublished", category=self.category, status=Project.Status.ONGOING)
        self.published.services.add(self.service)
        Achievement.objects.create(value="Demo", label="Achievement", is_published=True)
        Achievement.objects.create(value="Hidden", label="Hidden", is_published=False)
        self.client_user = User.objects.create_user("client@example.com", "password")
        self.other_user = User.objects.create_user("other@example.com", "password")
        self.staff_user = User.objects.create_user("staff@example.com", "password", is_staff=True, role=User.Role.STAFF)

    def test_public_visibility_and_relationships(self):
        response = self.client.get("/api/v1/projects/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([item["slug"] for item in response.data["results"]], ["published"])
        detail = self.client.get("/api/v1/projects/published/")
        self.assertEqual(detail.status_code, status.HTTP_200_OK)
        self.assertEqual(detail.data["category"]["slug"], "residential")
        self.assertEqual(detail.data["services"], [self.service.id])
        self.assertEqual(self.client.get("/api/v1/projects/unpublished/").status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(len(self.client.get("/api/v1/achievements/").data["results"]), 1)

    def test_project_image_is_nested_in_project_response(self):
        image = SimpleUploadedFile("plan.jpg", b"not-a-real-image", content_type="image/jpeg")
        ProjectImage.objects.create(project=self.published, image=image, alt_text="Demo plan", is_cover=True)
        response = self.client.get("/api/v1/projects/published/")
        self.assertEqual(response.data["images"][0]["alt_text"], "Demo plan")
        self.assertTrue(response.data["images"][0]["is_cover"])

    def test_anonymous_can_create_enquiry_and_appointment(self):
        enquiry = self.client.post("/api/v1/enquiries/", {"name": "Visitor", "email": "visitor@example.com", "message": "Please contact me."}, format="json")
        self.assertEqual(enquiry.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(Enquiry.objects.get().user)
        appointment = self.client.post("/api/v1/appointments/", {"name": "Visitor", "email": "visitor@example.com", "preferred_date": "2030-01-02", "message": "Please call."}, format="json")
        self.assertEqual(appointment.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(Appointment.objects.get().user)

    def test_authenticated_records_are_owned_and_staff_can_manage(self):
        self.client.force_authenticate(self.client_user)
        self.client.post("/api/v1/enquiries/", {"name": "Client", "email": "client@example.com", "message": "A request."}, format="json")
        self.client.post("/api/v1/appointments/", {"name": "Client", "email": "client@example.com", "preferred_date": "2030-01-02"}, format="json")
        own_enquiries = self.client.get("/api/v1/enquiries/")
        self.assertEqual(own_enquiries.status_code, status.HTTP_200_OK)
        self.assertEqual(own_enquiries.data["results"][0]["user"], self.client_user.id)
        self.client.force_authenticate(self.other_user)
        self.assertEqual(self.client.get("/api/v1/enquiries/").data["count"], 0)
        self.client.force_authenticate(self.staff_user)
        self.assertEqual(self.client.get("/api/v1/enquiries/").data["count"], 1)
        self.assertEqual(self.client.patch(f"/api/v1/enquiries/{Enquiry.objects.get().id}/", {"status": "resolved"}, format="json").status_code, status.HTTP_200_OK)

    def test_saved_project_uniqueness_and_ownership(self):
        self.client.force_authenticate(self.client_user)
        first = self.client.post("/api/v1/saved-projects/", {"project": self.published.id}, format="json")
        duplicate = self.client.post("/api/v1/saved-projects/", {"project": self.published.id}, format="json")
        self.assertEqual(first.status_code, status.HTTP_201_CREATED)
        self.assertEqual(duplicate.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(SavedProject.objects.filter(user=self.client_user).count(), 1)
        self.client.force_authenticate(self.other_user)
        self.assertEqual(self.client.get("/api/v1/saved-projects/").data["count"], 0)

    def test_public_cannot_create_content_but_staff_can(self):
        data = {"title": "New", "slug": "new", "summary": "New", "description": "New", "category_id": self.category.id, "status": "ongoing", "services": []}
        self.assertEqual(self.client.post("/api/v1/projects/", data, format="json").status_code, status.HTTP_401_UNAUTHORIZED)
        self.client.force_authenticate(self.client_user)
        self.assertEqual(self.client.post("/api/v1/projects/", data, format="json").status_code, status.HTTP_403_FORBIDDEN)
        self.client.force_authenticate(self.staff_user)
        self.assertEqual(self.client.post("/api/v1/projects/", data, format="json").status_code, status.HTTP_201_CREATED)

    def test_demo_projects_are_explicitly_marked(self):
        self.published.is_demo = True
        self.published.save(update_fields=["is_demo", "updated_at"])
        self.assertTrue(Project.objects.get(pk=self.published.pk).is_demo)

    def test_internal_notes_are_only_returned_to_staff(self):
        self.client.force_authenticate(self.client_user)
        created = self.client.post("/api/v1/enquiries/", {"name": "Client", "email": "client@example.com", "message": "A request."}, format="json")
        self.assertNotIn("internal_notes", created.data)
        self.client.post("/api/v1/appointments/", {"name": "Client", "email": "client@example.com", "preferred_date": "2030-01-02"}, format="json")
        Enquiry.objects.update(internal_notes="Staff only")
        Appointment.objects.update(internal_notes="Staff only")
        enquiry_id, appointment_id = Enquiry.objects.get().id, Appointment.objects.get().id
        for url in ("/api/v1/enquiries/", "/api/v1/appointments/"):
            self.assertNotIn("internal_notes", self.client.get(url).data["results"][0])
        self.assertNotIn("internal_notes", self.client.get(f"/api/v1/enquiries/{enquiry_id}/").data)
        self.assertNotIn("internal_notes", self.client.get(f"/api/v1/appointments/{appointment_id}/").data)
        self.client.force_authenticate(self.staff_user)
        self.assertEqual(self.client.get(f"/api/v1/enquiries/{enquiry_id}/").data["internal_notes"], "Staff only")
        self.assertEqual(self.client.get(f"/api/v1/appointments/{appointment_id}/").data["internal_notes"], "Staff only")


class ConsultationAndEnquiryDetailsTestCase(TestCase):
    """Additive fields used by the website's consultation flow and enquiry forms (spec W-12, W-06, W-08)."""

    def setUp(self):
        self.client = APIClient()
        self.drawing = Service.objects.create(name="Architectural drawing", slug="architectural-drawing", short_description="x", description="x", is_published=True)
        self.approval = Service.objects.create(name="Building approval", slug="building-approval", short_description="x", description="x", is_published=True)
        self.hidden = Service.objects.create(name="Hidden", slug="hidden", short_description="x", description="x", is_published=False)
        self.client_user = User.objects.create_user("client@example.com", "password")

    def consultation(self, **overrides):
        data = {"name": "Ada", "email": "ada@example.com", "preferred_date": "2030-01-08", **overrides}
        return self.client.post("/api/v1/appointments/", data, format="json")

    def test_multi_service_consultation_with_mode_and_context(self):
        self.client.force_authenticate(self.client_user)
        response = self.consultation(
            services=[self.drawing.id, self.approval.id], services_not_sure=True, mode="video", based_abroad=True,
            project_type="new_build", site_location="Ibeju-Lekki, Lagos", timeline="asap", time_window="Morning",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        record = Appointment.objects.get()
        self.assertEqual(sorted(record.services.values_list("slug", flat=True)), ["architectural-drawing", "building-approval"])
        # The single-service field used by existing clients mirrors the first choice.
        self.assertEqual(record.service, self.drawing)
        self.assertEqual(response.data["reference"], f"CON-{record.pk:04d}")
        self.assertEqual([item["slug"] for item in response.data["services_summary"]], ["architectural-drawing", "building-approval"])
        self.assertEqual(response.data["status"], "requested")
        listed = self.client.get("/api/v1/appointments/").data["results"][0]
        self.assertEqual((listed["mode"], listed["based_abroad"], listed["project_type"], listed["timeline"]), ("video", True, "new_build", "asap"))

    def test_existing_single_service_contract_still_works(self):
        response = self.consultation(service=self.drawing.id)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        record = Appointment.objects.get()
        self.assertEqual(list(record.services.all()), [self.drawing])
        self.assertFalse(record.services_not_sure)

    def test_rejects_unpublished_services_and_unknown_choices(self):
        self.assertIn("services", self.consultation(services=[self.hidden.id]).data)
        self.assertIn("mode", self.consultation(mode="carrier-pigeon").data)
        self.assertIn("project_type", self.consultation(project_type="castle").data)
        self.assertEqual(Appointment.objects.count(), 0)

    def test_enquiry_preferred_contact_and_reference(self):
        response = self.client.post("/api/v1/enquiries/", {"name": "Ada", "email": "ada@example.com", "message": "Hello", "preferred_contact": "whatsapp"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        record = Enquiry.objects.get()
        self.assertEqual(record.preferred_contact, "whatsapp")
        self.assertEqual(response.data["reference"], f"ENQ-{record.pk:04d}")
        self.assertIn("preferred_contact", self.client.post("/api/v1/enquiries/", {"name": "A", "email": "a@example.com", "message": "x", "preferred_contact": "fax"}, format="json").data)

    def test_project_building_type_is_public(self):
        category = ProjectCategory.objects.create(name="Residential", slug="residential")
        Project.objects.create(title="P", slug="p", summary="s", description="d", category=category, status=Project.Status.COMPLETED, is_published=True, building_type="Detached residence")
        self.assertEqual(self.client.get("/api/v1/projects/p/").data["building_type"], "Detached residence")
