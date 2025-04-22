from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from vertexai.preview.generative_models import GenerativeModel

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