#! /local/usr/env python
# really stupid script to setup one-off starting data
from allauth.account.models import EmailAddress
from uploads.models import User

controller = User.objects.get(username="controller")
email_address, _ = EmailAddress.objects.get_or_create(
    email=controller.email, user=controller, user_id=controller.id
)
email_address.verified = True
email_address.save()
