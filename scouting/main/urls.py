from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("contribute", views.contribute, name="contribute"),
    path("data", views.data, name="data"),
    path("submit", views.submit, name="submit"),
    path("get_data", views.get_data, name="get_data"),
    path("get_custom_events", views.get_custom_events, name="get_custom_events"),
    path("create_custom_event", views.create_custom_event, name="create_custom_event")
]
