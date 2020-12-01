from pprint import pprint
from django import views
from django.http.response import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
from uploads.models import ModelUpload, Model, QueryAccessToken
from rest_framework import viewsets, serializers
from rest_framework.response import Response
from rest_framework.status import HTTP_403_FORBIDDEN, HTTP_400_BAD_REQUEST
from dj_rest_auth.jwt_auth import JWTCookieAuthentication
from uploads.errors import ErrorResponse
from uploads.google_signing_helpers import (
    generate_upload_signed_url_v4,
    generate_download_signed_url_v4,
)

BUCKET_NAME = "easytensor-model-uploads"


def EmptyView():
    return Response(status=200)


class ModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Model
        fields = ["owner", "name", "address", "size", "scale", "id", "deployed", "framework"]


class QueryAccessTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = QueryAccessToken
        fields = ["model", "id"]

class ModelUploadViewSet(viewsets.ModelViewSet):
    queryset = ModelUpload.objects.all()
    authentication_classes = [JWTCookieAuthentication]

    def create(self, request):
        if "filename" not in request.data:
            return ErrorResponse("filename must be provided")
        if "contentType" not in request.data:
            return ErrorResponse("contentType must be provided")
        url = generate_upload_signed_url_v4(BUCKET_NAME, request.data["filename"])
        return Response({"url": url, "method": "PUT", "fields": []})

    def retrieve(self, request, pk=None, *args, **kwargs):
        if pk is None:
            return ErrorResponse("You must indicate what file you want to downlaod")
        # check access if not admin.
        if not request.user.is_staff:
            _ = get_object_or_404(Model, address=pk, owner=request.user.id)

        url = generate_download_signed_url_v4(BUCKET_NAME, pk)
        return Response({"url": url, "filename": pk})


class ModelViewSet(viewsets.ModelViewSet):
    queryset = Model.objects.all()
    serializer_class = ModelSerializer
    authentication_classes = [JWTCookieAuthentication]

    def create(self, request):

        data = request.data
        if "owner" not in data:
            data["owner"] = request.user.id
        serializer = ModelSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
        else:
            return ErrorResponse(msg="Can not create Model", errors=serializer.errors)
        return Response(serializer.data)

    @action(methods=["delete"], detail=False)
    def delete(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response(status=HTTP_403_FORBIDDEN)
        Model.objects.all().delete()
        return Response()

    def list(self, request, *args, **kwargs):
        if request.user.is_staff:
            models = Model.objects.all()
        else:    
            models = Model.objects.filter(owner=request.user.id)
        serializer = ModelSerializer(models, many=True)
        return Response(serializer.data)

    def update(self, request, pk=None, *args, **kwargs):
        model = get_object_or_404(Model, pk=pk, owner=request.user.id)
        
        pprint(request.data)
        serializer = ModelSerializer(model, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk, *args, **kwargs):
        model = get_object_or_404(Model, pk=pk, owner=request.user.id)
        
        serializer = ModelSerializer(model)
        return Response(serializer.data)


class QueryAccessTokenViewSet(viewsets.ModelViewSet):
    queryset = QueryAccessToken.objects.all()
    serializer_class = QueryAccessTokenSerializer
    authentication_classes = [JWTCookieAuthentication]

    def create(self, request):
        serializer = QueryAccessTokenSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
        else:
            return ErrorResponse(msg="Can not create token", errors=serializer.errors)
        return Response(serializer.data)

    def list(self, request, *args, **kwargs):
        if request.user.is_staff:
            tokens = QueryAccessToken.objects.all()
        else:
            tokens = QueryAccessToken.objects.filter(model__owner=request.user.id)
        serializer = QueryAccessTokenSerializer(tokens, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk, *args, **kwargs):
        token = get_object_or_404(QueryAccessToken, pk=pk, model__owner=request.user.id)
        
        serializer = QueryAccessTokenSerializer(token)
        return Response(serializer.data)

    def destroy(self, request, pk=None):
        token = get_object_or_404(QueryAccessToken, pk=pk, model__owner=request.user.id)
        token.delete()
        serializer = QueryAccessTokenSerializer(token)
        return Response(serializer.data)


def health_check(request):
    return JsonResponse({"status": "ok"})
