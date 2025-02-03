from django.db import models
from django.conf import settings

YEARS = [(2024, "2024"), (2025, "2025")]


# Stores individual contributed data for each year and event
class Data(models.Model):
    uuid = models.UUIDField(null=True, blank=True)
    year = models.IntegerField(choices=YEARS)
    event = models.CharField(max_length=999)
    event_code = models.CharField(max_length=99)
    data = models.JSONField(default=dict, blank=True)
    created = models.DateTimeField(null=True, blank=True)
    event_model = models.ForeignKey(
        "Event", on_delete=models.SET_NULL, null=True, blank=True
    )
    user_created = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    username_created = models.CharField(max_length=999, blank=True)
    team_number_created = models.CharField(max_length=6, blank=True)
    account = models.BooleanField(default=False)

    def __str__(self):
        return f"Data from {self.event} in {str(self.year)}"

    class Meta:
        verbose_name_plural = "Data"


# Represents an event in a year
class Event(models.Model):
    year = models.IntegerField(choices=YEARS)
    name = models.CharField(max_length=999)
    event_code = models.CharField(max_length=99, blank=True)
    created = models.DateTimeField(null=True, blank=True)
    custom = models.BooleanField(default=False)
    custom_data = models.JSONField(default=dict, blank=True)
    user_created = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )

    def __str__(self):
        if self.custom:
            return f"{self.name} in {str(self.year)} (Custom event)"
        else:
            return f"{self.name} in {str(self.year)}"


# Represents a team's pit at an event
class Pit(models.Model):
    team_number = models.CharField(max_length=6)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    created = models.DateTimeField(null=True, blank=True)
    data = models.JSONField(default=dict)

    def __str__(self):
        return f"{self.team_number}'s pit at {self.event.name}"
