from django.db import models
import uuid

class Model(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=128, blank=False, null=False)    
    address = models.CharField(max_length=128, blank=False, null=False)
    size = models.IntegerField(blank=True, null=False)
    scale = models.IntegerField(default=1, blank=False, null=False)
    deployed = models.BooleanField(default=True, blank=False, null=False)

class ModelUpload(models.Model):
    original_name = models.CharField(max_length=64, blank=False, null=False)
    upload_name = models.CharField(max_length=128, blank=False, null=False)
