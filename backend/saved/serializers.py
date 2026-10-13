from rest_framework import serializers

from projects.serializers import ProjectSummarySerializer
from properties.serializers import PropertySummarySerializer

from .models import SavedProject, SavedProperty


class SavedProjectSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    project_summary = ProjectSummarySerializer(source="project", read_only=True)

    class Meta:
        model = SavedProject
        fields = ["id", "user", "project", "project_summary", "created_at", "updated_at"]
        read_only_fields = ["user", "created_at", "updated_at"]

    def validate_project(self, project):
        if not project.is_published:
            raise serializers.ValidationError("Only published projects can be saved.")
        user = self.context["request"].user
        if SavedProject.objects.filter(user=user, project=project).exists():
            raise serializers.ValidationError("This project is already saved.")
        return project


class SavedPropertySerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    property_summary = PropertySummarySerializer(source="property", read_only=True)

    class Meta:
        model = SavedProperty
        fields = ["id", "user", "property", "property_summary", "created_at", "updated_at"]
        read_only_fields = ["user", "created_at", "updated_at"]

    def validate_property(self, listing):
        if not listing.is_published:
            raise serializers.ValidationError("Only published properties can be saved.")
        user = self.context["request"].user
        if SavedProperty.objects.filter(user=user, property=listing).exists():
            raise serializers.ValidationError("This property is already saved.")
        return listing
