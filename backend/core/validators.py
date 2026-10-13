from django.core.exceptions import ValidationError

MAX_GALLERY_IMAGE_BYTES = 15 * 1024 * 1024


def validate_gallery_image_size(upload):
    """Reject gallery uploads that are far larger than any web or app view needs."""
    if upload and upload.size > MAX_GALLERY_IMAGE_BYTES:
        raise ValidationError("Images must be 15 MB or smaller.")
