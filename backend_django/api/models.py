from django.db import models


class Employee(models.Model):
    name = models.CharField(max_length=255)
    level = models.CharField(max_length=255)  # Added 'level' field
    department = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Project(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()

    def __str__(self):
        return self.name


class Task(models.Model):
    STATUS_CHOICES = [
        ('pending', 'pending'),
        ('in_progress', 'in_progress'),
        ('done', 'done'),
    ]

    project = models.ForeignKey(Project, related_name='tasks', on_delete=models.CASCADE)
    employee = models.ForeignKey(Employee, related_name='tasks', on_delete=models.CASCADE)  
    description = models.TextField()
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='pending') 

    def __str__(self):
        return self.description