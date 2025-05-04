from .general import urlpatterns as general_urls
from .project import urlpatterns as project_urls
from .ai import urlpatterns as ai_urls
from .gcp import urlpatterns as gcp_urls
from .rest import urlpatterns as rest_urls

# Combine all urlpatterns
urlpatterns = general_urls + project_urls + ai_urls + gcp_urls + rest_urls
