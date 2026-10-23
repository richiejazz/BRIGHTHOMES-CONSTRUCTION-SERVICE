from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from users.views import CurrentUserAvatarView, CurrentUserView, PasswordResetConfirmView, PasswordResetRequestView, RegisterView

from .api_views import (
	AchievementViewSet,
	AppointmentViewSet,
	EnquiryViewSet,
	ProjectCategoryViewSet,
	ProjectImageViewSet,
	ProjectViewSet,
	PropertyCategoryViewSet,
	PropertyImageViewSet,
	PropertyViewSet,
	SavedProjectViewSet,
	SavedPropertyViewSet,
	ServiceViewSet,
)
from .views import HealthCheckView

router = DefaultRouter()
router.register("categories", ProjectCategoryViewSet, basename="category")
router.register("projects", ProjectViewSet, basename="project")
router.register("project-images", ProjectImageViewSet, basename="project-image")
router.register("property-types", PropertyCategoryViewSet, basename="property-type")
router.register("properties", PropertyViewSet, basename="property")
router.register("property-images", PropertyImageViewSet, basename="property-image")
router.register("services", ServiceViewSet, basename="service")
router.register("achievements", AchievementViewSet, basename="achievement")
router.register("enquiries", EnquiryViewSet, basename="enquiry")
router.register("appointments", AppointmentViewSet, basename="appointment")
router.register("saved-projects", SavedProjectViewSet, basename="saved-project")
router.register("saved-properties", SavedPropertyViewSet, basename="saved-property")

urlpatterns = [
	path("health/", HealthCheckView.as_view(), name="health"),
	path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
	path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
	path("auth/register/", RegisterView.as_view(), name="register"),
	path("auth/me/", CurrentUserView.as_view(), name="current_user"),
	path("auth/me/avatar/", CurrentUserAvatarView.as_view(), name="current_user_avatar"),
	path("auth/password-reset/", PasswordResetRequestView.as_view(), name="password_reset"),
	path("auth/password-reset/confirm/", PasswordResetConfirmView.as_view(), name="password_reset_confirm"),
	path("", include(router.urls)),
]
