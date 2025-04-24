from django.urls import path
from ..views.ai import *

app_name = 'ai'

urlpatterns = [
    path('ai/check', ai_chat, name='ai_chat'),
    path('ai/generate', generate_project_plan, name='ai_generate'),
    path('ai/', get_projects, name='get_projects')
]