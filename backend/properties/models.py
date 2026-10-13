from django.core.exceptions import ValidationError
from django.db import models

from core.models import GalleryImage, pick_cover
from core.validators import validate_gallery_image_size


class PropertyCategory(models.Model):
    """The kind of property: house, apartment, land, commercial, estate and so on."""

    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True)
    description = models.TextField(blank=True)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["display_order", "name"]
        verbose_name = "property type"
        verbose_name_plural = "property types"

    def __str__(self):
        return self.name


class Property(models.Model):
    """A real-estate listing. Kept separate from construction projects, which are portfolio work."""

    class ListingType(models.TextChoices):
        SALE = "sale", "For sale"
        RENT = "rent", "For rent"
        LEASE = "lease", "For lease"
        COMING_SOON = "coming_soon", "Coming soon"

    class PriceDisplay(models.TextChoices):
        EXACT = "exact", "Exact price"
        FROM = "from", "Starting from"
        ON_REQUEST = "on_request", "Price on request"

    class Status(models.TextChoices):
        AVAILABLE = "available", "Available"
        RESERVED = "reserved", "Reserved"
        SOLD = "sold", "Sold"
        RENTED = "rented", "Rented"
        COMING_SOON = "coming_soon", "Coming soon"
        UNAVAILABLE = "unavailable", "Unavailable"

    title = models.CharField(max_length=180)
    slug = models.SlugField(max_length=200, unique=True)
    summary = models.CharField(max_length=300)
    description = models.TextField()
    category = models.ForeignKey(PropertyCategory, on_delete=models.PROTECT, related_name="properties", verbose_name="property type")
    listing_type = models.CharField(max_length=16, choices=ListingType.choices)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.AVAILABLE)
    price = models.DecimalField(max_digits=14, decimal_places=2, blank=True, null=True, help_text="In Naira. Hidden from the public when the price is on request.")
    price_display = models.CharField(max_length=16, choices=PriceDisplay.choices, default=PriceDisplay.ON_REQUEST)
    location = models.CharField(max_length=180, blank=True, help_text="Area and city, for example Lekki, Lagos.")
    address = models.CharField(max_length=255, blank=True)
    bedrooms = models.PositiveSmallIntegerField(blank=True, null=True)
    bathrooms = models.PositiveSmallIntegerField(blank=True, null=True)
    land_size = models.CharField(max_length=80, blank=True, help_text="As it should be shown, for example 600 sqm or 2 plots.")
    building_size = models.CharField(max_length=80, blank=True, help_text="As it should be shown, for example 350 sqm.")
    is_featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=False)
    is_demo = models.BooleanField(default=False, help_text="Illustrative or placeholder content that is not a real BRIGHTHOMES listing.")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "properties"

    def __str__(self):
        return self.title

    def clean(self):
        if self.price_display != self.PriceDisplay.ON_REQUEST and self.price is None:
            raise ValidationError({"price": "Enter a price, or set the price display to Price on request."})

    @property
    def cover_image(self):
        return pick_cover(self.images.all())


class PropertyImage(GalleryImage):
    gallery_field = "property"

    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="properties/%Y/%m/", validators=[validate_gallery_image_size])

    class Meta(GalleryImage.Meta):
        pass

    def __str__(self):
        return f"{self.property.title} image"


class PropertyFeature(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="features")
    name = models.CharField(max_length=120)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["display_order", "id"]
        constraints = [models.UniqueConstraint(fields=["property", "name"], name="unique_feature_per_property")]

    def __str__(self):
        return self.name
