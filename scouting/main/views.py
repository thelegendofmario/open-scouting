from django.shortcuts import render, HttpResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone

from main.models import Data
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

@csrf_exempt
def submit(request):
    if request.method == "POST":
        # TODO: Support year selection
        data = Data(year=2024, event=request.headers["event_name"], event_code=request.headers["event_code"], data=json.loads(request.headers["data"]), created=timezone.now())
        data.save()
        return HttpResponse(request, "Success")
    else:
        return HttpResponse(request, "Request is not a POST request!", status=501)