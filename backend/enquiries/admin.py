from django.contrib import admin

from .models import Enquiry


@admin.register(Enquiry)
class EnquiryAdmin(admin.ModelAdmin):
    list_display = ["name", "email", "status", "project", "service", "created_at"]
    list_filter = ["status", "service", "project", "property"]
    search_fields = ["name", "email", "phone", "message"]
    ordering = ["-created_at"]
    readonly_fields = ["created_at", "updated_at"]
    fieldsets = [("Contact", {"fields": ["user", "name", "email", "phone"]}), ("Enquiry", {"fields": ["message", "project", "property", "service"]}), ("Operations", {"fields": ["status", "internal_notes", "created_at", "updated_at"]})]