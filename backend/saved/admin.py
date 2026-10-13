from django.contrib import admin

from .models import SavedProject, SavedProperty


@admin.register(SavedProject)
class SavedProjectAdmin(admin.ModelAdmin):
    list_display = ["user", "project", "created_at"]
    list_filter = ["created_at"]
    search_fields = ["user__email", "project__title"]
    ordering = ["-created_at"]


@admin.register(SavedProperty)
class SavedPropertyAdmin(admin.ModelAdmin):
    list_display = ["user", "property", "created_at"]
    list_filter = ["created_at"]
    search_fields = ["user__email", "property__title"]
    ordering = ["-created_at"]
