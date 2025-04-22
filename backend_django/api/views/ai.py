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

# @api_view(['GET'])
# def ai_chat(request):
#     try:
#         user_input = "Hello"
#         if not user_input:
#             return JsonResponse({"error": "Missing 'message' in request body."}, status=400)

#         response = model.generate_content(user_input)
#         return JsonResponse({"response": response.text})

#     except Exception as e:
#         return JsonResponse({"error": str(e)}, status=500)


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