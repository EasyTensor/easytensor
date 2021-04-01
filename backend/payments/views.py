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
from payments.util import log_and_return_error
from payments.serializers import SubscriptionPlanSerializer
from payments.webhook_handlers import handle_invoice_paid


LOGGER = logging.getLogger(__name__)


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
    LOGGER.warning(data)

    event_type = data.get("type")

    if event_type == "invoice.paid":
        return handle_invoice_paid(data)
    else:
        # TODO: implement invoice not paid
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
