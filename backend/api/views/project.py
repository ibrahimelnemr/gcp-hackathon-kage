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
    try:
        # Fetch all projects
        projects = Project.objects.all()

        # Prepare the response data
        response_data = []
        for project in projects:
            # Fetch tasks related to the project
            tasks = Task.objects.filter(project=project).select_related('employee')

            # Prepare task details
            task_list = []
            for task in tasks:
                task_list.append({
                    "task_id": task.id,
                    "status": task.status,
                    "description": task.description,
                    "employee_name": task.employee.name if task.employee else None,
                    "employee_level": task.employee.level if task.employee else None,
                    "employee_department": task.employee.department if task.employee else None,
                })

            # Add project details to the response
            response_data.append({
                "project_name": project.name,
                "project_description": project.description,
                "tasks": task_list
            })

        # Return the response as JSON
        return JsonResponse(response_data, safe=False, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@api_view(['GET'])
def delete_projects(request):
    """
    Deletes all projects along with their associated tasks and employees.
    """
    try:
        # Delete all tasks associated with projects
        Task.objects.all().delete()

        # Delete all projects
        Project.objects.all().delete()

        # Return a success response
        return JsonResponse({"message": "All projects, tasks, and associated data have been deleted successfully."}, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)