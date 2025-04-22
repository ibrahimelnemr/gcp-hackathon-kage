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

        # Get project details
        project_info = iam_service.projects().get(projectId=project).execute()
        project_name = project_info.get("name", "Unknown")
        project_number = project_info.get("projectNumber", "Unknown")

        # Get roles assigned to the service account
        iam_policy = iam_service.projects().getIamPolicy(resource=project, body={}).execute()
        bindings = iam_policy.get("bindings", [])
        assigned_roles = [
            binding["role"] for binding in bindings if current_user in binding.get("members", [])
        ]

        # Collect detailed IAM policy information
        iam_details = []
        for binding in bindings:
            role = binding.get("role", "Unknown")
            members = binding.get("members", [])
            iam_details.append({
                "role": role,
                "members": members
            })

        # Check for custom roles in the project
        custom_roles = []
        roles_service = build('iam', 'v1', credentials=credentials)
        roles_request = roles_service.projects().roles().list(parent=f"projects/{project}").execute()
        for role in roles_request.get("roles", []):
            custom_roles.append({
                "name": role.get("name"),
                "title": role.get("title"),
                "description": role.get("description")
            })

        # Extract detailed privileges for the current service account
        service_account_privileges = []
        for binding in bindings:
            if any(current_user in member for member in binding.get("members", [])):
                service_account_privileges.append({
                    "role": binding.get("role"),
                    "privileges": binding.get("members")
                })

        return JsonResponse({
            "current_user": current_user,
            "project": project,
            "project_name": project_name,
            "project_number": project_number,
            "permissions": user_permissions,
            "location": project_location,
            "gcp_buckets": bucket_names,
            "assigned_roles": assigned_roles,
            "iam_policy": iam_details,
            "custom_roles": custom_roles,
            "service_account_privileges": service_account_privileges
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)