from django.urls import path
from . import views

app_name = 'videochat'

urlpatterns = [
    path('', views.lobby, name="lobby"),
    path('room/', views.room, name="room"),
    path('get_token/', views.getToken)
]
