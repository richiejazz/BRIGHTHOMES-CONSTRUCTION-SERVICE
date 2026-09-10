from django.contrib import admin

from .models import SavedProject


@admin.register(SavedProject)
class SavedProjectAdmin(admin.ModelAdmin):
    list_display = ["user", "project", "created_at"]
    list_filter = ["created_at"]
    search_fields = ["user__email", "project__title"]
    ordering = ["-created_at"]