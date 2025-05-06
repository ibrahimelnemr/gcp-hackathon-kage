from django.db import models


class Employee(models.Model):
    name = models.CharField(max_length=255)
    level = models.CharField(max_length=255)  # Added 'level' field
    department = models.CharField(max_length=255)
    email = models.EmailField(unique=True, null=True) 

    def __str__(self):
        return self.name


class Project(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    employees = models.ManyToManyField(Employee, related_name='projects', blank=True)

    def __str__(self):
        return self.name


class Task(models.Model):
    STATUS_CHOICES = [
        ('pending', 'pending'),
        ('in_progress', 'in_progress'),
        ('done', 'done'),
    ]

    project = models.ForeignKey(Project, related_name='tasks', on_delete=models.CASCADE)
    employee = models.ForeignKey(Employee, related_name='tasks', on_delete=models.CASCADE, null=True)
    description = models.TextField()
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='pending') 

    def __str__(self):
        return self.description


class GitHubToken(models.Model):
    encrypted_token = models.TextField()

    def __str__(self):
        return "GitHub Token"