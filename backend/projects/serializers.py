from rest_framework import serializers

from services.models import Service

from .models import Project, ProjectCategory, ProjectImage


class ProjectCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectCategory
        fields = ["id", "name", "slug", "description", "display_order", "is_active"]


class ProjectImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectImage
        fields = ["id", "image", "alt_text", "caption", "display_order", "is_cover", "created_at", "updated_at"]
        read_only_fields = ["created_at", "updated_at"]


class ProjectSerializer(serializers.ModelSerializer):
    category = ProjectCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(source="category", queryset=ProjectCategory.objects.all(), write_only=True)
    services = serializers.PrimaryKeyRelatedField(many=True, queryset=Service.objects.all())
    images = ProjectImageSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = ["id", "title", "slug", "summary", "description", "category", "category_id", "status", "is_published", "is_demo", "location", "start_date", "end_date", "services", "images", "created_at", "updated_at"]
        read_only_fields = ["created_at", "updated_at", "is_demo"]

    def validate_category_id(self, category):
        if not category.is_active and not self.context["request"].user.is_staff:
            raise serializers.ValidationError("The selected category is not active.")
        return category


class ProjectImageWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectImage
        fields = ["id", "project", "image", "alt_text", "caption", "display_order", "is_cover", "created_at", "updated_at"]
        read_only_fields = ["created_at", "updated_at"]