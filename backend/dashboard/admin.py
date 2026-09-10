from django.contrib import admin

from .models import Achievement


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ["value", "label", "is_published", "display_order"]
    list_filter = ["is_published"]
    search_fields = ["value", "label", "description"]
    ordering = ["display_order", "label"]