import json
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from ..models import Project, Task, Employee
from ..serializers import ProjectSerializer, TaskSerializer
from django.shortcuts import get_object_or_404

class ProjectViewSet(ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

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
    try:
        Task.objects.all().delete()

        Project.objects.all().delete()

        return JsonResponse({"message": "All projects, tasks, and associated data have been deleted successfully."}, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@api_view(['GET'])
def get_project_details(request, project_id):
    """
    Fetches the details of a specific project by its ID.
    """
    try:
        # Fetch the project
        project = get_object_or_404(Project, id=project_id)

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

        # Prepare project details
        project_details = {
            "id": project.id,
            "name": project.name,
            "description": project.description,
            "tasks": task_list,
        }

        return JsonResponse(project_details, safe=False, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@api_view(['POST'])
def manage_project_employees(request, project_id):
    """
    Add or remove employees from a project.
    """
    try:
        project = get_object_or_404(Project, id=project_id)
        employee_ids = request.data.get('employee_ids', [])

        # Validate employee IDs
        employees = Employee.objects.filter(id__in=employee_ids)
        if not employees.exists():
            return Response({"error": "No valid employees found."}, status=400)

        # Update the project's employees
        project.employees.set(employees)  # Replace existing employees with the new list
        project.save()

        return Response({"message": "Employees updated successfully."}, status=200)

    except Exception as e:
        return Response({"error": str(e)}, status=500)
