from django.contrib import admin

from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ["name", "email", "preferred_date", "preferred_time", "status", "created_at"]
    list_filter = ["status", "preferred_date", "service", "project"]
    search_fields = ["name", "email", "phone", "message"]
    ordering = ["preferred_date", "preferred_time"]
    readonly_fields = ["created_at", "updated_at"]
    fieldsets = [("Contact", {"fields": ["user", "name", "email", "phone"]}), ("Request", {"fields": ["preferred_date", "preferred_time", "time_window", "message", "project", "service"]}), ("Operations", {"fields": ["status", "internal_notes", "created_at", "updated_at"]})]