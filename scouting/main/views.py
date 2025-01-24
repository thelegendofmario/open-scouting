from django.shortcuts import render, HttpResponse
from django.http import JsonResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone

from main.models import Data, Event
from . import season_fields
from . import demo_data

import json
from datetime import datetime
import uuid
from urllib.parse import unquote

# TODO: This is a duplicate of a similar array in models.py, I don't know if there's a good way to make these into one array
YEARS = ["2024", "2025"]

DATE_FORMAT = "%Y-%m-%d"


# TODO: Move to respective .py files instead
def get_season_data_from_year(year):
    if year == "2024":
        return season_fields.crescendo
    elif year == "2025":
        return season_fields.reefscape
    else:
        return None


# TODO: Move to respective .py files instead
def get_demo_data_from_year(year):
    year = str(year)
    if year == "2024":
        return demo_data.crescendo
    elif year == "2025":
        return demo_data.reefscape
    else:
        return None


def decode_json_strings(obj):
    if isinstance(obj, dict):  # If the object is a dictionary
        return {key: decode_json_strings(value) for key, value in obj.items()}
    elif isinstance(obj, list):  # If the object is a list
        return [decode_json_strings(item) for item in obj]
    elif isinstance(obj, str):  # If the object is a string
        return unquote(obj)
    else:  # If it's neither a dictionary, list, nor string, return as is
        return obj


def index(request):
    if request.user.is_authenticated:
        context = {
            "SERVER_IP": settings.SERVER_IP,
            "TBA_API_KEY": settings.TBA_API_KEY,
            "YEARS": json.dumps(YEARS),
            "SERVER_MESSAGE": settings.SERVER_MESSAGE,
            "authenticated": json.dumps(True),
            "username": request.user.username,
            "display_name": request.user.profile.display_name,
            "team_number": request.user.profile.team_number,
        }

        return render(request, "index.html", context)

    else:
        context = {
            "SERVER_IP": settings.SERVER_IP,
            "TBA_API_KEY": settings.TBA_API_KEY,
            "YEARS": json.dumps(YEARS),
            "SERVER_MESSAGE": settings.SERVER_MESSAGE,
            "authenticated": json.dumps(False),
        }

        return render(request, "index.html", context)


def contribute(request):
    request.session["username"] = request.GET.get("username", "unknown")
    request.session["team_number"] = request.GET.get("team_number", "unknown")
    request.session["event_name"] = request.GET.get("event_name", "unknown")
    request.session["event_code"] = request.GET.get("event_code", "unknown")
    request.session["custom"] = request.GET.get("custom", "unknown")
    request.session["year"] = request.GET.get("year", "unknown")
    request.session["demo"] = request.GET.get("demo", "unknown")

    context = {
        "SERVER_IP": settings.SERVER_IP,
        "TBA_API_KEY": settings.TBA_API_KEY,
        "SERVER_MESSAGE": settings.SERVER_MESSAGE,
        "season_fields": json.dumps(
            get_season_data_from_year(request.GET.get("year", "unknown"))
        ),
        "username": request.GET.get("username", "unknown"),
        "team_number": request.GET.get("team_number", "unknown"),
        "event_name": request.GET.get("event_name", "unknown"),
        "event_code": request.GET.get("event_code", "unknown"),
        "custom": request.GET.get("custom", "unknown"),
        "year": request.GET.get("year", "unknown"),
        "demo": request.GET.get("demo", "unknown"),
    }

    return render(request, "contribute.html", context)


def data(request):
    request.session["username"] = request.GET.get("username", "unknown")
    request.session["team_number"] = request.GET.get("team_number", "unknown")
    request.session["event_name"] = request.GET.get("event_name", "unknown")
    request.session["event_code"] = request.GET.get("event_code", "unknown")
    request.session["custom"] = request.GET.get("custom", "unknown")
    request.session["year"] = request.GET.get("year", "unknown")
    request.session["demo"] = request.GET.get("demo", "unknown")

    context = {
        "SERVER_IP": settings.SERVER_IP,
        "TBA_API_KEY": settings.TBA_API_KEY,
        "SERVER_MESSAGE": settings.SERVER_MESSAGE,
        "username": request.GET.get("username", "unknown"),
        "team_number": request.GET.get("team_number", "unknown"),
        "event_name": request.GET.get("event_name", "unknown"),
        "event_code": request.GET.get("event_code", "unknown"),
        "custom": request.GET.get("custom", "unknown"),
        "year": request.GET.get("year", "unknown"),
        "demo": request.GET.get("demo", "unknown"),
    }

    return render(request, "data.html", context)


def service_worker(request):
    sw_path = settings.BASE_DIR / "frontend" / "sw.js"
    return HttpResponse(open(sw_path).read(), content_type="application/javascript")


@csrf_exempt
def submit(request):
    if request.method == "POST":
        if request.headers["custom"] == "true":
            events = Event.objects.filter(
                name=unquote(request.headers["event_name"]),
                event_code=request.headers["event_code"],
                custom=True,
                year=request.headers["year"],
            )

            if len(events) == 0:
                if request.user.is_authenticated:
                    event = Event(
                        name=unquote(request.headers["event_name"]),
                        event_code=request.headers["event_code"],
                        custom=True,
                        year=request.headers["year"],
                        user_created=request.user,
                    )
                else:
                    event = Event(
                        name=unquote(request.headers["event_name"]),
                        event_code=request.headers["event_code"],
                        custom=True,
                        year=request.headers["year"],
                    )

                event.save()

            else:
                event = events[0]

            if request.user.is_authenticated:
                data = Data(
                    uuid=request.headers["uuid"],
                    year=request.headers["year"],
                    event=unquote(request.headers["event_name"]),
                    event_code=request.headers["event_code"],
                    data=json.loads(request.headers["data"]),
                    created=timezone.now(),
                    event_model=event,
                    user_created=request.user,
                    username_created=request.user.username,
                    team_number_created=request.user.profile.team_number,
                    account=True,
                )
                data.save()

            else:
                data = Data(
                    uuid=request.headers["uuid"],
                    year=request.headers["year"],
                    event=unquote(request.headers["event_name"]),
                    event_code=request.headers["event_code"],
                    data=json.loads(request.headers["data"]),
                    created=timezone.now(),
                    event_model=event,
                    username_created=request.session["username"],
                    team_number_created=request.session["team_number"],
                    account=False,
                )
                data.save()

            return HttpResponse(request, "Success")

        else:
            events = Event.objects.filter(
                event_code=request.headers["event_code"], year=request.headers["year"]
            )
            if len(events) == 0:
                if request.user.is_authenticated:
                    event = Event(
                        year=request.headers["year"],
                        name=unquote(request.headers["event_name"]),
                        event_code=request.headers["event_code"],
                        created=timezone.now(),
                        user_created=request.user,
                    )
                    event.save()
                else:
                    event = Event(
                        year=request.headers["year"],
                        name=unquote(request.headers["event_name"]),
                        event_code=request.headers["event_code"],
                        created=timezone.now(),
                    )
                    event.save()
            else:
                event = events[0]

            if request.user.is_authenticated:
                data = Data(
                    uuid=request.headers["uuid"],
                    year=request.headers["year"],
                    event=unquote(request.headers["event_name"]),
                    event_code=request.headers["event_code"],
                    data=json.loads(request.headers["data"]),
                    created=timezone.now(),
                    event_model=event,
                    user_created=request.user,
                    username_created=request.user.username,
                    team_number_created=request.user.profile.team_number,
                    account=True,
                )
                data.save()

            else:
                data = Data(
                    uuid=request.headers["uuid"],
                    year=request.headers["year"],
                    event=unquote(request.headers["event_name"]),
                    event_code=request.headers["event_code"],
                    data=json.loads(request.headers["data"]),
                    created=timezone.now(),
                    event_model=event,
                    username_created=request.session["username"],
                    team_number_created=request.session["team_number"],
                    account=False,
                )
                data.save()

            return HttpResponse(request, "Success")
    else:
        return HttpResponse(request, "Request is not a POST request!", status=501)


@csrf_exempt
def get_data(request):
    if request.method == "POST":
        if request.headers["demo"] == "true":
            data = get_demo_data_from_year(request.headers["year"])

            data_json = []
            for item in data:
                item_data = {"created": "unknown", "data": item}
                data_json.append(item_data)

            all_names = []
            for entry in data:
                for item in entry:
                    if item["name"] not in all_names:
                        all_names.append(item["name"])

            return JsonResponse(
                {"data": data_json, "data_headers": list(all_names), "demo": True},
                safe=False,
            )

        else:
            if request.headers["custom"] == "true":
                events = Event.objects.filter(
                    name=unquote(request.headers["event_name"]),
                    event_code=request.headers["event_code"],
                    custom=True,
                    year=request.headers["year"],
                )

                if len(events) == 0:
                    if request.user.is_authenticated:
                        event = Event(
                            name=unquote(request.headers["event_name"]),
                            event_code=request.headers["event_code"],
                            custom=True,
                            year=request.headers["year"],
                            user_created=request.user,
                        )
                    else:
                        event = Event(
                            name=unquote(request.headers["event_name"]),
                            event_code=request.headers["event_code"],
                            custom=True,
                            year=request.headers["year"],
                        )

                    event.save()

                else:
                    event = events[0]

            else:
                events = Event.objects.filter(
                    event_code=request.headers["event_code"],
                    year=request.headers["year"],
                )
                if len(events) == 0:
                    if request.user.is_authenticated:
                        event = Event(
                            year=request.headers["year"],
                            name=unquote(request.headers["event_name"]),
                            event_code=request.headers["event_code"],
                            custom=False,
                            created=timezone.now(),
                            user_created=request.user,
                        )
                        event.save()
                    else:
                        event = Event(
                            year=request.headers["year"],
                            name=unquote(request.headers["event_name"]),
                            event_code=request.headers["event_code"],
                            custom=False,
                            created=timezone.now(),
                        )
                        event.save()
                else:
                    event = events[0]

            data = Data.objects.filter(
                year=request.headers["year"],
                event=unquote(request.headers["event_name"]),
                event_code=request.headers["event_code"],
                event_model=event,
            )

            data_json = []
            for item in data:
                item_data = {}
                for key in item.data:
                    item_data[key["name"]] = key["value"]

                item_data["created"] = item.created
                item_data["username_created"] = item.username_created
                item_data["team_number_created"] = item.team_number_created
                item_data["account"] = item.account

                data_json.append(item_data)

            all_names = season_fields.create_tabulator_headers(
                season_fields.collect_field_names(
                    get_season_data_from_year(request.headers["year"])
                )
            )

            return JsonResponse(
                {"data": data_json, "data_headers": list(all_names), "demo": False},
                safe=False,
            )

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
                "event_code": event.event_code,
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
            "event_code": UUID,
        }

        if request.user.is_authenticated:
            event = Event(
                year=data["year"],
                name=request.headers["name"],
                created=timezone.now(),
                event_code=UUID,
                custom=True,
                custom_data=data,
                user_created=request.user,
            )
            event.save()

        else:
            event = Event(
                year=data["year"],
                name=request.headers["name"],
                created=timezone.now(),
                event_code=UUID,
                custom=True,
                custom_data=data,
            )
            event.save()

        return HttpResponse(request, "Success")
    else:
        return HttpResponse(request, "Request is not a POST request!", status=501)


@csrf_exempt
def get_year_data(request):
    if request.method == "POST":
        events = Event.objects.filter(year=request.headers["year"])

        data = {
            "events": len(events),
        }

        return JsonResponse(json.dumps(data), safe=False)

    else:
        return HttpResponse("Request is not a POST request!", status=501)


@csrf_exempt
def check_local_backup_reports(request):
    if request.method == "POST":
        reports_found = 0
        reports_not_found = 0

        reports_list = json.loads(unquote(request.headers["data"]))

        for report in reports_list:
            data = Data.objects.filter(
                uuid=report["uuid"],
                event_code=report["event_code"],
                year=report["year"],
            )

            if data:
                reports_found += 1
            else:
                reports_not_found += 1

                if report["custom"] == "true":
                    events = Event.objects.filter(
                        name=unquote(report["event_name"]),
                        event_code=report["event_code"],
                        custom=True,
                        year=request.headers["year"],
                    )
                    event = events[0]

                else:
                    events = Event.objects.filter(
                        event_code=report["event_code"],
                        year=report["year"],
                    )

                    if len(events) == 0:
                        if request.user.is_authenticated:
                            event = Event(
                                year=report["year"],
                                name=unquote(report["event_name"]),
                                event_code=report["event_code"],
                                custom=False,
                                created=timezone.now(),
                                user_created=request.user,
                            )
                            event.save()
                        else:
                            event = Event(
                                year=report["year"],
                                name=unquote(report["event_name"]),
                                event_code=report["event_code"],
                                custom=False,
                                created=timezone.now(),
                            )
                            event.save()
                    else:
                        event = events[0]

                if request.user.is_authenticated:
                    new_data = Data(
                        uuid=report["uuid"],
                        year=report["year"],
                        event=unquote(report["event_name"]),
                        event_code=report["event_code"],
                        data=report["data"],
                        created=timezone.now(),
                        event_model=event,
                        user_created=request.user,
                        username_created=request.user.username,
                        team_number_created=request.user.profile.team_number,
                        account=True,
                    )
                    new_data.save()
                else:
                    new_data = Data(
                        uuid=report["uuid"],
                        year=report["year"],
                        event=unquote(report["event_name"]),
                        event_code=report["event_code"],
                        data=report["data"],
                        created=timezone.now(),
                        event_model=event,
                        username_created=request.session["username"],
                        team_number_created=request.session["team_number"],
                        account=False,
                    )
                    new_data.save()

        data = {"reports_found": reports_found, "reports_not_found": reports_not_found}

        return JsonResponse(json.dumps(data), safe=False)

    else:
        return HttpResponse("Request is not a POST request!", status=501)


@csrf_exempt
def upload_offline_reports(request):
    # TODO: This is identical to the previous function, is this necessary or should they be merged into one?
    if request.method == "POST":
        reports_found = 0
        reports_not_found = 0

        reports_list = json.loads(unquote(request.headers["data"]))

        for report in reports_list:
            data = Data.objects.filter(
                uuid=report["uuid"],
                event_code=report["event_code"],
                year=report["year"],
            )

            if data:
                reports_found += 1
            else:
                reports_not_found += 1

                if report["custom"] == "true":
                    events = Event.objects.filter(
                        name=unquote(report["event_name"]),
                        event_code=report["event_code"],
                        custom=True,
                        year=request.headers["year"],
                    )
                    event = events[0]

                else:
                    events = Event.objects.filter(
                        event_code=report["event_code"],
                        year=report["year"],
                    )

                    if len(events) == 0:
                        if request.user.is_authenticated:
                            event = Event(
                                year=report["year"],
                                name=unquote(report["event_name"]),
                                event_code=report["event_code"],
                                custom=False,
                                created=timezone.now(),
                                user_created=request.user,
                            )
                            event.save()
                        else:
                            event = Event(
                                year=report["year"],
                                name=unquote(report["event_name"]),
                                event_code=report["event_code"],
                                custom=False,
                                created=timezone.now(),
                            )
                            event.save()
                    else:
                        event = events[0]

                if request.user.is_authenticated:
                    new_data = Data(
                        uuid=report["uuid"],
                        year=report["year"],
                        event=unquote(report["event_name"]),
                        event_code=report["event_code"],
                        data=report["data"],
                        created=timezone.now(),
                        event_model=event,
                        user_created=request.user,
                        username_created=request.user.username,
                        team_number_created=request.user.profile.team_number,
                        account=True,
                    )
                    new_data.save()
                else:
                    new_data = Data(
                        uuid=report["uuid"],
                        year=report["year"],
                        event=unquote(report["event_name"]),
                        event_code=report["event_code"],
                        data=report["data"],
                        created=timezone.now(),
                        event_model=event,
                        username_created=request.session["username"],
                        team_number_created=request.session["team_number"],
                        account=False,
                    )
                    new_data.save()

        data = {"reports_found": reports_found, "reports_not_found": reports_not_found}

        return JsonResponse(json.dumps(data), safe=False)

    else:
        return HttpResponse("Request is not a POST request!", status=501)
