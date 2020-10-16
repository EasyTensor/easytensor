from rest_framework import status
from rest_framework.response import Response

def ErrorResponse(msg: str, status_code=status.HTTP_400_BAD_REQUEST):
    return Response(
        {
            "message": msg,
        },
        status=status_code
    )