from django.urls import path
from ..views.general import index

urlpatterns = [
    path('', index, name='index'),
]