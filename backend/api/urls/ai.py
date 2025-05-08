from django.urls import path
from ..views.ai import *

app_name = 'ai'

urlpatterns = [
    path('ai/check', ai_chat, name='ai_chat'),
    path('ai/generate', generate_project_plan, name='ai_generate'),
    path('ai/optimize', optimize_code, name='ai_optimize'),
    path('ai/repository-analysis', repository_analysis, name='repository_analysis'),
    path('ai/assist', ai_assist_functionality, name='ai_assist_functionality'),
]