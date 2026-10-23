from django.db import models

from core.models import GalleryImage, pick_cover
from core.validators import validate_gallery_image_size


class ProjectCategory(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True)
    description = models.TextField(blank=True)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["display_order", "name"]
        verbose_name_plural = "project categories"

    def __str__(self):
        return self.name


class Project(models.Model):
    class Status(models.TextChoices):
        COMPLETED = "completed", "Completed"
        ONGOING = "ongoing", "Ongoing"

    title = models.CharField(max_length=180)
    slug = models.SlugField(max_length=200, unique=True)
    summary = models.CharField(max_length=300)
    description = models.TextField()
    category = models.ForeignKey(ProjectCategory, on_delete=models.PROTECT, related_name="projects")
    status = models.CharField(max_length=16, choices=Status.choices)
    is_published = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False, help_text="Featured projects lead the selected work on the website and app.")
    is_demo = models.BooleanField(default=False, help_text="Illustrative or placeholder content that is not a real BRIGHTHOMES project.")
    location = models.CharField(max_length=180, blank=True)
    building_type = models.CharField(max_length=120, blank=True, help_text="For example Detached residence or Mid-rise apartments.")
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    services = models.ManyToManyField("services.Service", related_name="projects", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    @property
    def cover_image(self):
        return pick_cover(self.images.all())


class ProjectImage(GalleryImage):
    gallery_field = "project"

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="projects/%Y/%m/", validators=[validate_gallery_image_size])

    class Meta(GalleryImage.Meta):
        pass

    def __str__(self):
        return f"{self.project.title} image"