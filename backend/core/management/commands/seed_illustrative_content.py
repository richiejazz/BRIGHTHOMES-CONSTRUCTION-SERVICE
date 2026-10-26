import json
from io import BytesIO
from pathlib import Path

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from PIL import Image

from projects.models import Project, ProjectCategory, ProjectImage
from properties.models import Property, PropertyCategory, PropertyImage

MANIFEST = Path(__file__).resolve().parents[2] / "content" / "illustrative.json"
# The photographs ship with the code (Unsplash blocks downloads from hosting providers): <slug>-<n>.jpg, where n
# is the photo's 1-based position in the manifest entry's "images" list.
IMAGE_DIR = MANIFEST.parent / "illustrative"
MAX_EDGE = 1600

PROPERTY_DESCRIPTION = (
    "This is an illustrative listing. Its photographs are architectural inspiration licensed from Unsplash and do not "
    "show a BRIGHTHOMES property. Price, location and specifications are published only with verified BRIGHTHOMES "
    "listings.\n\nTo discuss buying, renting or developing property, send an enquiry or request a consultation."
)
PROJECT_DESCRIPTION = (
    "This is illustrative content. Its photographs are architectural inspiration licensed from Unsplash and do not "
    "show a BRIGHTHOMES project. Verified BRIGHTHOMES projects will replace it as project photography becomes "
    "available.\n\nTo discuss a project of your own, send an enquiry or request a consultation."
)


def image_path(slug, number):
    return IMAGE_DIR / f"{slug}-{number}.jpg"


def load_image(path):
    """Read one bundled photograph (free Unsplash License). Already web-sized JPEGs are used as they are."""
    data = path.read_bytes()
    with Image.open(BytesIO(data)) as image:
        image.verify()  # rejects truncated or non-image files
    with Image.open(BytesIO(data)) as image:
        if image.format == "JPEG" and max(image.size) <= MAX_EDGE:
            return data
    return optimise(data)


def optimise(data):
    """Re-encode as a progressive JPEG no larger than MAX_EDGE on its long side."""
    image = Image.open(BytesIO(data)).convert("RGB")
    image.thumbnail((MAX_EDGE, MAX_EDGE))
    buffer = BytesIO()
    image.save(buffer, "JPEG", quality=80, optimize=True, progressive=True)
    return buffer.getvalue()


class Command(BaseCommand):
    help = (
        "Create clearly marked illustrative (is_demo) properties and projects with Unsplash photography, for use "
        "until verified BRIGHTHOMES content exists. Safe to re-run; existing records are left unchanged."
    )

    def add_arguments(self, parser):
        parser.add_argument("--skip-images", action="store_true", help="Create the records without attaching photographs.")

    def handle(self, *args, skip_images=False, **options):
        manifest = json.loads(MANIFEST.read_text())
        property_types = {category.slug: category for category in PropertyCategory.objects.all()}
        project_categories = {category.slug: category for category in ProjectCategory.objects.all()}
        missing = {entry["category"] for entry in manifest["properties"]} - property_types.keys()
        missing |= {entry["category"] for entry in manifest["projects"]} - project_categories.keys()
        if missing:
            raise CommandError(f"Missing categories ({', '.join(sorted(missing))}). Run seed_company_content first.")

        created = images = 0
        for entry in manifest["properties"]:
            listing, was_created = Property.objects.get_or_create(
                slug=entry["slug"],
                defaults={
                    "title": entry["title"], "summary": entry["summary"], "description": PROPERTY_DESCRIPTION,
                    "category": property_types[entry["category"]],
                    # Nothing is actually listed: illustrative records never carry a price, location or availability.
                    "listing_type": Property.ListingType.COMING_SOON, "status": Property.Status.COMING_SOON,
                    "price_display": Property.PriceDisplay.ON_REQUEST,
                    "is_featured": entry["is_featured"], "is_published": True, "is_demo": True,
                },
            )
            created += was_created
            images += self._attach(listing, entry["images"], PropertyImage, "property", skip_images)
        for entry in manifest["projects"]:
            project, was_created = Project.objects.get_or_create(
                slug=entry["slug"],
                defaults={
                    "title": entry["title"], "summary": entry["summary"], "description": PROJECT_DESCRIPTION,
                    "category": project_categories[entry["category"]],
                    # Status is required; the apps do not present it as a fact for illustrative records.
                    "status": Project.Status.ONGOING,
                    "is_featured": entry["is_featured"], "is_published": True, "is_demo": True,
                },
            )
            created += was_created
            images += self._attach(project, entry["images"], ProjectImage, "project", skip_images)
        self.stdout.write(self.style.SUCCESS(f"Illustrative content ready (created {created} records, {images} images)."))

    def _attach(self, owner, entries, model, field, skip_images):
        # Photos are only ever added to illustrative records that have none, so existing (or genuine) images are
        # never replaced and a re-run never duplicates them.
        if skip_images or not owner.is_demo or owner.images.exists():
            return 0
        count = 0
        for order, entry in enumerate(entries):
            path = image_path(owner.slug, order + 1)
            try:
                data = load_image(path)
            except Exception as error:  # A missing or unreadable photo falls back to the apps' drawn placeholder.
                self.stderr.write(self.style.WARNING(f"Skipped image {path.name} ({entry['unsplash_id']}) for {owner.slug}: {error}"))
                continue
            with transaction.atomic():
                image = model(**{field: owner}, alt_text=entry["alt_text"], caption=f"Illustrative photograph by {entry['photographer']} on Unsplash", display_order=order, is_cover=order == 0)
                image.image.save(f"{owner.slug}-{order + 1}.jpg", ContentFile(data), save=False)
                image.save()
            count += 1
        return count
