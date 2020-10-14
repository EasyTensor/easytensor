from django.shortcuts import render
from uploads.models import ModelUpload
from rest_framework import viewsets
from rest_framework.response import Response

# Create your views here.
# ViewSets define the view behavior.
class ModelUploadViewSet(viewsets.ModelViewSet):
    queryset = ModelUpload.objects.all()
    authentication_classes = []
    permission_classes = []

    def create(self, request):
        print("got one!")
        print(request)
        return Response({})
