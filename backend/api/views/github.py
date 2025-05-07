from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from ..models import GitHubToken, Project, GitHubRepository
from ..utils import TokenEncryptor
from github import Github
import json
from rest_framework.decorators import api_view
# from django.contrib.auth.models import User

encryptor = TokenEncryptor()

def index(request):
    return JsonResponse({"message": "GitHub Integration API"})

def get_token():
    token_obj = GitHubToken.objects.first()
    if not token_obj:
        return None
    return encryptor.decrypt(token_obj.encrypted_token)

def get_token_obj():
    token_obj = GitHubToken.objects.first()
    if not token_obj:
        return None
    return token_obj

@csrf_exempt
def manage_token(request):
    if request.method == "POST":
        data = json.loads(request.body)
        raw_token = data.get("token")
        if not raw_token:
            return JsonResponse({"error": "Token is required"}, status=400)

        # Validate token by attempting GitHub call
        try:
            g = Github(raw_token)
            user = g.get_user().login
        except Exception:
            return JsonResponse({"error": "Invalid token"}, status=400)

        encrypted = encryptor.encrypt(raw_token)
        obj, _ = GitHubToken.objects.get_or_create(id=1)
        obj.encrypted_token = encrypted
        obj.save()
        return JsonResponse({"message": f"Token saved for user {user}"})

    elif request.method == "GET":
        token = GitHubToken.objects.first()
        return JsonResponse({"exists": bool(token)})

    elif request.method == "DELETE":
        GitHubToken.objects.all().delete()
        return JsonResponse({"message": "Token deleted"})

@csrf_exempt
def list_repos(request):
    token = get_token()
    if not token:
        return JsonResponse({"error": "Token not set"}, status=400)

    try:
        g = Github(token)
        repos = g.get_user().get_repos()
        data = [{"name": r.name, "url": r.html_url} for r in repos]
        return JsonResponse(data, safe=False)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def repo_summary(request, repo_name):
    token = get_token()
    if not token:
        return JsonResponse({"error": "Token not set"}, status=400)

    try:
        g = Github(token)
        user = g.get_user()
        repo = user.get_repo(repo_name)

        # Simple code analysis: count number of files, summarize file names
        contents = repo.get_contents("")
        files = []
        while contents:
            file = contents.pop(0)
            if file.type == "dir":
                contents.extend(repo.get_contents(file.path))
            else:
                files.append(file.path)

        summary = {
            "repo": repo.name,
            "file_count": len(files),
            "example_files": files[:5],
            "summary": "This repo has {} files. Example: {}".format(len(files), ', '.join(files[:3]))
        }
        return JsonResponse(summary)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def check_github_token(request):
    """
    Checks if a GitHub token exists and returns the username if it does.
    """
    token = get_token()
    if not token:
        return JsonResponse({"exists": False}, status=200)

    try:
        g = Github(token)
        user = g.get_user()
        return JsonResponse({"exists": True, "username": user.login}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@api_view(['POST'])
def save_github_token(request):
    """
    Save a GitHub Personal Access Token.
    """
    user = request.user
    token = request.data.get('token')
    if not token:
        return JsonResponse({"error": "Token is required"}, status=400)

    # Save or update the token
    github_token, created = GitHubToken.objects.update_or_create(
        user=user,
        defaults={"encrypted_token": token}
    )
    return JsonResponse({"message": "GitHub token saved successfully."}, status=200)

@api_view(['GET'])
def fetch_public_repos(request):
    """
    Fetch public repositories for the user's GitHub token.
    """
    user = request.user
    try:
        token = GitHubToken.objects.get(user=user).encrypted_token
        g = Github(token)
        repos = g.get_user().get_repos(visibility='public')
        data = [{"name": repo.name, "url": repo.html_url} for repo in repos]
        return JsonResponse(data, safe=False, status=200)
    except GitHubToken.DoesNotExist:
        return JsonResponse({"error": "GitHub token not found. Please add it in settings."}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@api_view(['GET'])
def analyze_repository(request, project_id):
    """
    Analyze the repository linked to a project.
    """
    try:
        project = Project.objects.get(id=project_id)
        if not project.github_repo:
            return JsonResponse({"error": "No repository linked to this project."}, status=400)

        # Placeholder for analysis logic
        summary = f"Repository {project.github_repo.name} analyzed successfully."
        suggestions = ["Improve documentation.", "Refactor large functions.", "Add unit tests."]
        return JsonResponse({"summary": summary, "suggestions": suggestions}, status=200)
    except Project.DoesNotExist:
        return JsonResponse({"error": "Project not found."}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@api_view(['POST'])
def create_repository(request):
    """
    Creates a GitHubRepository object if the repository exists on GitHub.
    """
    try:
        # Get the repository URL from the request
        name = request.data.get('name')
        if not name:
            return JsonResponse({"error": "Repository name is required."}, status=400)

        # Check if a GitHub token exists
        try:
            token = get_token()
        except GitHubToken.DoesNotExist:
            return JsonResponse({"error": "GitHub token not found."}, status=404)

        # Initialize the GitHub API client
        github_client = Github(token)

        # Check if the repository exists on GitHub
        try:
            repo = github_client.get_repo(name)
        except Exception as e:
            return JsonResponse({"error": f"Repository not found on GitHub: {str(e)}"}, status=404)

        token = get_token_obj()

        # Create the GitHubRepository object
        github_repo, created = GitHubRepository.objects.get_or_create(
            token=token,
            github_url=repo.html_url,
        )

        if created:
            return JsonResponse({"message": "Repository created successfully.", "repo_url": repo.html_url}, status=201)
        else:
            return JsonResponse({"message": "Repository already exists in the database.", "repo_url": repo.html_url}, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

