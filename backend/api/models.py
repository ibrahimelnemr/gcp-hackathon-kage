from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver


class Employee(models.Model):
    
    name = models.CharField(max_length=255)
    
    level = models.CharField(max_length=255)  # Added 'level' field
    
    department = models.CharField(max_length=255)
    
    email = models.EmailField(unique=True, null=True) 

    def __str__(self):
        return self.name


class Project(models.Model):
    
    name = models.CharField(max_length=255)
    
    description = models.TextField(blank=True, null=True)
    
    github_repo = models.ForeignKey('GitHubRepository', on_delete=models.SET_NULL, null=True, blank=True,  related_name="projects")
    
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
    # user = models.ForeignKey('auth.User', on_delete=models.CASCADE, null=True)  
    encrypted_token = models.TextField()  
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"GitHubToken created at {self.created_at}"


class GitHubRepository(models.Model):
    
    token = models.ForeignKey(GitHubToken, on_delete=models.CASCADE, 
    related_name="repositories", null=True)
    
    github_url = models.URLField()
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


# Signal to delete repositories and unlink projects when a GitHubToken is deleted
@receiver(post_delete, sender=GitHubToken)
def delete_repositories_and_unlink_projects(sender, instance, **kwargs):
    repositories = GitHubRepository.objects.filter(token=instance)
    for repo in repositories:
        Project.objects.filter(github_repo=repo).update(github_repo=None)  # Unlink projects
        repo.delete()  # Delete repositories