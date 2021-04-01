"""
Simple module for util functions.
"""
import logging
from django.http import JsonResponse
from rest_framework.status import HTTP_400_BAD_REQUEST

LOGGER = logging.getLogger(__name__)


def log_and_return_error(error_message, exception=False):
    """
    Logs the error message passed and returns a JSON response that includes
    the error message.
    """
    if exception:
        LOGGER.exception(error_message)
    else:
        LOGGER.error(error_message)
    return JsonResponse(
        {"error": {"message": error_message}}, staus=HTTP_400_BAD_REQUEST
    )
