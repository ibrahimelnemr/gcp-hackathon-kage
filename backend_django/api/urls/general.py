from django.urls import path
from ..views.general import index, populate_db

urlpatterns = [
    path('', index, name='index'),
    path('populatedb', populate_db, name='populate_db'),
]