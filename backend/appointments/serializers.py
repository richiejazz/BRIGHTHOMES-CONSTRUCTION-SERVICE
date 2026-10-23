from rest_framework import serializers

from projects.serializers import ProjectSummarySerializer
from properties.serializers import PropertySummarySerializer
from services.models import Service
from services.serializers import ServiceSummarySerializer

from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    project_summary = ProjectSummarySerializer(source="project", read_only=True)
    service_summary = ServiceSummarySerializer(source="service", read_only=True)
    property_summary = PropertySummarySerializer(source="property", read_only=True)
    services = serializers.PrimaryKeyRelatedField(many=True, queryset=Service.objects.all(), required=False)
    services_summary = ServiceSummarySerializer(source="services", many=True, read_only=True)
    reference = serializers.CharField(read_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id", "reference", "user", "name", "email", "phone", "preferred_date", "preferred_time", "time_window", "mode", "based_abroad",
            "project_type", "site_location", "timeline", "message", "project", "project_summary", "service", "service_summary",
            "services", "services_summary", "services_not_sure", "property", "property_summary", "status", "internal_notes", "created_at", "updated_at",
        ]
        read_only_fields = ["user", "status", "internal_notes", "created_at", "updated_at"]

    def validate(self, attrs):
        request = self.context["request"]
        for field in ("project", "service", "property"):
            related = attrs.get(field)
            if related and not related.is_published:
                raise serializers.ValidationError({field: "Only published records can be selected."})
        services = attrs.get("services")
        if services is not None:
            if any(not service.is_published for service in services):
                raise serializers.ValidationError({"services": "Only published services can be selected."})
            # Keep the single-service field (read by existing clients) in step with the first choice.
            if services and not attrs.get("service"):
                attrs["service"] = services[0]
        elif attrs.get("service"):
            attrs["services"] = [attrs["service"]]
        if request.user.is_authenticated:
            attrs["user"] = request.user
        return attrs

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Internal notes are written by staff for staff; clients never receive them.
        request = self.context.get("request")
        if not (request and request.user.is_staff):
            data.pop("internal_notes", None)
        return data