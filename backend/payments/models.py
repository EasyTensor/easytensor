from django.db import models
from django.contrib.auth import get_user_model
import uuid
from enum import Enum

# Create your models here.

User = get_user_model()


class SubscriptionPlanChoices(Enum):
    FREE = "FREE"
    DEVELOPMENT = "DEVELOPMENT"
    PRODUCTION = "PRODUCTION"


class SubscriptionPlan(models.Model):
    PLAN_CHOICES = [
        (SubscriptionPlanChoices.FREE.value, SubscriptionPlanChoices.FREE.value),
        (
            SubscriptionPlanChoices.DEVELOPMENT.value,
            SubscriptionPlanChoices.DEVELOPMENT.value,
        ),
        (
            SubscriptionPlanChoices.PRODUCTION.value,
            SubscriptionPlanChoices.PRODUCTION.value,
        ),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    end_date = models.DateField(null=False, blank=False)
    start_date = models.DateField(null=False, blank=False)
    plan = models.CharField(
        max_length=64, choices=PLAN_CHOICES, blank=False, null=False
    )
    active = models.BooleanField(blank=False, null=False)
    stripe_sub_id = models.CharField(max_length=128, null=False, blank=False)
