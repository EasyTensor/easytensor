from django.db import models
import uuid

class Model(models.Model):
    model_name = models.CharField(max_length=128, blank=False, null=False)    
    model_address = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

class ModelUpload(models.Model):
    original_name = models.CharField(max_length=64, blank=False, null=False)
    upload_name = models.CharField(max_length=128, blank=False, null=False)


