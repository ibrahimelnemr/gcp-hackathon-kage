# myapp/serializers.py
from rest_framework import serializers
from .models import Employee, Project, Task

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ['id', 'name', 'level', 'department']

class ProjectSerializer(serializers.ModelSerializer):
    employees = EmployeeSerializer(many=True, read_only=True)  # Include employees

    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'employees']  # Add 'employees' to fields

class TaskSerializer(serializers.ModelSerializer):
    project = ProjectSerializer()

    class Meta:
        model = Task
        fields = ['id', 'description', 'status', 'employee', 'project']
