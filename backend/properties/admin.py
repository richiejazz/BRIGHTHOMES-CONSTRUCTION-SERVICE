from django.contrib import admin
from django.utils.html import format_html

from core.admin_actions import feature, publish, set_field_action, unfeature, unpublish

from .models import Property, PropertyCategory, PropertyFeature, PropertyImage


def image_preview(obj):
    return format_html('<img src="{}" alt="" style="height:64px;width:96px;object-fit:cover">', obj.image.url) if obj.image else ""


@admin.register(PropertyCategory)
class PropertyCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "is_active", "display_order"]
    list_filter = ["is_active"]
    search_fields = ["name", "description"]
    ordering = ["display_order", "name"]
    prepopulated_fields = {"slug": ["name"]}


class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 0
    fields = ["preview", "image", "alt_text", "caption", "display_order", "is_cover"]
    readonly_fields = ["preview"]

    @admin.display(description="Preview")
    def preview(self, obj):
        return image_preview(obj)


class PropertyFeatureInline(admin.TabularInline):
    model = PropertyFeature
    extra = 0
    fields = ["name", "display_order"]


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ["title", "category", "listing_type", "status", "price_display", "is_published", "is_featured", "is_demo", "created_at"]
    list_filter = ["status", "listing_type", "is_published", "is_featured", "is_demo", "category"]
    search_fields = ["title", "summary", "description", "location", "address"]
    ordering = ["-created_at"]
    prepopulated_fields = {"slug": ["title"]}
    inlines = [PropertyImageInline, PropertyFeatureInline]
    actions = [
        publish, unpublish, feature, unfeature,
        set_field_action("status", Property.Status.AVAILABLE, "Mark selected as available"),
        set_field_action("status", Property.Status.RESERVED, "Mark selected as reserved"),
        set_field_action("status", Property.Status.SOLD, "Mark selected as sold"),
        set_field_action("status", Property.Status.RENTED, "Mark selected as rented"),
    ]
    fieldsets = [
        (None, {"fields": ["title", "slug", "summary", "description", "category"]}),
        ("Listing", {"fields": ["listing_type", "status", "price_display", "price"]}),
        ("Location", {"fields": ["location", "address"]}),
        ("Specifications", {"fields": ["bedrooms", "bathrooms", "land_size", "building_size"]}),
        ("Publication", {"fields": ["is_published", "is_featured", "is_demo"]}),
    ]


@admin.register(PropertyImage)
class PropertyImageAdmin(admin.ModelAdmin):
    list_display = ["property", "alt_text", "is_cover", "display_order", "preview"]
    list_filter = ["is_cover"]
    search_fields = ["property__title", "alt_text", "caption"]
    ordering = ["property", "display_order"]

    @admin.display(description="Preview")
    def preview(self, obj):
        return image_preview(obj)
