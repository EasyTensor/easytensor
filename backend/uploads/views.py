from django import views
from django.http.response import JsonResponse
from rest_framework.decorators import action
from uploads.models import ModelUpload, Model
from rest_framework import viewsets, serializers
from rest_framework.response import Response
from uploads.errors import ErrorResponse
from uploads.google_signing_helpers import (
    generate_upload_signed_url_v4,
    generate_download_signed_url_v4,
)

BUCKET_NAME = "easytensor-model-uploads"


class ModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Model
        fields = ["name", "address", "size", "scale", "id", "deployed"]


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

    def retrieve(self, request, pk=None, *args, **kwargs):
        print("pk:", pk)
        if pk is None:
            return ErrorResponse("You must indicate what file you want to downlaod")
        # todo: check access before allowing the filename to be downloaded
        url = generate_download_signed_url_v4(BUCKET_NAME, pk)
        return Response({"url": url, "filename": pk})


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

    @action(methods=["delete"], detail=False)
    def delete(self, request, *args, **kwargs):
        Model.objects.all().delete()
        return Response({})


def health_check(request):
    return JsonResponse({"status": "ok"})