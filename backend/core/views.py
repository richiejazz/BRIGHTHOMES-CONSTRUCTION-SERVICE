from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import OpenApiResponse, extend_schema


class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(responses=OpenApiResponse(description="API health response"))
    def get(self, request):
        return Response({"status": "ok", "service": "brighthomes-api", "version": "v1"})
