from django.shortcuts import render, HttpResponse
from django.conf import settings
from . import season_fields

def index(request):
    context = {
        "TBA_API_KEY": settings.TBA_API_KEY
    }

    return render(request, "index.html", context)

def contribute(request):
    context = {
        "TBA_API_KEY": settings.TBA_API_KEY,
        "season_fields": season_fields.crescendo
    }

    return render(request, "contribute.html", context)