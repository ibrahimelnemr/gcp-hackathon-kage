# myapp/serializers.py
from rest_framework import serializers
from .models import Employee, Project, Task

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ['id', 'name', 'role', 'department']

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'start_date', 'end_date']

class TaskSerializer(serializers.ModelSerializer):
    project = ProjectSerializer()

    class Meta:
        model = Task
        fields = ['id', 'description', 'assigned_role_experience', 'assigned_role_department', 'rationale', 'project']
