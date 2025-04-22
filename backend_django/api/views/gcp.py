from rest_framework.decorators import api_view
from django.http import JsonResponse
from google.cloud import storage

@api_view(['GET'])
def check_gcp_connection(request):
    try:
        client = storage.Client()
        buckets = list(client.list_buckets())
        bucket_names = [bucket.name for bucket in buckets]
        return JsonResponse({"gcp_buckets": bucket_names})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)