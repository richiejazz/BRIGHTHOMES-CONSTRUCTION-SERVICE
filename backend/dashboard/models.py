from django.db import models


class Achievement(models.Model):
    value = models.CharField(max_length=120)
    label = models.CharField(max_length=180)
    description = models.TextField(blank=True)
    display_order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["display_order", "label"]

    def __str__(self):
        return f"{self.value} {self.label}"