from django.conf import settings
from django.db import models


class Enquiry(models.Model):
    class Status(models.TextChoices):
        NEW = "new", "New"
        IN_PROGRESS = "in_progress", "In progress"
        RESOLVED = "resolved", "Resolved"
        CLOSED = "closed", "Closed"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, related_name="enquiries", blank=True, null=True)
    name = models.CharField(max_length=160)
    email = models.EmailField()
    phone = models.CharField(max_length=40, blank=True)
    message = models.TextField()
    project = models.ForeignKey("projects.Project", on_delete=models.SET_NULL, related_name="enquiries", blank=True, null=True)
    service = models.ForeignKey("services.Service", on_delete=models.SET_NULL, related_name="enquiries", blank=True, null=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.NEW)
    internal_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Enquiry from {self.name}"