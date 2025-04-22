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




        
