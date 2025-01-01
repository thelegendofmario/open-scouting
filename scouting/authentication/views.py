from django.shortcuts import render, redirect


def auth(request):
    return render(request, "authentication.html")
