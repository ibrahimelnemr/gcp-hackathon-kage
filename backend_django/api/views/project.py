import json
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..models import Project, Task
from ..serializers import ProjectSerializer, TaskSerializer

@api_view(['POST'])
def create_project(request):
    serializer = ProjectSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
def get_tasks(request, project_id):
    tasks = Task.objects.filter(project_id=project_id)
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def generate_plan(request):
    try:
        # data = json.loads(request.body)
        # print("Received input:", data)  
        
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

