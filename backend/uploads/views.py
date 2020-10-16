from django.shortcuts import render
from uploads.models import ModelUpload, Model
from rest_framework import viewsets
from rest_framework.response import Response
from uploads.errors import ErrorResponse
from google.cloud.storage.client import Client
from google.cloud.storage.bucket import Bucket
from uploads.google_signing_helpers import generate_upload_signed_url_v4

BUCKET_NAME = "easytensor-model-uploads"
# Create your views here.
# ViewSets define the view behavior.
class ModelUploadViewSet(viewsets.ModelViewSet):
    queryset = ModelUpload.objects.all()
    authentication_classes = []
    permission_classes = []

    def create(self, request):
        print("hello?")
        if "filename" not in request.data:
            return ErrorResponse("filename must be provided")
        if "contentType" not in request.data:
            return ErrorResponse("contentType must be provided")
        url = generate_upload_signed_url_v4(BUCKET_NAME, request.data["filename"])
        return Response({"url": url, "method": "PUT", "fields": []})
