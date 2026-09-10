from rest_framework import serializers

from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Appointment
        fields = ["id", "user", "name", "email", "phone", "preferred_date", "preferred_time", "time_window", "message", "project", "service", "status", "internal_notes", "created_at", "updated_at"]
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