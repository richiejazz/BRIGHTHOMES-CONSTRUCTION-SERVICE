from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class BrighthomesUserAdmin(UserAdmin):
    ordering = ("email",)
    list_display = ("email", "role", "is_staff", "is_active")
    fieldsets = ((None, {"fields": ("email", "password")}), ("Profile", {"fields": ("first_name", "last_name", "phone", "avatar")}), ("Access", {"fields": ("role", "is_active", "is_staff", "is_superuser", "groups", "user_permissions")}), ("Dates", {"fields": ("last_login", "date_joined")}))
    add_fieldsets = ((None, {"classes": ("wide",), "fields": ("email", "password1", "password2", "role")}),)
    search_fields = ("email",)
