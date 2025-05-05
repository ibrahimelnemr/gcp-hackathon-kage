from django.urls import path, include
from rest_framework.routers import DefaultRouter
from ..views.project import ProjectViewSet
from ..views.task import TaskViewSet
from ..views.employee import EmployeeViewSet 

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'employees', EmployeeViewSet, basename='employee') 

urlpatterns = [
    path('rest/', include(router.urls)),
]
