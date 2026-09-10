from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .api_views import (
	AchievementViewSet,
	AppointmentViewSet,
	EnquiryViewSet,
	ProjectCategoryViewSet,
	ProjectViewSet,
	SavedProjectViewSet,
	ServiceViewSet,
)
from .views import HealthCheckView

router = DefaultRouter()
router.register("categories", ProjectCategoryViewSet, basename="category")
router.register("projects", ProjectViewSet, basename="project")
router.register("services", ServiceViewSet, basename="service")
router.register("achievements", AchievementViewSet, basename="achievement")
router.register("enquiries", EnquiryViewSet, basename="enquiry")
router.register("appointments", AppointmentViewSet, basename="appointment")
router.register("saved-projects", SavedProjectViewSet, basename="saved-project")

urlpatterns = [
	path("health/", HealthCheckView.as_view(), name="health"),
	path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
	path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
	path("", include(router.urls)),
]
