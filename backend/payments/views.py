"""
Simple Django module for payments views.
"""
import json
from datetime import date
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from rest_framework.status import HTTP_400_BAD_REQUEST
import stripe
import logging
from rest_framework.decorators import action, permission_classes, authentication_classes
from dj_rest_auth.jwt_auth import JWTCookieAuthentication
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from payments.models import SubscriptionPlan, User, SubscriptionPlanChoices
from rest_framework import viewsets, serializers
from rest_framework.response import Response
from backend.settings import is_in_dev


LOGGER = logging.getLogger(__name__)

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


def log_and_return_error(error_message, exception=False):
    if exception:
        LOGGER.exception(error_message)
    else:
        LOGGER.error(error_message)
    return JsonResponse(
        {"error": {"message": error_message}}, staus=HTTP_400_BAD_REQUEST
    )


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = (
            "user",
            "end_date",
            "start_date",
            "plan",
        )


@csrf_exempt
@api_view(http_method_names=["POST"])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTCookieAuthentication])
def create_checkout_session(request):

    try:
        data = json.loads(request.body)
    except json.decoder.JSONDecodeError as error:
        return log_and_return_error(str(error), exception=True)

    try:
        # See https://stripe.com/docs/api/checkout/sessions/create
        # for additional parameters to pass.
        # {CHECKOUT_SESSION_ID} is a string literal; do not change it!
        # the actual Session ID is returned in the query parameter when your customer
        # is redirected to the success page.
        checkout_session = stripe.checkout.Session.create(
            success_url=settings.FRONTEND_REDIRECT_URL
            + "pricing/success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=settings.FRONTEND_REDIRECT_URL + "pricing",
            payment_method_types=["card"],
            customer_email=request.user.email,
            client_reference_id=request.user.id,
            mode="subscription",
            line_items=[
                {
                    "price": data.get("price_id", ""),
                    # For metered billing, do not pass quantity
                    "quantity": 1,
                }
            ],
        )
        return JsonResponse({"session_id": checkout_session["id"]})
    except BaseException as error:
        return log_and_return_error(str(error))


@csrf_exempt
@api_view(http_method_names=["POST"])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTCookieAuthentication])
def get_checkout_session(request):
    try:
        data = json.loads(request.body)
    except json.decoder.JSONDecodeError as error:
        return log_and_return_error(str(error))

    session_id = data.get("session_id")
    checkout_session = stripe.checkout.Session.retrieve(session_id)
    LOGGER.warning(checkout_session)
    return JsonResponse(checkout_session)


@csrf_exempt
@api_view(http_method_names=["POST"])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTCookieAuthentication])
def get_customer_portal(request):
    try:
        data = json.loads(request.body)
    except json.decoder.JSONDecodeError as error:
        return log_and_return_error(str(error), exception=True)

    # For demonstration purposes, we're using the Checkout session to retrieve the customer ID.
    # Typically this is stored alongside the authenticated user in your database.
    checkout_session_id = data["session_id"]
    checkout_session = stripe.checkout.Session.retrieve(checkout_session_id)

    # This is the URL to which the customer will be redirected after they are
    # done managing their billing with the portal.
    return_url = settings.FRONTEND_REDIRECT_URL

    session = stripe.billing_portal.Session.create(
        customer=checkout_session.customer, return_url=return_url
    )
    return JsonResponse({"url": session.url})


@csrf_exempt
@api_view(http_method_names=["POST"])
@permission_classes([])
@authentication_classes([])
def payment_webhook(request):
    try:
        data = json.loads(request.body)
    except json.decoder.JSONDecodeError as error:
        return log_and_return_error(str(error), exception=True)

    event_type = data.get("type")

    if event_type == "invoice.paid":
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

        customer_email = (
            data.get("data", {}).get("object", {}).get("customer_email", "")
        )
        if customer_email == "":
            error = "Customer email was not found for event {}".format(
                data.get("id", "")
            )
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
            serializer = SubscriptionPlanSerializer(data=plan)
            # we don't need to validate this, just serialize
            return Response(serializer.initial_data)
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
            serializer = SubscriptionPlanSerializer(data=plan)
            # we don't need to validate this, just serialize
            return Response(serializer.initial_data)

    return JsonResponse({})


class SubscriptionPlanViewSet(viewsets.ModelViewSet):
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer
    authentication_classes = [JWTCookieAuthentication]

    def list(self, request, *args, **kwargs):
        plans = SubscriptionPlan.objects.filter(user=request.user.id, active=True)
        serializer = SubscriptionPlanSerializer(plans, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk, *args, **kwargs):
        plan = get_object_or_404(SubscriptionPlan, pk=pk, user=request.user.id)
        serializer = SubscriptionPlanSerializer(plan)
        return Response(serializer.data)

    def destroy(self, request, pk=None):
        plan = get_object_or_404(SubscriptionPlan, pk=pk, user=request.user.id)
        result = stripe.Subscription.delete(plan.stripe_sub_id)
        new_plan_status = result.get("status", "")
        if new_plan_status != "canceled":
            return log_and_return_error(
                "Expected subscription status to be canceled. Got {}".format(
                    new_plan_status
                )
            )
        plan.delete()
        serializer = SubscriptionPlanSerializer(plan)
        return Response(serializer.data)
