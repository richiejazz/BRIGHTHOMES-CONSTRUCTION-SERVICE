from django.contrib import admin

from .models import Project, ProjectCategory, ProjectImage


@admin.register(ProjectCategory)
class ProjectCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "is_active", "display_order"]
    list_filter = ["is_active"]
    search_fields = ["name", "description"]
    ordering = ["display_order", "name"]
    prepopulated_fields = {"slug": ["name"]}


class ProjectImageInline(admin.TabularInline):
    model = ProjectImage
    extra = 0


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ["title", "category", "status", "is_published", "is_demo", "created_at"]
    list_filter = ["status", "is_published", "is_demo", "category"]
    search_fields = ["title", "summary", "description", "location"]
    ordering = ["-created_at"]
    prepopulated_fields = {"slug": ["title"]}
    filter_horizontal = ["services"]
    inlines = [ProjectImageInline]
    fieldsets = [(None, {"fields": ["title", "slug", "summary", "description", "category", "services"]}), ("Publication", {"fields": ["status", "is_published", "is_demo"]}), ("Project details", {"fields": ["location", "start_date", "end_date"]})]


@admin.register(ProjectImage)
class ProjectImageAdmin(admin.ModelAdmin):
    list_display = ["project", "alt_text", "is_cover", "display_order"]
    list_filter = ["is_cover"]
    search_fields = ["project__title", "alt_text", "caption"]
    ordering = ["project", "display_order"]