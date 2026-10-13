from django.contrib import admin

from core.admin_actions import publish, unpublish

from .models import Service


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ["name", "is_published", "display_order", "created_at"]
    list_filter = ["is_published"]
    search_fields = ["name", "short_description", "description"]
    ordering = ["display_order", "name"]
    prepopulated_fields = {"slug": ["name"]}
    actions = [publish, unpublish]