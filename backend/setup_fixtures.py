#! /local/usr/env python
# really stupid script to setup one-off starting data
from allauth.account.models import EmailAddress
EmailAddress.objects.filter(email="controller@easytensor.com").update(verified=True)
