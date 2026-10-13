from django.db import models


class GalleryImage(models.Model):
    """An ordered gallery image with at most one cover per owning record.

    Subclasses add the owning foreign key and the `image` field, and name the foreign key in
    `gallery_field` so the single-cover rule can be enforced.
    """

    gallery_field = ""

    alt_text = models.CharField(max_length=180)
    caption = models.CharField(max_length=300, blank=True)
    display_order = models.PositiveIntegerField(default=0)
    is_cover = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ["display_order", "created_at"]

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.is_cover:
            owner = {f"{self.gallery_field}_id": getattr(self, f"{self.gallery_field}_id")}
            type(self).objects.filter(is_cover=True, **owner).exclude(pk=self.pk).update(is_cover=False)


def pick_cover(images):
    """The image marked as cover, else the first image in display order, else None."""
    images = list(images)
    return next((image for image in images if image.is_cover), images[0] if images else None)
