from django.urls import path
from .views import *

urlpatterns = [
    path('/test', index, name='index'),
    path('', generate_plan, name='generate_plan'),
    path('testdb/', testdb, name='testdb'),
    path('create-project/', create_project, name='create_project'),
    path('get-tasks/<int:project_id>/', get_tasks, name='get_tasks'),
    path('ai-chat/', ai_chat),
    path('check-gcp-connection/', check_gcp_connection, name='check_gcp_connection'),
    path('check-vertex-ai-connection/', check_vertex_ai_connection, name='check_vertex_ai_connection')
]
