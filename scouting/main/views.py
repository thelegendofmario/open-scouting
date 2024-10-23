from django.shortcuts import render, HttpResponse
from django.conf import settings
from . import season_fields

import json

def index(request):
    context = {
        "SERVER_IP": settings.SERVER_IP,
        "TBA_API_KEY": settings.TBA_API_KEY
    }

    return render(request, "index.html", context)

def contribute(request):
    context = {
        "SERVER_IP": settings.SERVER_IP,
        "TBA_API_KEY": settings.TBA_API_KEY,
        "season_fields": json.dumps(season_fields.crescendo),
        "event": "unknown",
        "username": "unknown"
    }

    return render(request, "contribute.html", context)