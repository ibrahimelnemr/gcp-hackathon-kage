from django.db import models


class Employee(models.Model):
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=255)
    department = models.CharField(max_length=255)

    def __str__(self):
        return self.name
    

class Project(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.name
    
class Task(models.Model):
    project = models.ForeignKey(Project, related_name='tasks', on_delete=models.CASCADE)
    description = models.TextField()
    assigned_role_experience = models.CharField(max_length=255)
    assigned_role_department = models.CharField(max_length=255)
    rationale = models.TextField()

    def __str__(self):
        return self.description
    
