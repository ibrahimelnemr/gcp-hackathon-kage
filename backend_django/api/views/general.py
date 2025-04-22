from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

@api_view(['GET'])
def index(request):
    return HttpResponse("project management API")

@api_view(['GET'])
def testdb(request):
    # Testing database connection
    try:
        Project.objects.all()  # Trying to access a model to check DB connection
        return Response({"message": "Database connection is successful!"})
    except Exception as e:
        return Response({"error": str(e)}, status=500)


