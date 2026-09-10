from rest_framework import viewsets

from appointments.models import Appointment
from appointments.serializers import AppointmentSerializer
from dashboard.models import Achievement
from dashboard.serializers import AchievementSerializer
from enquiries.models import Enquiry
from enquiries.serializers import EnquirySerializer
from projects.models import Project, ProjectCategory
from projects.serializers import ProjectCategorySerializer, ProjectSerializer
from saved.models import SavedProject
from saved.serializers import SavedProjectSerializer
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
    filterset_fields = ["category", "status", "is_demo"]
    search_fields = ["title", "summary", "description", "location"]
    ordering_fields = ["title", "created_at", "start_date", "end_date"]
    lookup_field = "slug"

    def get_queryset(self):
        queryset = Project.objects.select_related("category").prefetch_related("services", "images")
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_published=True, category__is_active=True)
        return queryset


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
    filterset_fields = ["status", "project", "service"]
    search_fields = ["name", "email", "message"]
    ordering_fields = ["created_at", "status"]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Enquiry.objects.all()
        return Enquiry.objects.filter(user=self.request.user) if self.request.user.is_authenticated else Enquiry.objects.none()


class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [IsStaffOrCreateOrAuthenticatedReadOnly]
    filterset_fields = ["status", "preferred_date", "project", "service"]
    search_fields = ["name", "email", "message"]
    ordering_fields = ["created_at", "preferred_date", "status"]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Appointment.objects.all()
        return Appointment.objects.filter(user=self.request.user) if self.request.user.is_authenticated else Appointment.objects.none()


class SavedProjectViewSet(viewsets.ModelViewSet):
    serializer_class = SavedProjectSerializer
    permission_classes = []
    queryset = SavedProject.objects.none()
    filterset_fields = ["project"]
    ordering_fields = ["created_at"]

    def get_permissions(self):
        from rest_framework.permissions import IsAuthenticated

        return [IsAuthenticated()]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False) or not self.request.user.is_authenticated:
            return SavedProject.objects.none()
        return SavedProject.objects.filter(user=self.request.user).select_related("project")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)