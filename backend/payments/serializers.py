"""
Serialzers for the payments app.
"""
from rest_framework import viewsets, serializers
from payments.models import SubscriptionPlan


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    """ Serializer for subscription plan """

    class Meta:
        """ """

        model = SubscriptionPlan
        fields = (
            "id",
            "user",
            "end_date",
            "start_date",
            "plan",
        )
