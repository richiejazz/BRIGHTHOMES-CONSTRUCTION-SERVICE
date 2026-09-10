from rest_framework import serializers

from .models import Enquiry


class EnquirySerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Enquiry
        fields = ["id", "user", "name", "email", "phone", "message", "project", "service", "status", "internal_notes", "created_at", "updated_at"]
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