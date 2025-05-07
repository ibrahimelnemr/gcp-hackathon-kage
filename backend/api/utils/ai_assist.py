import os
import logging
from github import Github
from github.ContentFile import ContentFile
from google.cloud import aiplatform
from vertexai.generative_models import GenerativeModel
from dotenv import load_dotenv
from typing import List, Dict

load_dotenv()

class AIAssist:
    def __init__(self):
        # Initialize GCP AI client
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getenv("AI_ASSIST_GOOGLE_APPLICATION_CREDENTIALS")
        
        load_dotenv()

        self.project_id = os.getenv("GCP_PROJECT_ID")
        self.location = os.getenv("GCP_LOCATION", "us-central1")
        self.model_name = os.getenv("GEMINI_MODEL_NAME", "gemini-1.5-flash-001")
        self.github_token = os.getenv("GITHUB_PERSONAL_ACCESS_TOKEN")

        if not self.github_token:
            raise ValueError("GitHub personal access token not found in environment.")

        if not self.project_id:
            raise ValueError("GCP Project ID not found in environment.")

        aiplatform.init(project=self.project_id, location=self.location)
        self.model = GenerativeModel(self.model_name)

        # Initialize GitHub client
        self.github_client = Github(self.github_token)

    def fetch_repository_files(self, repo_url: str) -> List[Dict[str, str]]:
        """
        Fetch all files in the repository along with their full paths and content.
        """
        try:
            repo_name = repo_url.split("/")[-1]
            user = self.github_client.get_user()
            repo = user.get_repo(repo_name)

            files = []
            contents = repo.get_contents("")
            while contents:
                file = contents.pop(0)
                if file.type == "dir":
                    contents.extend(repo.get_contents(file.path))
                else:
                    files.append({
                        "name": file.path,
                        "content": file.decoded_content.decode("utf-8")
                    })

            return files
        except Exception as e:
            raise ValueError(f"Error fetching repository files: {str(e)}")

    def create_prompt(self, repo_name: str, files: List[Dict[str, str]]) -> str:
        """
        Create a prompt for the Gemini AI model to analyze the repository.
        """
        file_list = "\n".join([f"- {file['name']}" for file in files])
        prompt = f"""
        You are an expert software engineer and repository analyzer. Your task is to analyze the repository "{repo_name}" and provide insights.

        **Repository Structure:**
        {file_list}

        **Instructions:**
        1. Identify potential tasks that can be done to improve this repository.
        2. Suggest refactors or improvements for the codebase.
        3. Provide your response in a structured JSON format with two keys:
           - "tasks": A list of tasks with descriptions.
           - "refactors": A list of suggested refactors with explanations.

        **Example Output:**
        {{
            "tasks": [
                {{"description": "Add unit tests for critical modules."}},
                {{"description": "Improve documentation for the API endpoints."}}
            ],
            "refactors": [
                {{"description": "Refactor the authentication module to use middleware."}},
                {{"description": "Optimize database queries in the user service."}}
            ]
        }}
        """
        return prompt

    def create_prompt_for_task(self, repo_name: str, files: List[Dict[str, str]], task_description: str) -> str:
        """
        Create a prompt for the Gemini AI model to analyze the repository and suggest changes for a specific task.
        """
        file_list = "\n".join([f"- {file['name']}" for file in files])
        prompt = f"""
        You are an expert software engineer and repository analyzer. Your task is to analyze the repository "{repo_name}" and provide changes to meet the following task:

        **Task Description:**
        {task_description}

        **Repository Structure:**
        {file_list}

        **Instructions:**
        1. Provide the changes required to meet the task in the form of a Git diff.
        2. Ensure the output is parseable and includes only the necessary changes.

        **Example Output:**
        ```
        diff --git a/src/index.html b/src/index.html
        --- a/src/index.html
        +++ b/src/index.html
        @@ -1,3 +1,4 @@
        +<meta name="viewport" content="width=device-width, initial-scale=1.0">
        ```
        """
        return prompt

    def analyze_repository(self, repo_url: str) -> Dict:
        """
        Analyze the repository and return tasks and refactors.
        """
        try:
            # Fetch repository files
            repo_name = repo_url.split("/")[-1]
            files = self.fetch_repository_files(repo_url)

            # Create prompt
            prompt = self.create_prompt(repo_name, files)

            # Generate response from Gemini AI
            generation_config = {
                "temperature": 0.2,
                "max_output_tokens": 4096,
            }
            response = self.model.generate_content(prompt, generation_config=generation_config)

            # Parse response
            if hasattr(response, "text"):
                return response.text
            else:
                raise ValueError("Failed to generate response from Gemini AI.")
        except Exception as e:
            raise ValueError(f"Error analyzing repository: {str(e)}")

    def generate_git_diff(self, repo_url: str, task_description: str) -> str:
        """
        Generate a Git diff for the given task description.
        """
        try:
            # Fetch repository files
            repo_name = repo_url.split("/")[-1]
            files = self.fetch_repository_files(repo_url)

            # Create prompt
            prompt = self.create_prompt_for_task(repo_name, files, task_description)

            # Generate response from Gemini AI
            generation_config = {
                "temperature": 0.2,
                "max_output_tokens": 4096,
            }
            response = self.model.generate_content(prompt, generation_config=generation_config)

            # Parse response
            if hasattr(response, "text"):
                return response.text
            else:
                raise ValueError("Failed to generate Git diff from Gemini AI.")
        except Exception as e:
            raise ValueError(f"Error generating Git diff: {str(e)}")

    def apply_git_diff_and_commit(self, repo_url: str, git_diff: str, task_description: str):
        """
        Apply the Git diff to the repository and commit the changes.
        """
        try:
            repo_name = repo_url.split("/")[-1]
            user = self.github_client.get_user()
            repo = user.get_repo(repo_name)

            # Parse the Git diff and apply changes
            for diff in git_diff.split("diff --git")[1:]:
                lines = diff.strip().split("\n")
                file_path = lines[0].split(" ")[1][2:]  # Extract file path from diff header
                new_content = []

                for line in lines[2:]:
                    if line.startswith("+") and not line.startswith("+++"):
                        new_content.append(line[1:])
                    elif not line.startswith("-") and not line.startswith("@@"):
                        new_content.append(line)

                # Fetch the file from the repository
                file = repo.get_contents(file_path)
                repo.update_file(
                    path=file_path,
                    message=f"AI-generated changes for task: {task_description}",
                    content="\n".join(new_content),
                    sha=file.sha
                )

        except Exception as e:
            raise ValueError(f"Error applying Git diff and committing changes: {str(e)}")

if __name__ == "__main__":
    analyzer = AIAssist()
    repo_url = "https://github.com/username/repository-name"
    result = analyzer.analyze_repository(repo_url)
    print(result)