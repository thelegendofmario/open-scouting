from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    display_name = models.CharField(max_length=999)
    team_number = models.CharField(max_length=6)


class VerificationCode(models.Model):
    code = models.CharField(max_length=6)
    created = models.DateTimeField(null=True, blank=True)
    expires = models.DateTimeField(null=True, blank=True)
    user_uuid = models.UUIDField(null=True, blank=True)
