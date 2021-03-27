from allauth.account.models import EmailConfirmationHMAC, EmailConfirmation
from django.shortcuts import redirect
from django.http import Http404
from django.views import View
from django.conf import settings


class ConfirmEmailView(View):
    def get(self, *args, **kwargs):
        return self.post(*args, **kwargs)

    def post(self, *args, **kwargs):
        try:
            self.object = confirmation = self.get_object()
        except Http404:
            return redirect(settings.FRONTEND_REDIRECT_URL + "registration/failure/")
        confirmation.confirm(self.request)
        return redirect(settings.FRONTEND_REDIRECT_URL + "registration/success/")

    def get_object(self, queryset=None):
        key = self.kwargs["key"]
        emailconfirmation = EmailConfirmationHMAC.from_key(key)
        if not emailconfirmation:
            if queryset is None:
                queryset = self.get_queryset()
            try:
                emailconfirmation = queryset.get(key=key.lower())
            except EmailConfirmation.DoesNotExist:
                raise Http404()
        return emailconfirmation

    def get_queryset(self):
        qs = EmailConfirmation.objects.all_valid()
        qs = qs.select_related("email_address__user")
        return qs
