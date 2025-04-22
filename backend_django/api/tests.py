from django.test import TransactionTestCase
from .models import Employee, Project, Task


class SampleDataTestCase(TransactionTestCase):
    def create_sample_data(self):
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

    def delete_sample_data(self):
        """
        Deletes all sample data: employees, projects, and tasks.
        """
        Task.objects.all().delete()
        Project.objects.all().delete()
        Employee.objects.all().delete()

    def refresh(self):
        """
        Deletes existing sample data and recreates it.
        """
        self.delete_sample_data()
        self.create_sample_data()

    def test_sample_data(self):
        """
        Test to ensure sample data is created and saved correctly.
        """
        # Refresh sample data
        self.refresh()

        # Check that the sample data exists
        self.assertEqual(Employee.objects.filter(name='Alice').count(), 1)
        self.assertEqual(Employee.objects.filter(name='Bob').count(), 1)
        self.assertEqual(Project.objects.filter(name='Sample Project').count(), 1)
        self.assertEqual(Task.objects.filter(project__name='Sample Project').count(), 2)

        # Delete sample data
        self.delete_sample_data()

        # Check that the sample data is deleted
        self.assertEqual(Employee.objects.filter(name='Alice').count(), 0)
        self.assertEqual(Employee.objects.filter(name='Bob').count(), 0)
        self.assertEqual(Project.objects.filter(name='Sample Project').count(), 0)
        self.assertEqual(Task.objects.filter(project__name='Sample Project').count(), 0)