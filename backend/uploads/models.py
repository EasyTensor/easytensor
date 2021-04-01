from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()
FRAMEWORK_CHOICES = [
    ("TF", "Tensorflow"),
    ("PT", "PyTorch"),
]
DEFAULT_FRAMEWORK_CHOICE = "TF"  # Tensorflow


class Tag(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=128, blank=False, null=False)


class Model(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=128, blank=False, null=False)
    address = models.CharField(max_length=128, blank=False, null=False)
    size = models.IntegerField(blank=True, null=False)
    scale = models.IntegerField(default=1, blank=False, null=False)
    deployed = models.BooleanField(default=True, blank=False, null=False)
    owner = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    framework = models.CharField(
        max_length=2, choices=FRAMEWORK_CHOICES, default=DEFAULT_FRAMEWORK_CHOICE
    )
    public = models.BooleanField(blank=False, null=False, default=False)
    tags = models.ManyToManyField(Tag, blank=True, null=False)
    description = models.CharField(max_length=256, blank=True, null=False, default="")


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


def user_has_model_access(user: User, model: Model):
    return any(
        model.owner == user, model in Team.objects.filter(users__contain=user).models
    )
