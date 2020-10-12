from django.db import models

# Create your models here.
class ModelUpload(models.Model):
    original_name = models.CharField(max_length=64, blank=False, null=False)
    upload_name = models.CharField(max_length=128, blank=False, null=False)


