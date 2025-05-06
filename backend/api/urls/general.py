from django.urls import path
from ..views.general import index, populate_db
from ..views.github import index as index_github

urlpatterns = [
    path('', index, name='index'),
    path('populatedb', populate_db, name='populate_db'),
    # path('github/', index_github)
]