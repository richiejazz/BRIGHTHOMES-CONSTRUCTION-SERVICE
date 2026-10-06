from rest_framework import serializers

from projects.serializers import ProjectSummarySerializer
from services.serializers import ServiceSummarySerializer

from .models import Enquiry


class EnquirySerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    project_summary = ProjectSummarySerializer(source="project", read_only=True)
    service_summary = ServiceSummarySerializer(source="service", read_only=True)

    class Meta:
        model = Enquiry
        fields = ["id", "user", "name", "email", "phone", "message", "project", "project_summary", "service", "service_summary", "status", "internal_notes", "created_at", "updated_at"]
        read_only_fields = ["user", "status", "internal_notes", "created_at", "updated_at"]

    def validate(self, attrs):
        request = self.context["request"]
        for field in ("project", "service"):
            related = attrs.get(field)
            if related and ((field == "project" and not related.is_published) or (field == "service" and not related.is_published)):
                raise serializers.ValidationError({field: "Only published records can be selected."})
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