from rest_framework import viewsets
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAdminUser, IsAuthenticated

from appointments.models import Appointment
from appointments.serializers import AppointmentSerializer
from dashboard.models import Achievement
from dashboard.serializers import AchievementSerializer
from enquiries.models import Enquiry
from enquiries.serializers import EnquirySerializer
from projects.models import Project, ProjectCategory, ProjectImage
from projects.serializers import ProjectCategorySerializer, ProjectImageWriteSerializer, ProjectSerializer
from properties.filters import PropertyFilter
from properties.models import Property, PropertyCategory, PropertyImage
from properties.serializers import PropertyCategorySerializer, PropertyImageWriteSerializer, PropertySerializer
from saved.models import SavedProject, SavedProperty
from saved.serializers import SavedProjectSerializer, SavedPropertySerializer
from services.models import Service
from services.serializers import ServiceSerializer

from .permissions import IsStaffOrCreateOrAuthenticatedReadOnly, IsStaffOrReadOnly


class ProjectCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectCategorySerializer
    permission_classes = [IsStaffOrReadOnly]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "display_order"]

    def get_queryset(self):
        queryset = ProjectCategory.objects.all()
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_active=True)
        return queryset


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsStaffOrReadOnly]
    filterset_fields = ["category", "status", "is_featured", "is_demo"]
    search_fields = ["title", "summary", "description", "location"]
    ordering_fields = ["title", "created_at", "start_date", "end_date"]
    lookup_field = "slug"

    def get_queryset(self):
        queryset = Project.objects.select_related("category").prefetch_related("services", "images")
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_published=True, category__is_active=True)
        return queryset


class StaffImageViewSet(viewsets.ModelViewSet):
    """Staff-only upload and management of gallery images (multipart for uploads)."""

    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    ordering_fields = ["display_order", "created_at"]


class ProjectImageViewSet(StaffImageViewSet):
    serializer_class = ProjectImageWriteSerializer
    queryset = ProjectImage.objects.select_related("project")
    filterset_fields = ["project", "is_cover"]


class PropertyCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = PropertyCategorySerializer
    permission_classes = [IsStaffOrReadOnly]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "display_order"]
    lookup_field = "slug"

    def get_queryset(self):
        queryset = PropertyCategory.objects.all()
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_active=True)
        return queryset


class PropertyViewSet(viewsets.ModelViewSet):
    serializer_class = PropertySerializer
    permission_classes = [IsStaffOrReadOnly]
    filterset_class = PropertyFilter
    search_fields = ["title", "summary", "description", "location"]
    ordering_fields = ["title", "price", "created_at"]
    lookup_field = "slug"

    def get_queryset(self):
        queryset = Property.objects.select_related("category").prefetch_related("images", "features")
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_published=True, category__is_active=True)
        return queryset


class PropertyImageViewSet(StaffImageViewSet):
    serializer_class = PropertyImageWriteSerializer
    queryset = PropertyImage.objects.select_related("property")
    filterset_fields = ["property", "is_cover"]


class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSerializer
    permission_classes = [IsStaffOrReadOnly]
    search_fields = ["name", "short_description", "description"]
    ordering_fields = ["name", "display_order", "created_at"]
    lookup_field = "slug"

    def get_queryset(self):
        queryset = Service.objects.all()
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_published=True)
        return queryset


class AchievementViewSet(viewsets.ModelViewSet):
    serializer_class = AchievementSerializer
    permission_classes = [IsStaffOrReadOnly]
    search_fields = ["value", "label", "description"]
    ordering_fields = ["label", "display_order", "created_at"]

    def get_queryset(self):
        queryset = Achievement.objects.all()
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_published=True)
        return queryset


class EnquiryViewSet(viewsets.ModelViewSet):
    serializer_class = EnquirySerializer
    permission_classes = [IsStaffOrCreateOrAuthenticatedReadOnly]
    filterset_fields = ["status", "project", "service", "property"]
    search_fields = ["name", "email", "message"]
    ordering_fields = ["created_at", "status"]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Enquiry.objects.select_related("project__category", "service", "property__category").prefetch_related("project__images", "property__images")
        if not self.request.user.is_authenticated:
            return Enquiry.objects.none()
        return Enquiry.objects.filter(user=self.request.user).select_related("project__category", "service", "property__category").prefetch_related("project__images", "property__images")


class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [IsStaffOrCreateOrAuthenticatedReadOnly]
    filterset_fields = ["status", "preferred_date", "project", "service", "property"]
    search_fields = ["name", "email", "message"]
    ordering_fields = ["created_at", "preferred_date", "status"]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Appointment.objects.select_related("project__category", "service", "property__category").prefetch_related("project__images", "property__images", "services")
        if not self.request.user.is_authenticated:
            return Appointment.objects.none()
        return Appointment.objects.filter(user=self.request.user).select_related("project__category", "service", "property__category").prefetch_related("project__images", "property__images", "services")


class SavedProjectViewSet(viewsets.ModelViewSet):
    serializer_class = SavedProjectSerializer
    permission_classes = [IsAuthenticated]
    queryset = SavedProject.objects.none()
    filterset_fields = ["project"]
    ordering_fields = ["created_at"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False) or not self.request.user.is_authenticated:
            return SavedProject.objects.none()
        return SavedProject.objects.filter(user=self.request.user).select_related("project__category").prefetch_related("project__images")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SavedPropertyViewSet(viewsets.ModelViewSet):
    serializer_class = SavedPropertySerializer
    permission_classes = [IsAuthenticated]
    queryset = SavedProperty.objects.none()
    filterset_fields = ["property"]
    ordering_fields = ["created_at"]
    http_method_names = ["get", "post", "delete", "head", "options"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False) or not self.request.user.is_authenticated:
            return SavedProperty.objects.none()
        return SavedProperty.objects.filter(user=self.request.user).select_related("property__category").prefetch_related("property__images")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
