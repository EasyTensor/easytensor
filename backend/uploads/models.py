from django.db import models
from django.contrib.auth import get_user_model
import uuid
from django.contrib.auth import get_user_model

User = get_user_model()

class Model(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=128, blank=False, null=False)    
    address = models.CharField(max_length=128, blank=False, null=False)
    size = models.IntegerField(blank=True, null=False)
    scale = models.IntegerField(default=1, blank=False, null=False)
    deployed = models.BooleanField(default=True, blank=False, null=False)
    owner = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)

class Team(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=128, blank=False, null=False)
    users = models.ManyToManyField(get_user_model())
    models = models.ManyToManyField(Model)
    

# TODO: if this is not used soon, delete it
class ModelUpload(models.Model):
    original_name = models.CharField(max_length=64, blank=False, null=False)
    upload_name = models.CharField(max_length=128, blank=False, null=False)

class QueryAccessToken(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    model = models.ForeignKey(Model, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    udpated_at = models.DateTimeField(auto_now=True)
