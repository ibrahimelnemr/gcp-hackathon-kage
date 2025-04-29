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
            {"name": "John", "level": "Analyst", "department": "AI and Data"},
            {"name": "Jane", "level": "Senior Consultant", "department": "AI and Data"},
            {"name": "Appleseed", "level": "Consultant", "department": "Cloud"},
            {"name": "Bartholomew", "level": "Senior Consultant", "department": "Cloud"},
            {"name": "Alice", "level": "Analyst", "department": "Fullstack"},
            {"name": "Frank", "level": "Senior Consultant", "department": "Fullstack"},
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
        kage_project_plan = kage.generate_project_plan(
            project_name=project_name,
            project_description=project_description,
            team_roles=team_roles
        )

        # Save the project to the database
        project = Project.objects.create(name=project_name, description=project_description)

        # Create employees based on team_roles
        for role in team_roles:
            Employee.objects.create(
                name=role["name"],
                level=role["level"],
                department=role["department"]
            )

        # Create tasks based on the project plan
        for task in kage_project_plan.get("tasks", []):
            employee_name = task.get("employee_name")  # Get the employee name from the task
            assigned_employee = Employee.objects.filter(name=employee_name).first()  # Fetch the employee by name

            if not assigned_employee:
                print(f"Warning: No employee found with name {employee_name}")  # Debugging log

            Task.objects.create(
                project=project,
                employee=assigned_employee,  # Associate the employee with the task
                description=task.get("description", ""),
                status="to-do"
            )

        # Return the generated project plan as a JSON response
        return JsonResponse({"generated_plan": kage_project_plan}, safe=False, status=200)

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

