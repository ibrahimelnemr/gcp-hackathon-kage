from django.urls import path
from ..views.project import *

app_name = 'project'

urlpatterns = [
    path('project/create', create_project, name='create_project'),
    path('project/<int:project_id>/tasks/', get_tasks, name='get_tasks'),
    path('project/<int:project_id>/', get_project_details, name='get_project_details'),  # New endpoint
    path('project/', get_projects, name='get_projects'),
    path('project/delete', delete_projects, name='delete_projects'),
]