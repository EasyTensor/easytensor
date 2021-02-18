"""backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework import routers, serializers, viewsets
from dj_rest_auth.registration.views import VerifyEmailView

# from allauth.account.views import ConfirmEmailView
from backend.confirm_email_view import ConfirmEmailView
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="Models API",
        default_version="v1",
        description="API documentation for managing easytensor models.",
        terms_of_service="",
        contact=openapi.Contact(email="kamal@easytensor.com"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

from uploads.views import (
    ModelUploadViewSet,
    ModelViewSet,
    health_check,
    QueryAccessTokenViewSet,
    EmptyView,
)

from django.db import models

# Routers provide an easy way of automatically determining the URL conf.
router = routers.DefaultRouter()
router.register(r"model-uploads", ModelUploadViewSet)
router.register(r"models", ModelViewSet)
router.register(r"query-access-token", QueryAccessTokenViewSet)


urlpatterns = [
    path(
        "swagger(?P<format>\.json|\.yaml)",
        schema_view.without_ui(cache_timeout=0),
        name="schema-json",
    ),
    path(
        r"swagger/",
        schema_view.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
    path(
        r"redoc/", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"
    ),
    path("v1/", include(router.urls)),
    path("v1/health_check/", health_check),
    # paths to override email confirmation
    re_path(
        r"^v1/dj-rest-auth/registration/account-confirm-email/(?P<key>[\s\d\w().+-_',:&]+)/$",
        ConfirmEmailView.as_view(),
        name="account_confirm_email",
    ),
    re_path(
        r"^v1/registration_sent/$",
        EmptyView,
        name="account_email_verification_sent",
    ),
    path("v1/dj-rest-auth/", include("dj_rest_auth.urls")),
    path("v1/dj-rest-auth/registration/", include("dj_rest_auth.registration.urls")),
    path("v1/admin/", admin.site.urls),
    path("v1/api-auth/", include("rest_framework.urls", namespace="rest_framework")),
]
