from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json

@csrf_exempt
@require_http_methods(["GET"])
def index(request):
    return HttpResponse("project management API")

@csrf_exempt
@require_http_methods(["POST"])
def generate_plan(request):
    try:
        data = json.loads(request.body)
        print("Received input:", data)  # Debug log

        mock_response = {
            "generated_plan": {
                "tasks": [
                    {
                        "task_id": 1,
                        "description": "Run Axe accessibility scan on the portal.",
                        "assigned_role_experience": "Senior Consultant",
                        "assigned_role_department": "Accessibility",
                        "rationale": "Needs accessibility expertise to configure tool and interpret results."
                    },
                    {
                        "task_id": 2,
                        "description": "Review login flow for keyboard navigation issues.",
                        "assigned_role_experience": "Senior Consultant",
                        "assigned_role_department": "Accessibility",
                        "rationale": "Requires manual accessibility testing experience."
                    }
                ],
                "missing_roles": [
                    {
                        "experience": "Consultant",
                        "department": "Fullstack",
                        "reasoning": "Helps with workload and React-specific tasks."
                    }
                ]
            }
        }
        return JsonResponse(mock_response)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
