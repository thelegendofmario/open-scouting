from django.shortcuts import render, HttpResponse
from django.http import JsonResponse
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

def data(request):
    request.session["username"] = request.GET.get("username", "unknown")
    request.session["event_name"] = request.GET.get("event_name", "unknown")
    request.session["event_code"] = request.GET.get("event_code", "unknown")

    context = {
        "SERVER_IP": settings.SERVER_IP,
        "TBA_API_KEY": settings.TBA_API_KEY,
        "username": request.GET.get("username", "unknown"),
        "event_name": request.GET.get("event_name", "unknown"),
        "event_code": request.GET.get("event_code", "unknown")
    }

    return render(request, "data.html", context)

@csrf_exempt
def submit(request):
    if request.method == "POST":
        # TODO: Support year selection
        data = Data(year=2024, event=request.headers["event_name"], event_code=request.headers["event_code"], data=json.loads(request.headers["data"]), created=timezone.now())
        data.save()
        return HttpResponse(request, "Success")
    else:
        return HttpResponse(request, "Request is not a POST request!", status=501)

@csrf_exempt
def get_data(request):
    if request.method == "POST":

        data = Data.objects.filter(year=2024, event=request.session["event_name"], event_code=request.session["event_code"])

        data_json = []
        for item in data:
            item_data = {
                "created": item.created.isoformat(),
                "data": item.data
            }
            data_json.append(item_data)

        all_names = []
        for entry in data:
            for item in entry.data:
                if item['name'] not in all_names:
                    all_names.append(item['name'])

        return JsonResponse({"data": data_json, "data_headers": list(all_names)}, safe=False)
    else:
        return HttpResponse("Request is not a POST request!", status=501)

