from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from ..models import GitHubToken
from ..utils import TokenEncryptor
from github import Github
import json

encryptor = TokenEncryptor()

def index(request):
    return JsonResponse({"message": "GitHub Integration API"})

def get_token():
    token_obj = GitHubToken.objects.first()
    if not token_obj:
        return None
    return encryptor.decrypt(token_obj.encrypted_token)

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
    Checks if a GitHub token exists and lists repositories if it does.
    """
    token = get_token()
    if not token:
        return JsonResponse({"exists": False}, status=200)

    try:
        g = Github(token)
        repos = g.get_user().get_repos()
        data = [{"name": r.name, "url": r.html_url, "description": r.description} for r in repos]
        return JsonResponse({"exists": True, "repos": data}, safe=False)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
