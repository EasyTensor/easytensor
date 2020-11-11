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

from uploads.views import (
    ModelUploadViewSet,
    ModelViewSet,
    health_check,
    QueryAccessTokenViewSet,
    EmptyView
)

from django.db import models

# Routers provide an easy way of automatically determining the URL conf.
router = routers.DefaultRouter()
router.register(r"model-uploads", ModelUploadViewSet)
router.register(r"models", ModelViewSet)
router.register(r"query-access-token", QueryAccessTokenViewSet)


urlpatterns = [
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
