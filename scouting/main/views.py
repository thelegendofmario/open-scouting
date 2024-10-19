from django.shortcuts import render, HttpResponse
from django.conf import settings

def index(request):
    context = {
        "TBA_API_KEY": settings.TBA_API_KEY
    }

    return render(request, "index.html", context)