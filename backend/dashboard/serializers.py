from rest_framework import serializers

from .models import Achievement


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ["id", "value", "label", "description", "display_order", "is_published", "created_at", "updated_at"]
        read_only_fields = ["created_at", "updated_at"]