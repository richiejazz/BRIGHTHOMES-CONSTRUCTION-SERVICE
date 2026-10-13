import django_filters

from .models import Property


class PropertyFilter(django_filters.FilterSet):
    category_slug = django_filters.CharFilter(field_name="category__slug")
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr="lte")
    min_bedrooms = django_filters.NumberFilter(field_name="bedrooms", lookup_expr="gte")
    location = django_filters.CharFilter(field_name="location", lookup_expr="icontains")

    class Meta:
        model = Property
        fields = ["category", "category_slug", "listing_type", "status", "is_featured", "is_demo", "min_price", "max_price", "min_bedrooms", "location"]

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)
        # Prices on request are hidden from the public, so they must not be filterable by price either.
        if not (self.request and self.request.user.is_staff) and (self.form.cleaned_data.get("min_price") is not None or self.form.cleaned_data.get("max_price") is not None):
            queryset = queryset.exclude(price_display=Property.PriceDisplay.ON_REQUEST)
        return queryset
