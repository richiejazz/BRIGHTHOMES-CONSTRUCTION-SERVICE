from django.contrib import admin

from .models import Enquiry


@admin.register(Enquiry)
class EnquiryAdmin(admin.ModelAdmin):
    list_display = ["reference", "name", "email", "preferred_contact", "status", "project", "service", "created_at"]
    list_filter = ["status", "preferred_contact", "service", "project", "property"]
    search_fields = ["name", "email", "phone", "message"]
    ordering = ["-created_at"]
    readonly_fields = ["reference", "created_at", "updated_at"]
    fieldsets = [("Contact", {"fields": ["user", "name", "email", "phone"]}), ("Enquiry", {"fields": ["message", "preferred_contact", "project", "property", "service"]}), ("Operations", {"fields": ["reference", "status", "internal_notes", "created_at", "updated_at"]})]