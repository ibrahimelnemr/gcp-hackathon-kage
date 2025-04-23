import json
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..models import Project, Task
from ..serializers import ProjectSerializer, TaskSerializer


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

@api_view(['POST'])
def create_project(request):
    """
    Handles a POST request to retrieve tasks based on the provided project data.
    """
    try:
        # Extract project data from the request
        project_name = request.data.get('project_name')
        project_description = request.data.get('project_description')
        team_members = request.data.get('team_members', [])

        print("Received project data:", project_name, project_description, team_members)

        tasks = Task.objects.all()

        # Serialize the tasks
        serializer = TaskSerializer(tasks, many=True)

        # Return the serialized tasks as a JSON response
        return Response(serializer.data, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
    
    
@api_view(['GET'])
def get_projects(request):
    """
    Handles a GET request to retrieve all projects from the database.
    """
    try:
        # Retrieve all projects from the database
        projects = Project.objects.all()

        # Serialize the projects
        serializer = ProjectSerializer(projects, many=True)

        # Return the serialized projects as a JSON response
        return Response(serializer.data, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)