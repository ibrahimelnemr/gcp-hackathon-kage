from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from ..models import Employee, Project, Task

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

@api_view(['GET'])
def populate_db(request):
    try:
        refresh_sample_data()
        projects = list(Project.objects.values())
        tasks = list(Task.objects.values())
        employees = list(Employee.objects.values())

        # return Response({"message": "Database connection is successful!"})
        return JsonResponse({
        'projects': projects,
        'tasks': tasks,
        'employees': employees,
        })      
    except Exception as e:
        return Response({"error": str(e)}, status=500)

def create_sample_data():
        """
        Creates sample data: employees, a project, and associated tasks.
        """
        # Create sample employees
        employee1 = Employee.objects.using('default').create(name='Alice', level='Senior', department='Development')
        employee2 = Employee.objects.using('default').create(name='Bob', level='Junior', department='Testing')

        # Create a sample project
        project = Project.objects.using('default').create(
            name='Sample Project',
            description='This is a sample project.',
        )

        # Create sample tasks for the project
        Task.objects.using('default').create(
            project=project,
            employee=employee1,
            description='Sample Task 1',
            status='pending'
        )
        Task.objects.using('default').create(
            project=project,
            employee=employee2,
            description='Sample Task 2',
            status='in_progress'
        )

def delete_sample_data():
        """
        Deletes all sample data: employees, projects, and tasks.
        """
        Task.objects.using('default').all().delete()
        Project.objects.using('default').all().delete()
        Employee.objects.using('default').all().delete()

def refresh_sample_data():
        """
        Deletes existing sample data and recreates it.
        """
        delete_sample_data()
        create_sample_data()

