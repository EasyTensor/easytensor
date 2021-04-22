from django.conf import settings
from backend.settings import is_in_dev
from pymongo import MongoClient


def get_client():
    # TODO: implement singleton
    if is_in_dev():
        return MongoClient(
            host=settings.DOCUMENT_STORE_HOST,
            port=settings.DOCUMENT_STORE_PORT,
            username=settings.DOCUMENT_STORE_USERNAME,
            password=settings.DOCUMENT_STORE_PASSWORD,
        )
    # ugly solution because MongoDB Atlas only seems to work when specifying
    # the full URL.
    return MongoClient(
        "mongodb+srv://{}:{}@{}/?retryWrites=true&w=majority".format(
            settings.DOCUMENT_STORE_USERNAME,
            settings.DOCUMENT_STORE_PASSWORD,
            settings.DOCUMENT_STORE_HOST,
        )
    )
