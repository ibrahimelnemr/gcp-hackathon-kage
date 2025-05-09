from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from vertexai.preview.generative_models import GenerativeModel
import vertexai
from google.cloud import aiplatform
from google import genai
from google.genai import types
from ..utils.kage import Kage
import json
from dotenv import load_dotenv
from ..models import Project, Task, Employee
from ..utils.code_optimizer import CodeOptimizer
from ..utils.ai_assist import AIAssist

load_dotenv()

# vertexai.init(project="centered-accord-442214-b9", location="us-central1")
# model = GenerativeModel("gemini-pro")

# client = genai.Client(
#   vertexai=True, project="centered-accord-442214-b9", location="us-central1",
# )

# model = GenerativeModel("gemini-pro")

@api_view(['POST'])
def generate_project_plan(request):
    try:
        # Parse the input data from the request body
        data = json.loads(request.body)

        project_name = data.get("project_name")
        project_description = data.get("project_description")
        team_roles = data.get("team_roles", [])

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

        # Create employees based on team_roles and associate them with the project
        for role in team_roles:
            employee, _ = Employee.objects.get_or_create(
                name=role["name"],
                level=role["level"],
                department=role["department"]
            )
            project.employees.add(employee)  # Associate the employee with the project

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
        return JsonResponse({"message": "Project and employees created successfully."}, status=200)

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

@api_view(['POST'])
def optimize_code(request):
    """
    Optimizes the provided code using the CodeOptimizer class.
    """
    try:
        # Parse the input data from the request body
        data = json.loads(request.body)
        code = data.get("code")

        if not code:
            return JsonResponse({"error": "Code is required for optimization."}, status=400)

        # Initialize the CodeOptimizer class
        optimizer = CodeOptimizer()

        # Optimize the code
        result = optimizer.generate(code)

        # Return the optimized code and explanation
        return JsonResponse(result, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@api_view(['POST'])
def repository_analysis(request):
    """
    Analyze the repository linked to a project and return a summary.
    """
    try:
        # Parse the input data from the request body
        data = json.loads(request.body)
        repo_url = data.get("repo_url")

        if not repo_url:
            return JsonResponse({"error": "Repository URL is required."}, status=400)

        # Initialize AI Assist and analyze the repository
        ai_assist = AIAssist()
        analysis_result = ai_assist.analyze_repository(repo_url)

        # Return the analysis result
        return JsonResponse({"analysis_result": analysis_result}, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@api_view(['POST'])
def ai_assist_functionality(request):
    """
    Generate JSON changes for a specific task description and return them.
    """
    try:
        # Parse the input data from the request body
        data = json.loads(request.body)
        repo_url = data.get("repo_url")
        task_description = data.get("task_description")

        if not repo_url or not task_description:
            return JsonResponse({"error": "Both 'repo_url' and 'task_description' are required."}, status=400)

        # Initialize AI Assist and generate JSON changes
        ai_assist = AIAssist()
        json_changes = ai_assist.generate_json_changes(repo_url, task_description)

        # Return the JSON changes
        return JsonResponse({"json_changes": json_changes}, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@api_view(['POST'])
def commit_ai_changes(request):
    """
    Commit AI-generated changes to the repository.
    """
    try:
        data = json.loads(request.body)
        repo_url = data.get("repo_url")
        changes = data.get("changes")

        if not repo_url or not changes:
            return JsonResponse({"error": "Both 'repo_url' and 'changes' are required."}, status=400)

        ai_assist = AIAssist()
        ai_assist.apply_changes_with_pygithub(repo_url, changes)

        return JsonResponse({"message": "Changes committed successfully."}, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@api_view(['POST'])
def commit_json_changes(request):
    """
    Commit JSON changes to the repository.
    """
    try:
        # Parse the input data from the request body
        data = json.loads(request.body)
        repo_url = data.get("repo_url")
        json_changes = data.get("json_changes")

        if not repo_url or not json_changes:
            return JsonResponse({"error": "Both 'repo_url' and 'json_changes' are required."}, status=400)

        # Parse JSON changes into a Python object
        parsed_changes = json.loads(json_changes)

        # Initialize AI Assist and commit the changes
        ai_assist = AIAssist()
        ai_assist.apply_changes_with_pygithub(repo_url, parsed_changes)

        return JsonResponse({"message": "Changes committed successfully."}, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@api_view(['POST'])
def generate_json_changes_ai_assist(request):
    """
    Generate JSON changes for a specific task description and return sanitized JSON.
    """
    try:
        # Parse the input data from the request body
        data = json.loads(request.body)
        repo_url = data.get("repo_url")
        task_description = data.get("task_description")

        if not repo_url or not task_description:
            return JsonResponse({"error": "Both 'repo_url' and 'task_description' are required."}, status=400)

        # Initialize AI Assist and generate JSON changes
        ai_assist = AIAssist()
        json_changes_str = ai_assist.generate_json_changes(repo_url, task_description)

        # Sanitize the JSON changes string
        sanitized_json = AIAssist.sanitize_json_content(json_changes_str)

        # Parse the sanitized JSON string into a Python object
        json_changes = json.loads(sanitized_json)

        # Return the sanitized JSON changes
        return JsonResponse({"json_changes": json_changes}, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@api_view(['POST'])
def apply_json_changes(request):
    """
    Apply JSON changes to the repository.
    """
    try:
        # Parse the input data from the request body
        data = json.loads(request.body)
        repo_url = data.get("repo_url")
        json_changes = data.get("json_changes")

        if not repo_url or not json_changes:
            return JsonResponse({"error": "Both 'repo_url' and 'json_changes' are required."}, status=400)

        # Parse JSON changes into a Python object
        parsed_changes = json.loads(json_changes)

        # Initialize AI Assist and apply the changes
        ai_assist = AIAssist()
        ai_assist.apply_changes_with_pygithub(repo_url, parsed_changes)

        return JsonResponse({"message": "Changes applied successfully."}, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

