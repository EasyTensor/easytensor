from django import views
from django.http.response import JsonResponse
from uploads.models import ModelUpload, Model
from rest_framework import viewsets, serializers
from rest_framework.response import Response
from uploads.errors import ErrorResponse
from google.cloud.storage.client import Client
from google.cloud.storage.bucket import Bucket
from uploads.google_signing_helpers import generate_upload_signed_url_v4

BUCKET_NAME = "easytensor-model-uploads"


class ModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Model
        fields = ["name", "address", "size", "scale"]


class CommentSerializer(serializers.Serializer):
    email = serializers.EmailField()
    content = serializers.CharField(max_length=200)
    created = serializers.DateTimeField()


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


class ModelViewSet(viewsets.ModelViewSet):
    queryset = Model.objects.all()
    serializer_class = ModelSerializer
    authentication_classes = []
    permission_classes = []

    def create(self, request):
        from pprint import pprint

        pprint(request.data)
        serializer = ModelSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
        else:
            return ErrorResponse(msg="Can not create Model", errors=serializer.errors)
        return Response(serializer.data)


def health_check(request):
    return JsonResponse({"status": "ok"})