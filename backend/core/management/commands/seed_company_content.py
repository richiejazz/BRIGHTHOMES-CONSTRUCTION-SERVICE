from django.core.management.base import BaseCommand
from django.db import transaction

from dashboard.models import Achievement
from projects.models import ProjectCategory
from services.models import Service

# Verified BRIGHTHOMES company content. Existing records are never overwritten,
# so edits made later in Django Admin are preserved when this command is re-run.
SERVICES = [
    ("architectural-drawing", "Architectural drawing", "Design drawings that translate your brief into a clear, buildable plan.", "We prepare architectural drawings that set out the layout, form and appearance of your building, giving everyone involved a clear basis to build from."),
    ("structural-drawing", "Structural drawing", "Structural drawings that define how your building is supported.", "We prepare structural drawings that set out the framework carrying your building, from foundations to columns, beams and slabs, so construction can proceed to specification."),
    ("site-supervision", "Site supervision", "Oversight on site to keep work aligned with the approved drawings.", "We supervise construction on site, checking that work follows the approved drawings and specifications, and that issues are raised and resolved as the project progresses."),
    ("construction-management", "Construction management", "Planning and coordinating your project from start to finish.", "We plan, coordinate and manage construction projects end to end, organising the work, people and materials involved so you have one accountable partner throughout."),
    ("real-estate", "Real Estate", "Real estate services across residential and commercial property.", "We offer real estate services across residential and commercial property. Speak with us to discuss your requirements."),
    ("renovation", "Renovation", "Renovation of existing residential and commercial buildings.", "We renovate existing buildings, from interior updates to more extensive improvement works, managed with the same care we bring to new construction."),
    ("survey-plan", "Survey plan", "Survey plans that establish the boundaries of your land.", "We arrange survey plans that define the boundaries and dimensions of your land, an essential document for land transactions and building approval."),
    ("building-approval", "Building approval", "Support with obtaining approval for your building plans.", "We help you prepare and submit the documents required to obtain building approval from the relevant authorities before construction begins."),
]
ACHIEVEMENTS = [
    ("40+", "Residential Buildings Delivered"),
    ("10+", "Commercial Projects Completed"),
    ("100%", "CAC & Regulatory Compliance"),
]
CATEGORIES = [
    ("residential", "Residential"),
    ("commercial", "Commercial"),
    ("renovation", "Renovation"),
    ("real-estate", "Real Estate"),
    ("other", "Other"),
]


class Command(BaseCommand):
    help = "Create the verified BRIGHTHOMES services, achievements and project categories. Safe to re-run."

    @transaction.atomic
    def handle(self, *args, **options):
        created = {"services": 0, "achievements": 0, "categories": 0}
        for order, (slug, name, short_description, description) in enumerate(SERVICES, start=1):
            _, was_created = Service.objects.get_or_create(
                slug=slug,
                defaults={"name": name, "short_description": short_description, "description": description, "display_order": order, "is_published": True},
            )
            created["services"] += was_created
        for order, (value, label) in enumerate(ACHIEVEMENTS, start=1):
            _, was_created = Achievement.objects.get_or_create(label=label, defaults={"value": value, "display_order": order, "is_published": True})
            created["achievements"] += was_created
        for order, (slug, name) in enumerate(CATEGORIES, start=1):
            _, was_created = ProjectCategory.objects.get_or_create(slug=slug, defaults={"name": name, "display_order": order})
            created["categories"] += was_created
        summary = ", ".join(f"{count} {kind}" for kind, count in created.items())
        self.stdout.write(self.style.SUCCESS(f"Company content ready (created {summary})."))
