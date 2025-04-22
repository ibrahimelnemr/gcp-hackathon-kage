from django.urls import path
from ..views.ai import ai_chat

app_name = 'ai'

urlpatterns = [
    path('ai/chat/', ai_chat, name='ai_chat'),
]