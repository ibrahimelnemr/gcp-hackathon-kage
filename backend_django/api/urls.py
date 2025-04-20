from django.urls import path
from .views import index, generate_plan

urlpatterns = [
    path('/test', index, name='index'),
    path('', generate_plan, name='generate_plan'),
]
