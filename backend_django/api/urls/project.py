from django.urls import path
from ..views.project import create_project, get_tasks, generate_plan

app_name = 'project'

urlpatterns = [
    path('project/create', create_project, name='create_project'),
    path('project/<int:project_id>/tasks/', get_tasks, name='get_tasks'),
    path('project/plan', generate_plan, name='generate_plan')
]