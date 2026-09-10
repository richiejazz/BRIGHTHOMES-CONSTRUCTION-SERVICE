from django.conf import settings
from django.db import models


class SavedProject(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="saved_projects")
    project = models.ForeignKey("projects.Project", on_delete=models.CASCADE, related_name="saved_by")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [models.UniqueConstraint(fields=["user", "project"], name="unique_saved_project_per_user")]

    def __str__(self):
        return f"{self.user} saved {self.project}"