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
    request.session["username"] = request.GET.get("username", "unknown")
    request.session["event_name"] = request.GET.get("event_name", "unknown")
    request.session["event_code"] = request.GET.get("event_code", "unknown")

    context = {
        "SERVER_IP": settings.SERVER_IP,
        "TBA_API_KEY": settings.TBA_API_KEY,
        "season_fields": json.dumps(season_fields.crescendo),
        "username": request.GET.get("username", "unknown"),
        "event_name": request.GET.get("event_name", "unknown"),
        "event_code": request.GET.get("event_code", "unknown")
    }

    return render(request, "contribute.html", context)