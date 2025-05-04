from django.urls import path, include
from rest_framework.routers import DefaultRouter
from ..views.project import ProjectViewSet
from ..views.task import TaskViewSet

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'tasks', TaskViewSet, basename='task')

urlpatterns = [
    path('', include(router.urls)),
]
