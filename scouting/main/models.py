from django.db import models

YEARS = [("2024", "2024")]

# Stores the fields needed for scouting each season, in JSON
class SeasonFields(models.Model):
    year = models.IntegerField(choices=YEARS)
    data = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return self.year

    class Meta:
        verbose_name_plural = "Season Fields"

class Data(models.Model):
    year = models.IntegerField(choices=YEARS)
    event = models.CharField(max_length=999)
    event_code = models.CharField(max_length=99)
    data = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"Data from {self.event} in {self.year}"

    class Meta:
        verbose_name_plural = "Data"