from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("contribute", views.contribute, name="contribute"),
    path("submit", views.submit, name="submit")
]
