from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.project import ProjectViewSet
from .views.task import TaskViewSet

urlpatterns = [
    path('general/', include('api.urls.general')),
    path('project/', include(('api.urls.project', 'project'))),
    path('ai/', include(('api.urls.ai', 'ai'))),
    path('gcp/', include(('api.urls.gcp', 'gcp'))),   
    path('github/', include(('api.urls.github', 'github'))),
]