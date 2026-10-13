from django.db import transaction
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from .models import Property, PropertyCategory, PropertyFeature, PropertyImage


def is_staff_request(context):
    request = context.get("request")
    return bool(request and request.user.is_staff)


def hide_price_on_request(data, context):
    # A price on request is never sent to the public, even if staff have recorded one.
    if data.get("price_display") == Property.PriceDisplay.ON_REQUEST and not is_staff_request(context):
        data["price"] = None
    return data


class PropertyCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyCategory
        fields = ["id", "name", "slug", "description", "display_order", "is_active"]


class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ["id", "image", "alt_text", "caption", "display_order", "is_cover", "created_at", "updated_at"]
        read_only_fields = ["created_at", "updated_at"]


class PropertyImageWriteSerializer(serializers.ModelSerializer):
    """Staff upload and management of listing photographs."""

    class Meta:
        model = PropertyImage
        fields = ["id", "property", "image", "alt_text", "caption", "display_order", "is_cover", "created_at", "updated_at"]
        read_only_fields = ["created_at", "updated_at"]


class PropertySerializer(serializers.ModelSerializer):
    category = PropertyCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(source="category", queryset=PropertyCategory.objects.all(), write_only=True)
    images = PropertyImageSerializer(many=True, read_only=True)
    # Features are written as a list of names and returned the same way (see to_representation).
    features = serializers.ListField(child=serializers.CharField(max_length=120), required=False, write_only=True)

    class Meta:
        model = Property
        fields = [
            "id", "title", "slug", "summary", "description", "category", "category_id", "listing_type", "status",
            "price", "price_display", "location", "address", "bedrooms", "bathrooms", "land_size", "building_size",
            "features", "images", "is_featured", "is_published", "is_demo", "created_at", "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at", "is_demo"]

    def validate_features(self, names):
        cleaned = []
        for name in (name.strip() for name in names):
            if name and name.lower() not in {existing.lower() for existing in cleaned}:
                cleaned.append(name)
        return cleaned

    def validate(self, attrs):
        price_display = attrs.get("price_display", getattr(self.instance, "price_display", Property.PriceDisplay.ON_REQUEST))
        price = attrs.get("price", getattr(self.instance, "price", None))
        if price_display != Property.PriceDisplay.ON_REQUEST and price is None:
            raise serializers.ValidationError({"price": "Enter a price, or set the price display to Price on request."})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        features = validated_data.pop("features", None)
        instance = super().create(validated_data)
        if features is not None:
            self._write_features(instance, features)
        return instance

    @transaction.atomic
    def update(self, instance, validated_data):
        features = validated_data.pop("features", None)
        instance = super().update(instance, validated_data)
        if features is not None:
            self._write_features(instance, features)
        return instance

    @staticmethod
    def _write_features(instance, names):
        instance.features.all().delete()
        PropertyFeature.objects.bulk_create(PropertyFeature(property=instance, name=name, display_order=order) for order, name in enumerate(names))

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["features"] = [feature.name for feature in instance.features.all()]
        return hide_price_on_request(data, self.context)


class PropertySummarySerializer(serializers.ModelSerializer):
    """Compact, read-only property reference embedded in client-owned records."""

    category = serializers.CharField(source="category.name", read_only=True)
    cover_image = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = ["id", "slug", "title", "category", "listing_type", "status", "price", "price_display", "location", "is_published", "is_demo", "cover_image"]
        read_only_fields = fields

    @extend_schema_field(PropertyImageSerializer(allow_null=True))
    def get_cover_image(self, instance):
        cover = instance.cover_image
        return PropertyImageSerializer(cover, context=self.context).data if cover else None

    def to_representation(self, instance):
        return hide_price_on_request(super().to_representation(instance), self.context)
