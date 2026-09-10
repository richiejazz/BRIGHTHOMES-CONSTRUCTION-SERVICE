from django.conf import settings
from django.db import models


class Appointment(models.Model):
    class Status(models.TextChoices):
        REQUESTED = "requested", "Requested"
        CONFIRMED = "confirmed", "Confirmed"
        DECLINED = "declined", "Declined"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

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
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.REQUESTED)
    internal_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Appointment from {self.name}"