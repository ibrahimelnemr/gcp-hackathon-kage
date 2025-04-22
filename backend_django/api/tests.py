from django.test import TestCase
from django.contrib.auth.models import User
from .models import Project, Task

class SampleDataTestCase(TestCase):
    def createsampledata(self):
        """
        Creates sample data: a user, a project, and associated tasks.
        """
        # Create a sample user
        user = User.objects.create_user(username='sampleuser', password='samplepassword')

        # Create a sample project
        project = Project.objects.create(
            name='Sample Project',
            description='This is a sample project.',
        )

        # Create sample tasks for the project
        Task.objects.create(
            project=project,
            description='Sample Task 1',
            assigned_role_experience='Senior',
            assigned_role_department='Development',
            rationale='Rationale for Task 1'
        )
        Task.objects.create(
            project=project,
            description='Sample Task 2',
            assigned_role_experience='Junior',
            assigned_role_department='Testing',
            rationale='Rationale for Task 2'
        )

    def deletesampledata(self):
        """
        Deletes all sample data: users, projects, and tasks.
        """
        Task.objects.all().delete()
        Project.objects.all().delete()
        User.objects.filter(username='sampleuser').delete()

    def refresh(self):
        """
        Deletes existing sample data and recreates it.
        """
        self.deletesampledata()
        self.createsampledata()

    def test_sample_data(self):
        """
        Test to ensure sample data is created and deleted correctly.
        """
        # Refresh sample data
        self.refresh()

        # Check that the sample data exists
        self.assertEqual(User.objects.filter(username='sampleuser').count(), 1)
        self.assertEqual(Project.objects.filter(name='Sample Project').count(), 1)
        self.assertEqual(Task.objects.filter(project__name='Sample Project').count(), 2)

        # Delete sample data
        self.deletesampledata()

        # Check that the sample data is deleted
        self.assertEqual(User.objects.filter(username='sampleuser').count(), 0)
        self.assertEqual(Project.objects.filter(name='Sample Project').count(), 0)
        self.assertEqual(Task.objects.filter(project__name='Sample Project').count(), 0)