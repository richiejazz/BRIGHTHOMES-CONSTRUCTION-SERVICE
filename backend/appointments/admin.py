from django.contrib import admin

from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ["reference", "name", "email", "preferred_date", "mode", "status", "created_at"]
    list_filter = ["status", "mode", "based_abroad", "project_type", "preferred_date", "service", "project", "property"]
    filter_horizontal = ["services"]
    search_fields = ["name", "email", "phone", "message"]
    ordering = ["preferred_date", "preferred_time"]
    readonly_fields = ["reference", "created_at", "updated_at"]
    fieldsets = [("Contact", {"fields": ["user", "name", "email", "phone"]}), ("Request", {"fields": ["services", "services_not_sure", "service", "project_type", "site_location", "timeline", "based_abroad", "preferred_date", "preferred_time", "time_window", "mode", "message", "project", "property"]}), ("Operations", {"fields": ["reference", "status", "internal_notes", "created_at", "updated_at"]})]