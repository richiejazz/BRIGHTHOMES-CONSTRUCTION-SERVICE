import builtins

from django.conf import settings
from django.db import models


class Appointment(models.Model):
    class Status(models.TextChoices):
        REQUESTED = "requested", "Requested"
        CONFIRMED = "confirmed", "Confirmed"
        DECLINED = "declined", "Declined"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    class Mode(models.TextChoices):
        IN_PERSON = "in_person", "In person"
        VIDEO = "video", "Video call"
        PHONE = "phone", "Phone call"

    class ProjectType(models.TextChoices):
        NEW_BUILD = "new_build", "New build"
        RENOVATION = "renovation", "Renovation"
        BUYING_SELLING = "buying_selling", "Buying or selling"
        LAND_DOCUMENTATION = "land_documentation", "Land & documentation"
        OTHER = "other", "Other"

    class Timeline(models.TextChoices):
        ASAP = "asap", "As soon as possible"
        WITHIN_3_MONTHS = "within_3_months", "Within 3 months"
        WITHIN_6_MONTHS = "within_6_months", "Within 6 months"
        WITHIN_12_MONTHS = "within_12_months", "Within a year"
        NOT_SURE = "not_sure", "Not sure yet"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, related_name="appointments", blank=True, null=True)
    name = models.CharField(max_length=160)
    email = models.EmailField()
    phone = models.CharField(max_length=40, blank=True)
    preferred_date = models.DateField()
    preferred_time = models.TimeField(blank=True, null=True)
    time_window = models.CharField(max_length=120, blank=True)
    message = models.TextField(blank=True)
    project = models.ForeignKey("projects.Project", on_delete=models.SET_NULL, related_name="appointments", blank=True, null=True)
    service = models.ForeignKey("services.Service", on_delete=models.SET_NULL, related_name="appointments", blank=True, null=True)
    # Several services can be chosen; `service` stays for existing API clients and mirrors the first choice.
    services = models.ManyToManyField("services.Service", related_name="consultations", blank=True)
    services_not_sure = models.BooleanField(default=False, help_text="The client chose “Not sure yet” instead of, or as well as, specific services.")
    mode = models.CharField(max_length=16, choices=Mode.choices, blank=True, help_text="How the client would like to meet.")
    based_abroad = models.BooleanField(null=True, blank=True, help_text="Whether the client is based outside Nigeria.")
    project_type = models.CharField(max_length=24, choices=ProjectType.choices, blank=True)
    site_location = models.CharField(max_length=180, blank=True)
    timeline = models.CharField(max_length=24, choices=Timeline.choices, blank=True)
    property = models.ForeignKey("properties.Property", on_delete=models.SET_NULL, related_name="appointments", blank=True, null=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.REQUESTED)
    internal_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.reference} from {self.name}"

    # `property` is a field name on this model, so the decorator is referenced explicitly.
    @builtins.property
    def reference(self):
        """Stable, human-readable reference shown to clients and staff, e.g. CON-0118."""
        return f"CON-{self.pk:04d}" if self.pk else ""