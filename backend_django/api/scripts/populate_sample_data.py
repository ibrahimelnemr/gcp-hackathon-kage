import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')
django.setup()

from api.models import Employee, Project, Task

def create_sample_data():
    """
    Creates sample data: employees, a project, and associated tasks.
    """
    # Create sample employees
    employee1 = Employee.objects.create(name='Alice', level='Senior', department='Development')
    employee2 = Employee.objects.create(name='Bob', level='Junior', department='Testing')

    # Create a sample project
    project = Project.objects.create(
        name='Sample Project',
        description='This is a sample project.',
    )

    # Create sample tasks for the project
    Task.objects.create(
        project=project,
        employee=employee1,
        description='Sample Task 1',
        status='pending'
    )
    Task.objects.create(
        project=project,
        employee=employee2,
        description='Sample Task 2',
        status='in_progress'
    )

    print("Sample data created successfully.")

if __name__ == '__main__':
    create_sample_data()