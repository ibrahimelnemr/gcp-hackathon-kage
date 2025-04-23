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
        project_name = data.get("project_name")
        project_description = data.get("project_description")
        team_roles = data.get("team_roles")

        # Validate input fields
        if not project_name or not project_description or not team_roles:
            return JsonResponse({"error": "Missing required fields: 'project_name', 'project_description', or 'team_roles'."}, status=400)

        if not isinstance(team_roles, dict):
            return JsonResponse({"error": "'team_roles' must be a dictionary."}, status=400)
        
        kage = Kage()
        project_plan = kage.generate_project_plan(
            project_name=project_name,
            project_description=project_description,
            team_roles=team_roles
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