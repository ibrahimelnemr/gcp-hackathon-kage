import json
import os
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Project, Task, Employee
from .serializers import ProjectSerializer, TaskSerializer, EmployeeSerializer
from google.cloud import storage
from vertexai.preview.generative_models import GenerativeModel
import vertexai
from google.cloud import aiplatform
from google import genai
from google.genai import types

from dotenv import load_dotenv

load_dotenv() 

vertexai.init(project="centered-accord-442214-b9", location="us-central1")
model = GenerativeModel("gemini-pro")

client = genai.Client(
  vertexai=True, project="centered-accord-442214-b9", location="us-central1",
)

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

@api_view(['GET'])
def testdb(request):
    # Testing database connection
    try:
        Project.objects.all()  # Trying to access a model to check DB connection
        return Response({"message": "Database connection is successful!"})
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
def create_project(request):
    # Creating a project based on request data
    serializer = ProjectSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
def get_tasks(request, project_id):
    # Fetching tasks for a specific project
    tasks = Task.objects.filter(project_id=project_id)
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def ai_chat(request):
    try:
        # data = json.loads(request.body)
        # user_input = data.get("message", "")
        user_input = "Hello"
        if not user_input:
            return JsonResponse({"error": "Missing 'message' in request body."}, status=400)

        # Generate response using Gemini model
        response = model.generate_content(user_input)
        return JsonResponse({"response": response.text})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
        
@api_view(['GET'])
def check_gcp_connection(request):
    try:
        # Create a client for the Google Cloud Storage service
        client = storage.Client()

        # List all buckets in your GCP project
        buckets = list(client.list_buckets())

        # Collect some basic information about the buckets
        bucket_names = [bucket.name for bucket in buckets]

        return JsonResponse({"gcp_buckets": bucket_names})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
@api_view(['GET'])
def check_vertex_ai_connection(request):
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
        return {"error": str(e)}