import os, json
import logging
from datetime import datetime
from github import Github
from github.ContentFile import ContentFile
from dotenv import load_dotenv
from typing import List, Dict
import vertexai
from vertexai.generative_models import GenerativeModel
import git
import tempfile


load_dotenv()

class AIAssist:
    def __init__(self):
        # Initialize GCP AI client
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getenv("AI_ASSIST_GOOGLE_APPLICATION_CREDENTIALS")
        load_dotenv()

        self.project_id = os.getenv("KAGE_GCP_PROJECT_ID")
        self.location = os.getenv("AI_ASSIST_GCP_LOCATION", "us-central1")
        self.model_name = os.getenv("AI_ASSIST_VERTEX_MODEL_NAME", "gemini-1.5-flash-002")
        self.github_token = os.getenv("GITHUB_PERSONAL_ACCESS_TOKEN")

        if not self.github_token:
            raise ValueError("GitHub personal access token not found in environment.")

        if not self.project_id:
            raise ValueError("GCP Project ID not found in environment.")

        # Initialize Vertex AI client using the same method as Kage
        vertexai.init(project=self.project_id, location=self.location)
        self.model = GenerativeModel(self.model_name)

        # Initialize GitHub client
        self.github_client = Github(self.github_token)

        # Ensure output directory exists
        self.output_dir = os.path.join(os.getcwd(), "output")
        os.makedirs(self.output_dir, exist_ok=True)

        # Set limits
        self.max_lines_per_file = 1000
        self.total_data_cap = 100 * 1024  # 100 KB

        response = self.model.generate_content("Hello")

        print(response)

    def is_code_file(self, file_name: str) -> bool:
        """
        Determine if a file is a code file based on its extension or name.
        """
        non_code_files = ["package-lock.json", "yarn.lock", ".gitignore"]
        code_extensions = [".py", ".js", ".ts", ".tsx", ".java", ".html", ".css", ".json"]

        # Extract the base name of the file
        base_name = os.path.basename(file_name)

        # Check if the base name matches any non-code files
        if base_name in non_code_files:
            return False

        # Check if the file has a valid code extension
        if any(file_name.endswith(ext) for ext in code_extensions):
            return True

        return False

    def fetch_repository_files(self, repo_url: str) -> List[Dict[str, str]]:
        """
        Fetch all files in the repository along with their full paths and content.
        """
        print(f"Fetching files from repository: {repo_url}")
        try:
            repo_name = repo_url.split("/")[-1]
            user = self.github_client.get_user()
            repo = user.get_repo(repo_name)

            files = []
            contents = repo.get_contents("")
            total_data_size = 0

            while contents:
                file = contents.pop(0)
                if file.type == "dir":
                    contents.extend(repo.get_contents(file.path))
                else:
                    if not self.is_code_file(file.path):
                        print(f"Skipping non-code file: {file.path}")
                        continue

                    try:
                        # Attempt to decode the file content as UTF-8
                        content = file.decoded_content.decode("utf-8")
                        num_lines = len(content.splitlines())
                        size = len(content.encode("utf-8"))

                        # Limit lines per file
                        if num_lines > self.max_lines_per_file:
                            content = "\n".join(content.splitlines()[:self.max_lines_per_file])
                            num_lines = self.max_lines_per_file
                            size = len(content.encode("utf-8"))

                        # Check total data cap
                        if total_data_size + size > self.total_data_cap:
                            print(f"Skipping file due to total data cap: {file.path}")
                            continue

                        total_data_size += size
                        print(f"Analyzed File: {file.path}, Lines: {num_lines}, Size: {size} bytes")
                        files.append({
                            "name": file.path,
                            "content": content
                        })
                    except UnicodeDecodeError:
                        # Skip binary files or handle them differently
                        logging.warning(f"Skipping binary file: {file.path}")
                        print(f"Skipped Binary File: {file.path}")
                        continue

            print(f"Total files fetched: {len(files)}")
            print(f"Total data size: {total_data_size} bytes")
            return files
        except Exception as e:
            raise ValueError(f"Error fetching repository files: {str(e)}")

    def write_output_to_file(self, repo_name: str, files: List[Dict[str, str]]):
        """
        Write the extracted data to a timestamped text file.
        """
        print(f"Writing output to file for repository: {repo_name}")
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = os.path.join(self.output_dir, f"ai_assist_{timestamp}.txt")

        with open(output_file, "w", encoding="utf-8") as f:
            f.write(f"Repository: {repo_name}\n")
            f.write(f"Timestamp: {timestamp}\n")
            f.write("=" * 80 + "\n\n")

            total_files = len(files)
            f.write(f"Total Files Analyzed: {total_files}\n\n")

            for file in files:
                num_lines = len(file["content"].splitlines())
                size = len(file["content"].encode("utf-8"))
                f.write(f"File: {file['name']}\n")
                f.write(f"Number of Lines: {num_lines}\n")
                f.write(f"Size: {size} bytes\n")
                f.write("-" * 40 + "\n")
                f.write(file["content"] + "\n")
                f.write("=" * 80 + "\n\n")

        print(f"Output written to: {output_file}")
        logging.info(f"Output written to {output_file}")

    def write_model_response_to_file(self, repo_name: str, response: str, task_description: str = None):
        """
        Write the AI model's response to a timestamped text file.
        """
        print(f"Writing model response to file for repository: {repo_name}")
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = os.path.join(self.output_dir, f"ai_assist_response_{timestamp}.txt")

        with open(output_file, "w", encoding="utf-8") as f:
            f.write(f"Repository: {repo_name}\n")
            f.write(f"Timestamp: {timestamp}\n")
            if task_description:
                f.write(f"Task Description: {task_description}\n")
            f.write("=" * 80 + "\n\n")
            f.write("AI Model Response:\n")
            f.write(response)

        print(f"Model response written to: {output_file}")
        logging.info(f"Model response written to {output_file}")

    def create_prompt(self, repo_name: str, files: List[Dict[str, str]]) -> str:
        """
        Create a prompt for the Gemini AI model to analyze the repository.
        """
        print(f"Creating prompt for repository: {repo_name}")
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

    def create_prompt_for_json_changes(self, repo_name: str, files: List[Dict[str, str]], task_description: str) -> str:
        """
        Create a prompt for the Gemini AI model to output changes in JSON format.
        """
        file_list = "\n".join(f"- {file['name']}" for file in files)  # Fixed list comprehension
        prompt = f"""
        You are an expert software engineer and repository analyzer. Your task is to analyze the repository "{repo_name}" and provide changes to meet the following task:

        **Task Description:**
        {task_description}

        **Repository Structure:**
        {file_list}

        **Instructions:**
        1. Provide the changes required to meet the task in JSON format.
        2. Do not include any Markdown indicators like ```json or ``` in your response.
        3. Each object in the JSON array should represent a change with the following fields:
           - "file_path": The path to the file to be modified.
           - "line_number": The line number where the change should be made.
           - "action": Either "add" or "remove".
           - "content": The content to add (only for "add" actions).

        **Example Output:**
        [
            {{
                "file_path": "src/index.html",
                "line_number": 3,
                "action": "add",
                "content": "<meta name='viewport' content='width=device-width, initial-scale=1.0'>"
            }},
            {{
                "file_path": "src/index.html",
                "line_number": 5,
                "action": "remove"
            }}
        ]
        """
        return prompt

    def analyze_repository(self, repo_url: str) -> Dict:
        """
        Analyze the repository and return tasks and refactors.
        """
        print(f"Starting analysis for repository: {repo_url}")
        try:
            # Fetch repository files
            repo_name = repo_url.split("/")[-1]
            files = self.fetch_repository_files(repo_url)

            # Write extracted data to output file
            self.write_output_to_file(repo_name, files)

            # Create prompt
            prompt = self.create_prompt(repo_name, files)

            # Generate response from Gemini AI
            print("Generating AI response...")
            generation_config = {
                "temperature": 0.2,
                "max_output_tokens": 4096,
            }
            response = self.model.generate_content(prompt, generation_config=generation_config)

            # Parse response
            if hasattr(response, "text"):
                print("AI response generated successfully.")
                self.write_model_response_to_file(repo_name, response.text)
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
                self.write_model_response_to_file(repo_name, response.text, task_description)
                return response.text
            else:
                raise ValueError("Failed to generate Git diff from Gemini AI.")
        except Exception as e:
            raise ValueError(f"Error generating Git diff: {str(e)}")

    def generate_json_changes(self, repo_url: str, task_description: str) -> str:
        """
        Generate a JSON document for the given task description.
        """
        try:
            # Fetch repository files
            repo_name = repo_url.split("/")[-1]
            files = self.fetch_repository_files(repo_url)

            # Create prompt
            prompt = self.create_prompt_for_json_changes(repo_name, files, task_description)

            # Generate response from Gemini AI
            generation_config = {
                "temperature": 0.2,
                "max_output_tokens": 4096,
            }
            response = self.model.generate_content(prompt, generation_config=generation_config)

            # Parse response
            if hasattr(response, "text"):
                self.write_model_response_to_file(repo_name, response.text, task_description)
                return response.text
            else:
                raise ValueError("Failed to generate JSON changes from Gemini AI.")
        except Exception as e:
            raise ValueError(f"Error generating JSON changes: {str(e)}")

    def apply_git_diff_and_commit(self, repo_url: str, git_diff: str, task_description: str):
        """
        Apply the Git diff to the repository, validate changes, and push them to GitHub.
        """
        try:
            repo_name = repo_url.split("/")[-1]
            user = self.github_client.get_user()
            repo = user.get_repo(repo_name)

            # Parse the Git diff and validate changes
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
                try:
                    file = repo.get_contents(file_path)
                    current_content = file.decoded_content.decode("utf-8")

                    # Validate the diff context
                    if not current_content.startswith("\n".join(lines[2:])):
                        print(f"Skipping file {file_path} due to mismatched context.")
                        continue

                    # Update the file
                    repo.update_file(
                        path=file_path,
                        message=f"AI-generated changes for {file_path}: {task_description}",
                        content="\n".join(new_content),
                        sha=file.sha
                    )
                    print(f"Updated file: {file_path}")
                except Exception as e:
                    # If the file does not exist, create it
                    repo.create_file(
                        path=file_path,
                        message=f"AI-generated changes for {file_path}: {task_description}",
                        content="\n".join(new_content)
                    )
                    print(f"Created new file: {file_path}")

            print("All changes committed and pushed to the repository.")

        except Exception as e:
            raise ValueError(f"Error applying Git diff and committing changes: {str(e)}")

    def apply_git_diff_and_commit_gitpython(self, repo_url: str, git_diff: str, task_description: str):
        """
        Apply the Git diff to the repository, commit the changes, and push them to GitHub using gitpython.
        """
        try:
            # Extract repository name and owner
            repo_name = repo_url.split("/")[-1]
            repo_owner = repo_url.split("/")[-2]

            # Clone the repository to a specific directory
            clone_dir = os.path.abspath(os.path.join("backend", "cloned_repos", repo_name))
            if os.path.exists(clone_dir):
                print(f"Deleting existing directory: {clone_dir}")
                import shutil
                shutil.rmtree(clone_dir)

            print(f"Cloning repository {repo_url} to {clone_dir}...")
            repo = git.Repo.clone_from(repo_url, clone_dir, branch="main")

            # Set Git user configuration
            print("Configuring Git user...")
            repo.config_writer().set_value("user", "name", "AI Assistant").release()
            repo.config_writer().set_value("user", "email", "ai-assistant@example.com").release()

            # Clean up the Git diff to remove trailing whitespace
            cleaned_diff = "\n".join(line.rstrip() for line in git_diff.splitlines())

            # Save the Git diff as a patch file
            patch_file_path = os.path.join(clone_dir, "temp_diff.patch")
            print(f"Saving Git diff as a patch file at: {patch_file_path}")
            with open(patch_file_path, "w") as patch_file:
                patch_file.write(cleaned_diff)

            # Verify that the patch file exists
            if not os.path.exists(patch_file_path):
                raise FileNotFoundError(f"Patch file not found at: {patch_file_path}")

            # Debug: Log the patch content
            print("Patch file content:")
            with open(patch_file_path, "r") as patch_file:
                print(patch_file.read())

            # Apply the patch using `git apply`
            print("Applying Git diff using `git apply`...")
            try:
                repo.git.apply(patch_file_path)
                print("Git diff applied successfully using `git apply`.")
            except Exception as e:
                raise ValueError(f"Error applying Git diff using `git apply`: {str(e)}")

            # Commit the changes
            print("Committing changes...")
            repo.git.add(A=True)  # Stage all changes
            repo.git.commit(m=f"AI-generated changes for task: {task_description}")
            print("Changes committed successfully.")

            # Push the changes
            print("Pushing changes to GitHub...")
            origin = repo.remote(name="origin")
            origin.push()
            print("Changes pushed to GitHub successfully.")

            # Clean up the cloned repository
            print(f"Deleting cloned repository: {clone_dir}")
            import shutil
            shutil.rmtree(clone_dir)

        except Exception as e:
            raise ValueError(f"Error applying Git diff and committing changes using gitpython: {str(e)}")

    def test_simple_commit(self, repo_url: str):
        """
        Test the ability to commit and push changes by creating a simple test.txt file in the root folder of the repository.
        """
        try:
            repo_name = repo_url.split("/")[-1]
            user = self.github_client.get_user()
            repo = user.get_repo(repo_name)

            # File details
            file_path = "test.txt"
            file_content = "This is a test file created to verify commit and push functionality."
            commit_message = "Test commit: Adding test.txt file"

            # Check if the file already exists
            try:
                existing_file = repo.get_contents(file_path)
                # Update the file if it exists
                repo.update_file(
                    path=file_path,
                    message=commit_message,
                    content=file_content,
                    sha=existing_file.sha
                )
                print(f"Updated existing file: {file_path}")
            except Exception:
                # Create the file if it does not exist
                repo.create_file(
                    path=file_path,
                    message=commit_message,
                    content=file_content
                )
                print(f"Created new file: {file_path}")

            print("Test commit and push completed successfully.")

        except Exception as e:
            raise ValueError(f"Error during test commit: {str(e)}")
    
    @classmethod
    def sanitize_json_content(cls, json_content: str) -> str:
        """
        Sanitize the JSON content by removing Markdown indicators like ```json and ```.

        Args:
            json_content (str): The raw JSON content.

        Returns:
            str: The sanitized JSON content.
        """
        # Remove Markdown indicators
        sanitized_content = json_content.strip()
        if sanitized_content.startswith("```json"):
            sanitized_content = sanitized_content[7:]  # Remove the leading ```json
        if sanitized_content.endswith("```"):
            sanitized_content = sanitized_content[:-3]  # Remove the trailing ```
        return sanitized_content.strip()

    def save_json_to_file(self, repo_name: str, json_data: str):
        """
        Save the JSON document to the output directory.
        """
        print(f"Saving JSON document for repository: {repo_name}")
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = os.path.join(self.output_dir, f"ai_assist_json_{timestamp}.json")

        with open(output_file, "w", encoding="utf-8") as f:
            f.write(json_data)

        print(f"JSON document saved to: {output_file}")
        return output_file

    def parse_json_file(self, json_file_path: str) -> List[Dict[str, str]]:
        """
        Parse the JSON document from the file.

        Args:
            json_file_path (str): The path to the JSON file.

        Returns:
            List[Dict[str, str]]: The parsed JSON content.
        """
        print(f"Parsing JSON document from: {json_file_path}")
        with open(json_file_path, "r", encoding="utf-8") as f:
            raw_content = f.read()
            sanitized_content = AIAssist.sanitize_json_content(raw_content)  # Call as class method
            return json.loads(sanitized_content)

    def apply_changes_with_pygithub(self, repo_url: str, changes: List[Dict[str, str]]):
        """
        Apply changes using PyGithub.
        """
        try:
            repo_name = repo_url.split("/")[-1]
            user = self.github_client.get_user()
            repo = user.get_repo(repo_name)

            for change in changes:
                file_path = change["file_path"]
                line_number = change["line_number"]
                action = change["action"]
                content = change.get("content", "")

                # Fetch the file
                file = repo.get_contents(file_path)
                current_content = file.decoded_content.decode("utf-8")
                lines = current_content.splitlines()

                # Apply the change
                if action == "add":
                    lines.insert(line_number - 1, content)
                elif action == "remove":
                    lines.pop(line_number - 1)

                # Update the file
                updated_content = "\n".join(lines)
                repo.update_file(
                    path=file_path,
                    message=f"AI-generated change for {file_path}",
                    content=updated_content,
                    sha=file.sha
                )
                print(f"Updated file: {file_path}")

        except Exception as e:
            raise ValueError(f"Error applying changes with PyGithub: {str(e)}")

    def apply_changes_with_gitpython(self, repo_url: str, changes: List[Dict[str, str]]):
        """
        Apply changes using GitPython.
        """
        try:
            repo_name = repo_url.split("/")[-1]
            clone_dir = os.path.abspath(os.path.join("backend", "cloned_repos", repo_name))
            if os.path.exists(clone_dir):
                import shutil
                shutil.rmtree(clone_dir)

            print(f"Cloning repository {repo_url} to {clone_dir}...")
            repo = git.Repo.clone_from(repo_url, clone_dir, branch="main")

            for change in changes:
                file_path = os.path.join(clone_dir, change["file_path"])
                line_number = change["line_number"]
                action = change["action"]
                content = change.get("content", "")

                # Read the file
                with open(file_path, "r", encoding="utf-8") as f:
                    lines = f.readlines()

                # Apply the change
                if action == "add":
                    lines.insert(line_number - 1, content + "\n")
                elif action == "remove":
                    lines.pop(line_number - 1)

                # Write the updated content back to the file
                with open(file_path, "w", encoding="utf-8") as f:
                    f.writelines(lines)

                print(f"Updated file: {file_path}")

            # Commit and push changes
            repo.git.add(A=True)
            repo.git.commit(m="AI-generated changes")
            repo.remote(name="origin").push()
            print("Changes pushed to GitHub successfully.")

        except Exception as e:
            raise ValueError(f"Error applying changes with GitPython: {str(e)}")



if __name__ == "__main__":
    analyzer = AIAssist()
    repo_url = "https://github.com/ibrahimelnemr/mern-exercise-tracker-mongodb"

    # Task description for AI Assist
    task_description = (
        "Add Validation and Error Handling for Exercise Creation. "
        "Enhance the backend API and frontend form logic for creating exercises to include robust validation and user-friendly error handling."
    )

    # Generate JSON changes for the task
    print("\nGenerating JSON changes for the task...")
    try:
        json_changes = analyzer.generate_json_changes(repo_url, task_description)
        print("Generated JSON Changes:")
        print(json_changes)

        # Save the JSON document to the output directory
        json_file_path = analyzer.save_json_to_file(repo_url.split("/")[-1], json_changes)

        # Parse the JSON document
        print("\nParsing JSON document...")
        changes = analyzer.parse_json_file(json_file_path)

        # Apply the changes using PyGithub
        print("\nApplying changes using PyGithub...")
        analyzer.apply_changes_with_pygithub(repo_url, changes)
        print("Changes applied successfully using PyGithub.")

        # Apply the changes using GitPython
        print("\nApplying changes using GitPython...")
        analyzer.apply_changes_with_gitpython(repo_url, changes)
        print("Changes applied successfully using GitPython.")

    except Exception as e:
        print(f"Error generating or applying JSON changes: {e}")