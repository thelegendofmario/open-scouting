from django.shortcuts import render, HttpResponse
from django.http import JsonResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone

from main.models import Data, Event
from . import season_fields

import json
from datetime import datetime
import uuid

# TODO: This is a duplicate of a similar array in models.py, I don't know if there's a good way to make these into one array
YEARS = ["2024", "2025"]

DATE_FORMAT = "%Y-%m-%d"

def index(request):
    context = {
        "SERVER_IP": settings.SERVER_IP,
        "TBA_API_KEY": settings.TBA_API_KEY,
        "YEARS": json.dumps(YEARS)
    }

    return render(request, "index.html", context)

def contribute(request):
    request.session["username"] = request.GET.get("username", "unknown")
    request.session["event_name"] = request.GET.get("event_name", "unknown")
    request.session["event_code"] = request.GET.get("event_code", "unknown")
    request.session["custom"] = request.GET.get("custom", "unknown")

    context = {
        "SERVER_IP": settings.SERVER_IP,
        "TBA_API_KEY": settings.TBA_API_KEY,
        "season_fields": json.dumps(season_fields.crescendo),
        "username": request.GET.get("username", "unknown"),
        "event_name": request.GET.get("event_name", "unknown"),
        "event_code": request.GET.get("event_code", "unknown"),
        "custom": request.GET.get("custom", "unknown")
    }

    return render(request, "contribute.html", context)

def data(request):
    request.session["username"] = request.GET.get("username", "unknown")
    request.session["event_name"] = request.GET.get("event_name", "unknown")
    request.session["event_code"] = request.GET.get("event_code", "unknown")
    request.session["custom"] = request.GET.get("custom", "unknown")

    context = {
        "SERVER_IP": settings.SERVER_IP,
        "TBA_API_KEY": settings.TBA_API_KEY,
        "username": request.GET.get("username", "unknown"),
        "event_name": request.GET.get("event_name", "unknown"),
        "event_code": request.GET.get("event_code", "unknown"),
        "custom": request.GET.get("custom", "unknown")
    }

    return render(request, "data.html", context)

@csrf_exempt
def submit(request):
    print(request.GET.get("event_name"))
    if request.method == "POST":
        if request.headers["custom"] == "true":
            events = Event.objects.filter(name=request.headers["event_name"], event_code=request.headers["event_code"], custom=True)

            # TODO: Support year selection
            data = Data(year=2024, event=request.headers["event_name"], event_code=request.headers["event_code"], data=json.loads(request.headers["data"]), created=timezone.now(), event_model=events[0])
            data.save()
            return HttpResponse(request, "Success")
            
        else:
            events = Event.objects.filter(event_code=request.headers["event_code"])
            if len(events) == 0:
                event = Event(year=2024, name=request.headers["event_name"], event_code=request.headers["event_code"], created=timezone.now())
                event.save()
            else:
                event = events[0]

            # TODO: Support year selection
            data = Data(year=2024, event=request.headers["event_name"], event_code=request.headers["event_code"], data=json.loads(request.headers["data"]), created=timezone.now(), event_model=event)
            data.save()
            return HttpResponse(request, "Success")
    else:
        return HttpResponse(request, "Request is not a POST request!", status=501)

@csrf_exempt
def get_data(request):
    if request.method == "POST":
        if request.headers["custom"] == "true":
            events = Event.objects.filter(name=request.headers["event_name"], event_code=request.headers["event_code"], custom=True)
            
        else:
            events = Event.objects.filter(event_code=request.headers["event_code"])
            if len(events) == 0:
                event = Event(year=2024, name=request.headers["event_name"], event_code=request.headers["event_code"], custom=False, created=timezone.now())
                event.save()
            else:
                event = events[0]

        # TODO: Support year selection
        data = Data.objects.filter(year=2024, event=request.headers["event_name"], event_code=request.headers["event_code"], event_model=events[0])

        print(data)

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
        

@csrf_exempt
def get_custom_events(request):
    if request.method == "POST":
        data = []

        events = Event.objects.filter(year=request.headers["year"], custom=True)

        for event in events:
            event_data = {
                "custom": True,
                "name": event.name,
                "year": event.year,
                "start_date": event.custom_data["date_begins"],
                "end_date": event.custom_data["date_ends"],
                "location": event.custom_data["location"],
                "type": event.custom_data.get("type", ""),
                "event_code": event.event_code
            }
            data.append(event_data)

        return JsonResponse(json.dumps(data), safe=False)
        
    else:
        return HttpResponse("Request is not a POST request!", status=501)

@csrf_exempt
def create_custom_event(request):
    if request.method == "POST":
        UUID = uuid.uuid4().hex
            
        data = {
            "name": request.headers["name"],
            "year": request.headers["year"],
            "date_begins": request.headers["date-begins"],
            "date_ends": request.headers["date-ends"],
            "location": request.headers["location"],
            "type": request.headers["type"],
            "event_code": UUID
        }

        event = Event(year=data["year"], name=request.headers["name"], created=timezone.now(), event_code=UUID, custom=True, custom_data=data)
        event.save()
        return HttpResponse(request, "Success")
    else:
        return HttpResponse(request, "Request is not a POST request!", status=501)

@csrf_exempt
def get_year_data(request):
    if request.method == "POST":
        print(request.headers["year"])
        events = Event.objects.filter(year=request.headers["year"])

        data = {
            "events": len(events),
        }

        return JsonResponse(json.dumps(data), safe=False)

    else:
        return HttpResponse("Request is not a POST request!", status=501)