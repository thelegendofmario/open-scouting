from django.shortcuts import render, redirect
from django.conf import settings


def auth(request):
    context = {
        "SERVER_IP": settings.SERVER_IP,
        "TBA_API_KEY": settings.TBA_API_KEY,
        "SERVER_MESSAGE": settings.SERVER_MESSAGE,
        "EMAIL_HOST_USER": settings.EMAIL_HOST_USER,
    }

    return render(request, "authentication.html", context)
