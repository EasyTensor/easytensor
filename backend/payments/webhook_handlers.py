"""
A module that implements the handlers for stripe payment webhooks.
The currently handled events are:
- invoice.paid
- checkout.session.completed
- invoice.payment_failed
"""
from datetime import date
from rest_framework.response import Response
from backend.settings import is_in_dev
from payments.util import log_and_return_error
from payments.models import SubscriptionPlanChoices, SubscriptionPlan, User
from payments.serializers import SubscriptionPlanSerializer
import stripe

PRODUCT_MAPPINGS = (
    {
        # Testing products
        "prod_JACn1iLFiBbZS7": SubscriptionPlanChoices.DEVELOPMENT.value,
        "prod_JACt22htjCEUKC": SubscriptionPlanChoices.PRODUCTION.value,
    }
    if is_in_dev()
    else {
        # Live products
        "prod_JDe3EXv3pWDeh0": SubscriptionPlanChoices.DEVELOPMENT.value,
        "prod_JDe3Mu36IQ3HMk": SubscriptionPlanChoices.PRODUCTION.value,
    }
)


def handle_invoice_paid(data):
    end_date = (
        data.get("data", {})
        .get("object", {})
        .get("lines", [{}])
        .get("data", [{}])[0]
        .get("period", {})
        .get("end", "")
    )
    start_date = (
        data.get("data", {})
        .get("object", {})
        .get("lines", [{}])
        .get("data", [{}])[0]
        .get("period", {})
        .get("start", "")
    )
    end_date = date.fromtimestamp(end_date)
    start_date = date.fromtimestamp(start_date)

    product_id = (
        data.get("data", {})
        .get("object", {})
        .get("lines", [{}])
        .get("data", [{}])[0]
        .get("plan", {})
        .get("product", "")
    )
    if product_id not in PRODUCT_MAPPINGS:
        error = "Product {} is not in the product map {}".format(
            product_id, str(PRODUCT_MAPPINGS)
        )
        return log_and_return_error(error)
    product = PRODUCT_MAPPINGS[product_id]

    subscription_id = data.get("data", {}).get("object", {}).get("subscription", "")

    customer_email = data.get("data", {}).get("object", {}).get("customer_email", "")
    if customer_email == "":
        error = "Customer email was not found for event {}".format(data.get("id", ""))
        return log_and_return_error(error)
    user = User.objects.filter(email=customer_email)
    if len(user) < 1:
        error = "No user found for email {}".format(customer_email)
        return log_and_return_error(error)
    user = user.first()
    plan = SubscriptionPlan.objects.filter(
        user=user, active=True, plan=product, stripe_sub_id=subscription_id
    )

    if len(plan) > 1:
        error = "Expected to find one plan for user {}. Found {} instead".format(
            customer_email, len(plan)
        )
        return log_and_return_error(error)
    elif len(plan) == 1:
        # extend existing plan
        plan = plan.first()
        plan.end_date = end_date
        plan.save()
        serializer = SubscriptionPlanSerializer(plan)
        # we don't need to validate this, just serialize
        return Response(serializer.data)
    else:
        # Create a new one if none exists
        plan = SubscriptionPlan(
            user=user,
            start_date=start_date,
            end_date=end_date,
            plan=PRODUCT_MAPPINGS[product_id],
            active=True,
            stripe_sub_id=subscription_id,
        )
        plan.save()
        serializer = SubscriptionPlanSerializer(plan)
        # we don't need to validate this, just serialize
        return Response(serializer.data)
