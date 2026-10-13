from io import BytesIO
from uuid import uuid4

from django.core.files.base import ContentFile
from PIL import Image, ImageOps, UnidentifiedImageError
from rest_framework import serializers

MAX_UPLOAD_BYTES = 8 * 1024 * 1024
AVATAR_SIZE = 512
ACCEPTED_FORMATS = {"JPEG", "PNG", "WEBP"}


def process_avatar(upload):
    """Validate an uploaded profile photo and return it as a small square JPEG.

    Re-encoding bounds the stored size, applies the camera's orientation and drops EXIF data
    (which can include the location the photo was taken).
    """
    if upload.size > MAX_UPLOAD_BYTES:
        raise serializers.ValidationError("Please choose an image smaller than 8 MB.")
    try:
        with Image.open(upload) as probe:
            probe.verify()
        upload.seek(0)
        image = Image.open(upload)
        if image.format not in ACCEPTED_FORMATS:
            raise serializers.ValidationError("Please upload a JPEG, PNG or WebP image.")
        image = ImageOps.exif_transpose(image).convert("RGB")
    except (UnidentifiedImageError, Image.DecompressionBombError, OSError, SyntaxError):
        raise serializers.ValidationError("This file isn't a valid image.")
    square = ImageOps.fit(image, (AVATAR_SIZE, AVATAR_SIZE), Image.Resampling.LANCZOS)
    buffer = BytesIO()
    square.save(buffer, "JPEG", quality=85, optimize=True)
    return ContentFile(buffer.getvalue(), name=f"{uuid4().hex}.jpg")
