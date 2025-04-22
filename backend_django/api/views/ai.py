from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
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

model = GenerativeModel("gemini-pro")

@api_view(['GET'])
def ai_chat(request):
    try:
        user_input = "Hello"
        if not user_input:
            return JsonResponse({"error": "Missing 'message' in request body."}, status=400)

        response = model.generate_content(user_input)
        return JsonResponse({"response": response.text})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)