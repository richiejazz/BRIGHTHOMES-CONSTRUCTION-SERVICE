import json
import os
import shutil
import subprocess
import sys
import tempfile
from io import BytesIO, StringIO
from pathlib import Path
from unittest import mock

from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management import call_command
from django.test import SimpleTestCase, TestCase, override_settings
from PIL import Image
from rest_framework import status
from rest_framework.test import APIClient

from core.management.commands import seed_illustrative_content as seed_module
from enquiries.models import Enquiry
from projects.models import Project, ProjectCategory, ProjectImage
from saved.models import SavedProperty
from users.models import User

from .models import Property, PropertyCategory, PropertyFeature, PropertyImage

MEDIA_ROOT = tempfile.mkdtemp()


def jpeg_bytes(size=(40, 30), color="grey"):
    buffer = BytesIO()
    Image.new("RGB", size, color).save(buffer, "JPEG")
    return buffer.getvalue()


def jpeg_upload(name="photo.jpg", **kwargs):
    return SimpleUploadedFile(name, jpeg_bytes(**kwargs), content_type="image/jpeg")


@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class PropertyTestCase(TestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(MEDIA_ROOT, ignore_errors=True)

    def setUp(self):
        self.client = APIClient()
        self.house = PropertyCategory.objects.create(name="House", slug="house")
        self.retired = PropertyCategory.objects.create(name="Retired", slug="retired", is_active=False)
        self.listed = Property.objects.create(
            title="Listed", slug="listed", summary="S", description="D", category=self.house, listing_type=Property.ListingType.SALE,
            price=85_000_000, price_display=Property.PriceDisplay.EXACT, location="Lekki, Lagos", bedrooms=4, is_published=True, is_featured=True,
        )
        self.on_request = Property.objects.create(
            title="On request", slug="on-request", summary="S", description="D", category=self.house, listing_type=Property.ListingType.RENT,
            price=5_000_000, price_display=Property.PriceDisplay.ON_REQUEST, bedrooms=2, is_published=True,
        )
        self.draft = Property.objects.create(title="Draft", slug="draft", summary="S", description="D", category=self.house, listing_type="sale", is_published=False)
        self.hidden_type = Property.objects.create(title="Hidden type", slug="hidden-type", summary="S", description="D", category=self.retired, listing_type="sale", is_published=True)
        PropertyFeature.objects.create(property=self.listed, name="Swimming pool")
        self.client_user = User.objects.create_user("client@example.com", "password")
        self.other_user = User.objects.create_user("other@example.com", "password")
        self.staff_user = User.objects.create_user("staff@example.com", "password", is_staff=True, role=User.Role.STAFF)

    def slugs(self, response):
        return sorted(item["slug"] for item in response.data["results"])

    def test_public_sees_only_published_listings_in_active_types(self):
        response = self.client.get("/api/v1/properties/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.slugs(response), ["listed", "on-request"])
        self.assertEqual(self.client.get("/api/v1/properties/draft/").status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual([item["slug"] for item in self.client.get("/api/v1/property-types/").data["results"]], ["house"])
        self.client.force_authenticate(self.staff_user)
        self.assertEqual(self.client.get("/api/v1/properties/").data["count"], 4)

    def test_detail_includes_category_features_and_specifications(self):
        data = self.client.get("/api/v1/properties/listed/").data
        self.assertEqual(data["category"]["slug"], "house")
        self.assertEqual(data["features"], ["Swimming pool"])
        self.assertEqual((data["listing_type"], data["status"], data["bedrooms"], data["location"]), ("sale", "available", 4, "Lekki, Lagos"))
        self.assertEqual(data["price"], "85000000.00")

    def test_price_on_request_is_never_sent_to_the_public(self):
        self.assertIsNone(self.client.get("/api/v1/properties/on-request/").data["price"])
        # Nor can it be discovered by filtering on price.
        self.assertEqual(self.slugs(self.client.get("/api/v1/properties/", {"max_price": 6_000_000})), [])
        self.client.force_authenticate(self.staff_user)
        self.assertEqual(self.client.get("/api/v1/properties/on-request/").data["price"], "5000000.00")

    def test_filters(self):
        self.assertEqual(self.slugs(self.client.get("/api/v1/properties/", {"listing_type": "rent"})), ["on-request"])
        self.assertEqual(self.slugs(self.client.get("/api/v1/properties/", {"min_bedrooms": 3})), ["listed"])
        self.assertEqual(self.slugs(self.client.get("/api/v1/properties/", {"is_featured": "true"})), ["listed"])
        self.assertEqual(self.slugs(self.client.get("/api/v1/properties/", {"location": "lekki"})), ["listed"])
        self.assertEqual(self.slugs(self.client.get("/api/v1/properties/", {"category_slug": "house", "min_price": 80_000_000})), ["listed"])
        self.assertEqual(self.slugs(self.client.get("/api/v1/properties/", {"search": "request"})), ["on-request"])

    def test_only_staff_can_manage_listings(self):
        data = {"title": "New", "slug": "new", "summary": "S", "description": "D", "category_id": self.house.id, "listing_type": "lease", "price_display": "from", "price": "1000000", "features": ["Garden", " garden ", "Borehole"]}
        self.assertEqual(self.client.post("/api/v1/properties/", data, format="json").status_code, status.HTTP_401_UNAUTHORIZED)
        self.client.force_authenticate(self.client_user)
        self.assertEqual(self.client.post("/api/v1/properties/", data, format="json").status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(self.client.patch("/api/v1/properties/listed/", {"title": "Hacked"}, format="json").status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(self.client.delete("/api/v1/properties/listed/").status_code, status.HTTP_403_FORBIDDEN)
        self.client.force_authenticate(self.staff_user)
        created = self.client.post("/api/v1/properties/", data, format="json")
        self.assertEqual(created.status_code, status.HTTP_201_CREATED)
        self.assertEqual(created.data["features"], ["Garden", "Borehole"])
        self.assertFalse(created.data["is_demo"])
        updated = self.client.patch("/api/v1/properties/new/", {"status": "reserved", "is_published": True, "features": ["Gated"]}, format="json")
        self.assertEqual((updated.data["status"], updated.data["is_published"], updated.data["features"]), ("reserved", True, ["Gated"]))

    def test_a_shown_price_requires_an_amount(self):
        self.client.force_authenticate(self.staff_user)
        data = {"title": "No price", "slug": "no-price", "summary": "S", "description": "D", "category_id": self.house.id, "listing_type": "sale", "price_display": "exact"}
        response = self.client.post("/api/v1/properties/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("price", response.data)

    def test_image_upload_is_staff_only_and_keeps_a_single_cover(self):
        payload = lambda: {"property": self.listed.id, "image": jpeg_upload(), "alt_text": "Front", "is_cover": "true"}  # noqa: E731
        self.assertEqual(self.client.post("/api/v1/property-images/", payload(), format="multipart").status_code, status.HTTP_401_UNAUTHORIZED)
        self.client.force_authenticate(self.client_user)
        self.assertEqual(self.client.post("/api/v1/property-images/", payload(), format="multipart").status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(self.client.get("/api/v1/property-images/").status_code, status.HTTP_403_FORBIDDEN)
        self.client.force_authenticate(self.staff_user)
        first = self.client.post("/api/v1/property-images/", payload(), format="multipart")
        second = self.client.post("/api/v1/property-images/", payload(), format="multipart")
        self.assertEqual((first.status_code, second.status_code), (status.HTTP_201_CREATED, status.HTTP_201_CREATED))
        self.assertEqual(list(PropertyImage.objects.filter(is_cover=True).values_list("id", flat=True)), [second.data["id"]])
        self.assertEqual(self.listed.cover_image.id, second.data["id"])
        not_an_image = SimpleUploadedFile("notes.jpg", b"plain text", content_type="image/jpeg")
        rejected = self.client.post("/api/v1/property-images/", {"property": self.listed.id, "image": not_an_image, "alt_text": "x"}, format="multipart")
        self.assertEqual(rejected.status_code, status.HTTP_400_BAD_REQUEST)

    def test_project_images_follow_the_same_rules(self):
        category = ProjectCategory.objects.create(name="Residential", slug="residential")
        project = Project.objects.create(title="P", slug="p", summary="S", description="D", category=category, status="completed", is_published=True)
        self.client.force_authenticate(self.client_user)
        self.assertEqual(self.client.post("/api/v1/project-images/", {"project": project.id, "image": jpeg_upload(), "alt_text": "x"}, format="multipart").status_code, status.HTTP_403_FORBIDDEN)
        self.client.force_authenticate(self.staff_user)
        for _ in range(2):
            self.client.post("/api/v1/project-images/", {"project": project.id, "image": jpeg_upload(), "alt_text": "x", "is_cover": "true"}, format="multipart")
        self.assertEqual(ProjectImage.objects.filter(project=project, is_cover=True).count(), 1)

    def test_saved_properties_are_unique_owned_and_published_only(self):
        self.client.force_authenticate(self.client_user)
        first = self.client.post("/api/v1/saved-properties/", {"property": self.listed.id}, format="json")
        self.assertEqual(first.status_code, status.HTTP_201_CREATED)
        self.assertEqual(first.data["property_summary"]["slug"], "listed")
        self.assertEqual(self.client.post("/api/v1/saved-properties/", {"property": self.listed.id}, format="json").status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(self.client.post("/api/v1/saved-properties/", {"property": self.draft.id}, format="json").status_code, status.HTTP_400_BAD_REQUEST)
        saved = self.client.post("/api/v1/saved-properties/", {"property": self.on_request.id}, format="json")
        self.assertIsNone(saved.data["property_summary"]["price"])
        self.assertEqual(self.client.get("/api/v1/saved-properties/", {"property": self.listed.id}).data["count"], 1)
        self.client.force_authenticate(self.other_user)
        self.assertEqual(self.client.get("/api/v1/saved-properties/").data["count"], 0)
        self.assertEqual(self.client.delete(f"/api/v1/saved-properties/{first.data['id']}/").status_code, status.HTTP_404_NOT_FOUND)
        self.client.force_authenticate(self.client_user)
        self.assertEqual(self.client.delete(f"/api/v1/saved-properties/{first.data['id']}/").status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(SavedProperty.objects.filter(user=self.client_user).count(), 1)
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get("/api/v1/saved-properties/").status_code, status.HTTP_401_UNAUTHORIZED)

    def test_enquiries_and_appointments_can_reference_a_published_property(self):
        enquiry = self.client.post("/api/v1/enquiries/", {"name": "V", "email": "v@example.com", "message": "Is it available?", "property": self.listed.id}, format="json")
        self.assertEqual(enquiry.status_code, status.HTTP_201_CREATED)
        self.assertEqual(enquiry.data["property_summary"]["title"], "Listed")
        self.assertEqual(Enquiry.objects.get().property, self.listed)
        draft = self.client.post("/api/v1/enquiries/", {"name": "V", "email": "v@example.com", "message": "M", "property": self.draft.id}, format="json")
        self.assertEqual(draft.status_code, status.HTTP_400_BAD_REQUEST)
        appointment = self.client.post("/api/v1/appointments/", {"name": "V", "email": "v@example.com", "preferred_date": "2030-01-02", "property": self.listed.id}, format="json")
        self.assertEqual(appointment.data["property_summary"]["slug"], "listed")
        # Existing clients that send no property are unaffected.
        plain = self.client.post("/api/v1/enquiries/", {"name": "V", "email": "v@example.com", "message": "M"}, format="json")
        self.assertIsNone(plain.data["property_summary"])

    def test_featured_projects_filter(self):
        category = ProjectCategory.objects.create(name="Residential", slug="residential")
        Project.objects.create(title="A", slug="a", summary="S", description="D", category=category, status="completed", is_published=True, is_featured=True)
        Project.objects.create(title="B", slug="b", summary="S", description="D", category=category, status="completed", is_published=True)
        response = self.client.get("/api/v1/projects/", {"is_featured": "true"})
        self.assertEqual([item["slug"] for item in response.data["results"]], ["a"])
        self.assertTrue(response.data["results"][0]["is_featured"])


@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class SeedContentTestCase(TestCase):
    def test_company_seed_creates_property_types(self):
        call_command("seed_company_content", stdout=StringIO())
        self.assertEqual(list(PropertyCategory.objects.values_list("slug", flat=True)), ["house", "apartment", "land", "commercial", "estate-development", "other"])

    def seed(self, *args):
        stdout, stderr = StringIO(), StringIO()
        call_command("seed_illustrative_content", *args, stdout=stdout, stderr=stderr)
        return stdout.getvalue(), stderr.getvalue()

    def test_every_manifest_photo_is_bundled_and_web_sized(self):
        manifest = json.loads(seed_module.MANIFEST.read_text())
        for entry in manifest["projects"] + manifest["properties"]:
            for number in range(1, len(entry["images"]) + 1):
                path = seed_module.image_path(entry["slug"], number)
                self.assertTrue(path.is_file(), path.name)
                with Image.open(path) as image:
                    self.assertEqual(image.format, "JPEG", path.name)
                    self.assertLessEqual(max(image.size), 1600, path.name)

    def test_illustrative_seed_is_marked_demo_without_invented_details(self):
        call_command("seed_company_content", stdout=StringIO())
        output, errors = self.seed()
        self.assertIn("created 10 records, 20 images", output)
        self.assertEqual(errors, "")
        listings = Property.objects.all()
        self.assertEqual(listings.count(), 6)
        self.assertEqual(Project.objects.count(), 4)
        for listing in listings:
            self.assertTrue(listing.is_demo and listing.is_published)
            self.assertEqual((listing.price, listing.location, listing.bedrooms, listing.price_display), (None, "", None, "on_request"))
            self.assertEqual(listing.images.count(), 2)
            self.assertEqual(listing.images.filter(is_cover=True).count(), 1)
        for project in Project.objects.all():
            self.assertTrue(project.is_demo)
            self.assertEqual((project.location, project.start_date, project.end_date), ("", None, None))
            self.assertEqual(project.images.count(), 2)
        image = PropertyImage.objects.get(property__slug="illustrative-land-plots", display_order=0)
        self.assertIn("Paul Addo on Unsplash", image.caption)
        # Bundled photos are already web-sized JPEGs, so they are stored byte-for-byte.
        with image.image.open("rb") as stored:
            self.assertEqual(stored.read(), seed_module.image_path("illustrative-land-plots", 1).read_bytes())

    def test_repeated_seeding_creates_no_duplicates(self):
        call_command("seed_company_content", stdout=StringIO())
        self.seed()
        output, _ = self.seed()
        self.assertIn("created 0 records, 0 images", output)
        self.assertEqual((Property.objects.count(), Project.objects.count()), (6, 4))
        self.assertEqual((PropertyImage.objects.count(), ProjectImage.objects.count()), (12, 8))

    def test_records_created_without_photos_get_them_on_a_later_run(self):
        # The live database is in this state: records exist, photos never arrived.
        call_command("seed_company_content", stdout=StringIO())
        self.seed("--skip-images")
        self.assertFalse(PropertyImage.objects.exists())
        output, _ = self.seed()
        self.assertIn("created 0 records, 20 images", output)

    def test_existing_images_are_never_replaced(self):
        call_command("seed_company_content", stdout=StringIO())
        self.seed("--skip-images")
        villa = Property.objects.get(slug="illustrative-contemporary-villa")
        own = PropertyImage.objects.create(property=villa, image=jpeg_upload("own.jpg"), alt_text="Our photo", is_cover=True)
        self.seed()
        self.assertEqual(list(villa.images.all()), [own])
        self.assertEqual(PropertyImage.objects.exclude(property=villa).count(), 10)

    def test_genuine_record_with_a_matching_slug_is_left_alone(self):
        call_command("seed_company_content", stdout=StringIO())
        genuine = Property.objects.create(slug="illustrative-pavilion-house", title="Real listing", summary="Real", category=PropertyCategory.objects.get(slug="house"), is_demo=False)
        self.seed()
        genuine.refresh_from_db()
        self.assertEqual((genuine.title, genuine.is_demo, genuine.images.count()), ("Real listing", False, 0))

    def test_missing_or_unreadable_photos_are_skipped_not_fatal(self):
        call_command("seed_company_content", stdout=StringIO())
        with tempfile.TemporaryDirectory() as folder:
            shutil.copy(seed_module.image_path("illustrative-contemporary-villa", 1), folder)
            Path(folder, "illustrative-contemporary-villa-2.jpg").write_bytes(b"not an image")
            with mock.patch.object(seed_module, "IMAGE_DIR", Path(folder)):
                output, errors = self.seed()
        self.assertIn("created 10 records, 1 images", output)
        self.assertIn("Skipped image illustrative-contemporary-villa-2.jpg", errors)
        self.assertIn("Skipped image illustrative-land-plots-1.jpg", errors)
        self.assertEqual(Property.objects.get(slug="illustrative-contemporary-villa").images.count(), 1)

    def test_oversized_or_non_jpeg_photos_are_optimised(self):
        buffer = BytesIO()
        Image.new("RGB", (2400, 1600), "teal").save(buffer, "PNG")
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder, "photo.jpg")
            path.write_bytes(buffer.getvalue())
            data = seed_module.load_image(path)
        with Image.open(BytesIO(data)) as image:
            self.assertEqual((image.format, max(image.size)), ("JPEG", 1600))


# Runs the real seed with production settings and Cloudinary storage in a separate process (the storage reads its
# settings once, at import). Credentials are fake, every network connection is blocked and the upload call is
# mocked, so nothing leaves the machine.
CLOUDINARY_PROBE = """
import json, socket
from unittest import mock
def offline(*args, **kwargs):
    raise OSError("network blocked in test")
socket.socket.connect = offline
socket.create_connection = offline
import django
django.setup()
from django.conf import settings
from django.core.management import call_command
uploads = []
def upload(content, **options):
    uploads.append({"folder": options.get("folder"), "tags": options.get("tags")})
    # Like Cloudinary with use_filename: the public ID is the folder plus the file name without its extension.
    return {"public_id": options["folder"] + "/" + content.name.rsplit("/", 1)[-1].rsplit(".", 1)[0], "version": 1}
with mock.patch("cloudinary.uploader.upload", side_effect=upload):
    call_command("migrate", verbosity=0)
    call_command("seed_company_content", verbosity=0)
    call_command("seed_illustrative_content", verbosity=0)
from properties.models import PropertyImage
print(json.dumps({"backend": settings.STORAGES["default"]["BACKEND"], "uploads": uploads,
                  "url": PropertyImage.objects.order_by("id").first().image.url}))
"""


class SeedCloudinaryStorageTestCase(SimpleTestCase):
    def test_seed_uploads_into_the_brighthomes_media_folder(self):
        backend = Path(__file__).resolve().parents[1]
        with tempfile.TemporaryDirectory() as folder:
            env = {
                **os.environ,
                "DJANGO_SETTINGS_MODULE": "config.settings.production",
                "SECRET_KEY": "test-only-secret-key",
                "DATABASE_URL": f"sqlite:///{folder}/probe.sqlite3",
                "CLOUDINARY_URL": "cloudinary://123456789:test-secret@test-cloud",
            }
            result = subprocess.run([sys.executable, "-c", CLOUDINARY_PROBE], cwd=backend, env=env, capture_output=True, text=True, timeout=180)
        self.assertEqual(result.returncode, 0, result.stderr[-2000:])
        report = json.loads(result.stdout.strip().splitlines()[-1])
        self.assertEqual(report["backend"], "cloudinary_storage.storage.MediaCloudinaryStorage")
        self.assertEqual(len(report["uploads"]), 20)
        for upload in report["uploads"]:
            self.assertRegex(upload["folder"], r"^brighthomes/media/(projects|properties)/\d{4}/\d{2}$")
            self.assertEqual(upload["tags"], "brighthomes")
        self.assertRegex(report["url"], r"^https://res\.cloudinary\.com/test-cloud/image/upload/.*brighthomes/media/properties/")
