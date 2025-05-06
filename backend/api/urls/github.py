from django.urls import path
from ..views.github import *

app_name = 'github'

urlpatterns = [
    path('', index, name='index'),
    path('github/', index),
    path('github/check-token/', check_github_token, name='check_github_token'),
    path('github/token/', manage_token),
    path('github/repos/', list_repos),
    path('github/repos/<str:repo_name>/summary/', repo_summary),
    path('github/create-repo/', create_repository, name='create_repository'), 
]