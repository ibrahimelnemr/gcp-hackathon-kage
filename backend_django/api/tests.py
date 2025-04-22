from django.test import TestCase
from django.db import connections
from .models import Employee, Project, Task


class SampleDataTestCase(TestCase):
    databases = {'default'}  # Explicitly use the default database

    def create_sample_data(self):
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

    def delete_sample_data(self):
        """
        Deletes all sample data: employees, projects, and tasks.
        """
        Task.objects.using('default').all().delete()
        Project.objects.using('default').all().delete()
        Employee.objects.using('default').all().delete()

    def test_refresh(self):
        """
        Deletes existing sample data and recreates it.
        """
        self.delete_sample_data()
        self.create_sample_data()

        # Verify that data is saved
        self.assertEqual(Employee.objects.using('default').count(), 2)
        self.assertEqual(Project.objects.using('default').count(), 1)
        self.assertEqual(Task.objects.using('default').count(), 2)