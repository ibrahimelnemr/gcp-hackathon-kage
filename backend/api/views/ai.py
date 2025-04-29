from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from vertexai.preview.generative_models import GenerativeModel
import vertexai
from google.cloud import aiplatform
from google import genai
from google.genai import types
from ..kage import Kage
import json
from dotenv import load_dotenv
from ..models import Project, Task, Employee  # Import the models

load_dotenv() 

vertexai.init(project="centered-accord-442214-b9", location="us-central1")
model = GenerativeModel("gemini-pro")

client = genai.Client(
  vertexai=True, project="centered-accord-442214-b9", location="us-central1",
)

model = GenerativeModel("gemini-pro")

@api_view(['POST'])
def generate_project_plan(request):
    try:
        # Parse the input data from the request body
        data = json.loads(request.body)

        # Default mock data
        default_project_name = "Default Project"
        default_project_description = (
            "Start Date: April 2025\n"
            "Develop an AI agent that can extract text from a contract (word document) and compare it to a template. "
            "The AI agent must be able to compare the contract to the template and provide differences where the contract "
            "does not comply with the template and provide a proposal to the contract.\n"
            "Platform: Azure OpenAI, Python backend, frontend.\n"
            "Cloud: AWS. Requires AWS expertise for deployment and service integration.\n"
            "Goal: Demonstrable proof-of-concept for company to test.\n"
            "End Date: June 2025"
        )
        default_team_roles = [
            {"name": "Analyst 1", "level": "Analyst", "department": "AI and Data"},
            {"name": "Senior Consultant 1", "level": "Senior Consultant", "department": "AI and Data"},
            {"name": "Consultant 1", "level": "Consultant", "department": "Cloud"},
            {"name": "Senior Consultant 2", "level": "Senior Consultant", "department": "Cloud"},
            {"name": "Analyst 2", "level": "Analyst", "department": "Fullstack"},
            {"name": "Senior Consultant 3", "level": "Senior Consultant", "department": "Fullstack"},
        ]

        # Use provided data or fallback to defaults
        project_name = data.get("project_name", default_project_name)
        project_description = data.get("project_description", default_project_description)
        team_roles = data.get("team_roles", default_team_roles)

        # Validate team_roles format
        if not isinstance(team_roles, list) or not all(
            isinstance(role, dict) and {"name", "level", "department"}.issubset(role) for role in team_roles
        ):
            return JsonResponse({"error": "'team_roles' must be a list of objects with 'name', 'level', and 'department'."}, status=400)

        # Initialize the Kage class and generate the project plan
        kage = Kage()
        project_plan = kage.generate_project_plan(
            project_name=project_name,
            project_description=project_description,
            team_roles=team_roles
        )

        # Save the project to the database
        project = Project.objects.create(name=project_name, description=project_description)

        # Create employees based on team_roles
        employees = {}
        for role in team_roles:
            employee = Employee.objects.create(
                name=role["name"],
                level=role["level"],
                department=role["department"]
            )
            employees[role["name"]] = employee

        # Create tasks based on the project plan
        for task in project_plan.get("tasks", []):
            assigned_role = task.get("assigned_role_experience")  # Get the role assigned to the task
            assigned_employee = employees.get(assigned_role)  # Find the employee for the role
            if not assigned_employee:
                print(f"Warning: No employee found for role {assigned_role}")  # Debugging log
            Task.objects.create(
                project=project,
                employee=assigned_employee,  # Assign the correct employee
                description=task.get("description", ""),
                status="pending"  # Default status
            )

        # Return the generated project plan as a JSON response
        return JsonResponse(project_plan, safe=False, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@api_view(['GET'])
def ai_chat(request):
    try:
        model = "gemini-1.5-pro-002"
        response = client.models.generate_content(
        model=model,
        contents=[
            "Hello"
        ],
        )
        print(response.text, end="")

        # Initialize the Vertex AI client with your project and location
        aiplatform.init(project='centered-accord-442214-b9', location='us-central1')

        models = aiplatform.Model.list()

        model_names = [model.display_name for model in models]

        # Return model names or other relevant info
        return Response(response.text, status=200)

    except Exception as e:
        # return {"error": str(e)}
        # return Response({"error": str(e)}, status=500)
        return JsonResponse({"error": str(e)}, status=500)

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