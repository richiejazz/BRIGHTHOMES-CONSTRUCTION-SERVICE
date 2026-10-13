from django.contrib import admin


def set_field_action(field, value, description):
    """A bulk admin action that sets one field on the selected records."""

    @admin.action(description=description)
    def action(modeladmin, request, queryset):
        updated = queryset.update(**{field: value})
        modeladmin.message_user(request, f"{updated} record{'s' if updated != 1 else ''} updated.")

    action.__name__ = f"set_{field}_{value}".replace(" ", "_").lower()
    return action


publish = set_field_action("is_published", True, "Publish selected")
unpublish = set_field_action("is_published", False, "Unpublish selected")
feature = set_field_action("is_featured", True, "Feature selected")
unfeature = set_field_action("is_featured", False, "Stop featuring selected")
