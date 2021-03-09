from pprint import pprint
import logging
from django import views
from django.http.response import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action, permission_classes
from uploads.models import (
    ModelUpload,
    Model,
    QueryAccessToken,
    Tag,
    user_has_model_access,
    User,
    Team,
)
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


def get_access_forbidden_response(msg="You do not have access to this model."):
    return Response({"msg": msg}, status=HTTP_403_FORBIDDEN)


class ModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Model
        fields = (
            "owner",
            "name",
            "address",
            "size",
            "scale",
            "id",
            "deployed",
            "framework",
            "public",
            "tags",
            "description",
        )


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

    @permission_classes([JWTCookieAuthentication])
    def create(self, request):

        data = request.data
        if "owner" in data:
            try:
                maybe_user = User.objects.get(pk=data["owner"])
                maybe_team = Team.objects.get(pk=data["owner"])
            except (ValueError, User.DoesNotExist, Team.DoesNotExist):
                return get_access_forbidden_response("Passed owner is illegal.")
            if not any(maybe_team, maybe_user):
                return get_access_forbidden_response("Passed owner is illegal.")
        else:
            data["owner"] = request.user.id
        serializer = ModelSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
        else:
            return ErrorResponse(msg="Can not create Model", errors=serializer.errors)
        return Response(serializer.data)

    @permission_classes([JWTCookieAuthentication])
    @action(methods=["delete"], detail=False)
    def delete(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response(status=HTTP_403_FORBIDDEN)
        Model.objects.all().delete()
        return Response()

    def list(self, request, *args, **kwargs):
        models = Model.objects.all()

        # pprint(request.query_params.get("public"))
        # pprint(type(request.query_params.get("public")))
        is_public = request.query_params.get("public")
        tags = request.query_params.get("tags")
        owner = request.query_params.get("owner")

        if is_public is not None and is_public == "true":
            models = models.filter(public=True)
        if tags is not None:
            tag_models = Tag.objects.filter(name__in=[tags.split(",")])
            models = models.filter(tags=tag_models)

        if owner is not None:
            if request.user.is_authenticated() and request.user == owner:
                models = models.filter(owner=owner)
            else:
                return get_access_forbidden_response()
        if request.user.is_staff:
            models = Model.objects.all()
        else:
            models = models.filter(owner=request.user.id)

        serializer = ModelSerializer(models, many=True)
        return Response(serializer.data)

    @permission_classes([JWTCookieAuthentication])
    def update(self, request, pk=None, *args, **kwargs):
        model = get_object_or_404(Model, pk=pk, owner=request.user.id)

        serializer = ModelSerializer(model, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk, *args, **kwargs):
        model = get_object_or_404(Model, pk=pk)
        if not model.public and (
            not request.user.is_authenticated()
            or not user_has_model_access(request.user, model)
        ):
            return get_access_forbidden_response()

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
