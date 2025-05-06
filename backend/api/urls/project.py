from django.urls import path
from ..views.project import *
from ..views.gitsync import *

app_name = 'project'

urlpatterns = [
    path('project/create', create_project, name='create_project'),
    path('project/<int:project_id>/tasks/', get_tasks, name='get_tasks'),
    path('project/<int:project_id>/', get_project_details, name='get_project_details'),
    path('project/<int:project_id>/delete/', delete_project, name='delete_project'),
    path('project/', get_projects, name='get_projects'),
    path('project/delete', delete_projects, name='delete_projects'),
    path('project/<int:project_id>/employees/', manage_project_employees, name='manage_project_employees'),
    path('project/<int:project_id>/employees/<int:employee_id>/remove/', remove_employee_from_project, name='remove_employee_from_project'),
    path('project/<int:project_id>/employees/add/', add_employee_to_project, name='add_employee_to_project'),
    path('project/<int:project_id>/employees/list/', get_project_employees, name='get_project_employees'),  # New endpoint
    path('tasks/<int:task_id>/update/', update_task, name='update_task'), 
    path('project/github', index),
    path('project/github/check-token/', check_github_token, name='check_github_token'),
    path('project/github/token/', manage_token),
    path('project/github/repos/', list_repos),
    path('project/github/repos/<str:repo_name>/summary/', repo_summary),
]