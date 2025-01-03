from django.db import models


class VerificationCode(models.Model):
    code = models.CharField(max_length=6)
    created = models.DateTimeField(null=True, blank=True)
    expires = models.DateTimeField(null=True, blank=True)
    user_uuid = models.UUIDField(null=True, blank=True)
