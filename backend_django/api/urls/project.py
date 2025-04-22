from django.urls import path
from ..views.project import create_project, get_tasks

app_name = 'project'

urlpatterns = [
    path('projects/', create_project, name='create_project'),
    path('projects/<int:project_id>/tasks/', get_tasks, name='get_tasks'),
]