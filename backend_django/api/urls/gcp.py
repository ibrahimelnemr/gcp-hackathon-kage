from django.urls import path
from ..views.gcp import check_gcp_connection

app_name = 'gcp'

urlpatterns = [
    path('gcp/check', check_gcp_connection, name='check_gcp_connection'),
]