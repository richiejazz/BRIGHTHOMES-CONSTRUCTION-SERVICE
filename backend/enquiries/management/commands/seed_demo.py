from django.core.management.base import BaseCommand

from projects.models import Project, ProjectCategory
from services.models import Service


class Command(BaseCommand):
    help = "Create generic, clearly identifiable BRIGHTHOMES demo content."

    def handle(self, *args, **options):
        category, _ = ProjectCategory.objects.get_or_create(
            slug="demo-category",
            defaults={"name": "Demo category", "description": "Generic demonstration category."},
        )
        service, _ = Service.objects.get_or_create(
            slug="demo-service",
            defaults={
                "name": "Demo service",
                "short_description": "Generic demonstration service.",
                "description": "This is placeholder content for local development only.",
                "is_published": True,
            },
        )
        project, created = Project.objects.get_or_create(
            slug="demo-project",
            defaults={
                "title": "Demo project",
                "summary": "Generic demonstration project.",
                "description": "This clearly identified demo record contains no real client or project claims.",
                "category": category,
                "status": Project.Status.COMPLETED,
                "is_published": True,
                "is_demo": True,
            },
        )
        if not project.is_demo:
            project.is_demo = True
            project.save(update_fields=["is_demo", "updated_at"])
        project.services.add(service)
        self.stdout.write(self.style.SUCCESS(f"Demo project {'created' if created else 'ready'}: {project.slug}"))