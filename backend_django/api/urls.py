from django.urls import path, include

urlpatterns = [
    path('', include('api.urls.general')),
    path('project/', include(('api.urls.project', 'project'))),
    path('ai/', include(('api.urls.ai', 'ai'))),
    path('gcp/', include(('api.urls.gcp', 'gcp'))),
]