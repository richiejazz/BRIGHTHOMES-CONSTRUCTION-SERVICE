from django.contrib import admin

from core.admin_actions import publish, unpublish

from .models import Achievement


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ["value", "label", "is_published", "display_order"]
    list_filter = ["is_published"]
    search_fields = ["value", "label", "description"]
    ordering = ["display_order", "label"]
    actions = [publish, unpublish]