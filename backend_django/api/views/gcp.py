from rest_framework.decorators import api_view
from django.http import JsonResponse
from google.cloud import storage
from google.auth import default
from googleapiclient.discovery import build

@api_view(['GET'])
def check_gcp_connection(request):
    try:
        # Get default credentials and project
        credentials, project = default()

        # Create a client for the Google Cloud Storage service
        client = storage.Client()

        # List all buckets in your GCP project
        buckets = list(client.list_buckets())

        # Collect some basic information about the buckets
        bucket_names = [bucket.name for bucket in buckets]

        # Get the current user (email)
        current_user = credentials.service_account_email

        # Get permissions for the current user
        iam_service = build('cloudresourcemanager', 'v1', credentials=credentials)
        permissions_request = {
            "permissions": [
                "storage.buckets.list",
                "resourcemanager.projects.get"
            ]
        }
        permissions_response = iam_service.projects().testIamPermissions(
            resource=project, body=permissions_request
        ).execute()
        user_permissions = permissions_response.get("permissions", [])

        # Get the location of the project
        project_location = client.get_service_account_email().split('@')[-1]

        return JsonResponse({
            "current_user": current_user,
            "project": project,
            "permissions": user_permissions,
            "location": project_location,
            "gcp_buckets": bucket_names
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)