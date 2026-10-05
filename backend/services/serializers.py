from rest_framework import serializers

from .models import Service


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ["id", "name", "slug", "short_description", "description", "display_order", "is_published", "created_at", "updated_at"]
        read_only_fields = ["created_at", "updated_at"]


class ServiceSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ["id", "slug", "name"]
        read_only_fields = fields