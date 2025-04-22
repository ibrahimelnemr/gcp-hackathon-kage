import os
import json
import re
import time
import datetime
import logging
import sys
from dotenv import load_dotenv
from typing import Dict, List, Optional, Tuple
from pydantic import BaseModel, Field, field_validator
from langchain_core.output_parsers import PydanticOutputParser
from langchain.output_parsers import OutputFixingParser
from langchain_core.prompts import PromptTemplate
import vertexai
from vertexai.generative_models import GenerativeModel, Part
from langchain_google_vertexai import ChatVertexAI 
from google.cloud import aiplatform

load_dotenv()

# Pydantic models
class Task(BaseModel):
    """Represents a single, concise task derived from the project description."""
    task_id: int = Field(description="A unique sequential identifier for the task.")
    description: str = Field(description="A clear and concise description of the task, suitable for one person to work on.")
    assigned_role_experience: str = Field(description="The experience level of the team member best suited for this task (e.g., Analyst, Consultant, Senior Consultant). Must match one of the keys in the input roles dictionary.")
    assigned_role_department: str = Field(description="The department of the team member best suited for this task (e.g., AI and Data, Cloud, Fullstack). Must match the department associated with the assigned experience level in the input roles dictionary.")
    rationale: str = Field(description="Brief justification for assigning this task to the specified role experience and department and why this specified role experience **and** department is best suited for")

class MissingRole(BaseModel):
    """Represents a role deemed missing for optimal project execution."""
    experience: str = Field(description="The suggested experience level for the missing role (e.g., Senior Consultant, Manager).")
    department: str = Field(description="The suggested department specialization for the missing role (e.g., Cybersecurity, UX/UI Design, DevOps).")
    reasoning: str = Field(description="Explanation why this role is needed for the project.")

class ProjectPlan(BaseModel):
    """The overall project plan containing tasks and identified missing roles."""
    tasks: List[Task] = Field(description="A list of all the broken-down project tasks.")
    missing_roles: List[MissingRole] = Field(description="A list of roles identified as potentially missing from the team for this project.", default=[])

    @field_validator('tasks')
    @classmethod
    def check_tasks_not_empty(cls, tasks_value: List[Task]) -> List[Task]:
        if not tasks_value:
            raise ValueError("The list of tasks cannot be empty.")
        return tasks_value



class Kage:
    def __init__(self):
        self.GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID")
        self.GCP_LOCATION = os.getenv("GCP_LOCATION", "us-central1")
        self.VERTEX_MODEL_NAME = os.getenv("VERTEX_MODEL_NAME", "gemini-1.5-flash-001")

        if not self.GCP_PROJECT_ID:
            raise ValueError("GCP Project ID not found. Please set GCP_PROJECT_ID in your .env file or environment.")

    def setup_logging(self, project_name: str) -> Tuple[logging.Logger, str]:
        try:
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            logs_dir = "logs"
            os.makedirs(logs_dir, exist_ok=True)

            log_filepath = os.path.join(logs_dir, f"kage_plan_{project_name}_{timestamp}.log")

            logger = logging.getLogger("kage_project_planner")
            logger.setLevel(logging.INFO)

            if logger.handlers:
                logger.handlers = []

            file_handler = logging.FileHandler(log_filepath)
            file_handler.setLevel(logging.INFO)
            console_handler = logging.StreamHandler(sys.stdout)
            console_handler.setLevel(logging.INFO)

            formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
            file_handler.setFormatter(formatter)
            console_handler.setFormatter(formatter)

            logger.addHandler(file_handler)
            logger.addHandler(console_handler)

            return logger, log_filepath

        except Exception as e:
            print(f"Error setting up logging: {e}")
            logger = logging.getLogger("kage_project_planner")
            logger.setLevel(logging.INFO)
            return logger, "kage_project_planner.log"

    def initialize_vertex_client(self, logger: logging.Logger) -> GenerativeModel:
        try:
            logger.info(f"Initializing Vertex AI client for project '{self.GCP_PROJECT_ID}' in location '{self.GCP_LOCATION}'")
            vertexai.init(project=self.GCP_PROJECT_ID, location=self.GCP_LOCATION)
            model = GenerativeModel(self.VERTEX_MODEL_NAME)
            logger.info(f"Vertex AI client initialized successfully with model '{self.VERTEX_MODEL_NAME}'.")
            return model
        except Exception as e:
            logger.error(f"Failed to initialize Vertex AI client: {e}")
            raise

    def create_kage_prompt(self, project_description: str, team_roles: Dict[str, str], logger: logging.Logger) -> str:
        logger.info("Creating KAGE project plan prompt")
        logger.info(team_roles)

        parser = PydanticOutputParser(pydantic_object=ProjectPlan)

        formatted_roles = "\n".join([f"- {exp}: {dep}" for exp, dep in team_roles.items()])
        if not formatted_roles:
            formatted_roles = "No team roles provided."

        experience_definitions = """
        **Experience Level Guidelines (Based on Company Structure):**
        *   **Analyst (0-2 years)**: Executes specific tasks.
        *   **Consultant (2-5 years)**: Executes tasks with less supervision.
        *   **Senior Consultant (3+ years)**: Provides oversight and integrates work.
        """

        prompt_template = PromptTemplate(
            template="""
            You are KAGE, an expert project management assistant. Your goal is to create a structured project plan.

            **Project Description:**
            {project_description}

            {experience_definitions}

            **Available Team Roles:**
            {team_roles}

            **Output JSON Schema:**
            {format_instructions}
            """,
            input_variables=["project_description", "team_roles"],
            partial_variables={
                "format_instructions": parser.get_format_instructions(),
                "experience_definitions": experience_definitions
            }
        )

        formatted_prompt = prompt_template.format(
            project_description=project_description,
            team_roles=formatted_roles
        )

        logger.info("KAGE project plan prompt created successfully.")
        return formatted_prompt

    def generate_kage_response(self, model: GenerativeModel, prompt: str, logger: logging.Logger) -> str:
        logger.info(f"Generating KAGE project plan response with model {model._model_name}")
        try:
            generation_config = {
                "temperature": 0.2,
                "max_output_tokens": 4096,
            }

            response = model.generate_content(prompt, generation_config=generation_config)
            logger.info("Successfully received response from Vertex AI API.")

            if hasattr(response, 'text'):
                return response.text
            elif response.candidates and response.candidates[0].content and response.candidates[0].content.parts:
                return response.candidates[0].content.parts[0].text
            else:
                logger.error("Could not extract text from Vertex AI response structure.")
                raise ValueError("Unable to extract text content from Vertex AI response.")
        except Exception as e:
            logger.error(f"Error generating KAGE response from Vertex AI: {str(e)}")
            raise

    def parse_kage_response(self, response_content: str, logger: logging.Logger) -> ProjectPlan:
        logger.info("Parsing KAGE project plan response")
        parser = PydanticOutputParser(pydantic_object=ProjectPlan)

        try:
            cleaned_response = re.sub(r'^```json\s*', '', response_content.strip(), flags=re.IGNORECASE)
            cleaned_response = re.sub(r'\s*```$', '', cleaned_response)

            match = re.search(r'\{.*\}', cleaned_response, re.DOTALL)
            json_str = match.group(0) if match else cleaned_response

            parsed_plan = parser.parse(json_str)
            logger.info(f"Successfully parsed KAGE plan with {len(parsed_plan.tasks)} tasks and {len(parsed_plan.missing_roles)} missing roles identified.")
            return parsed_plan
        except Exception as e:
            logger.error(f"Failed to parse the model response: {e}")
            raise ValueError(f"Failed to parse the model response into ProjectPlan structure. Error: {e}")

    def generate_project_plan(self, project_name: str, project_description: str, team_roles: Dict[str, str]) -> Dict:
        logger, log_file = self.setup_logging(project_name)
        logger.info(f"Starting KAGE project plan generation for: {project_name}")
        start_time = time.time()

        if not project_description:
            logger.error("Project description cannot be empty.")
            raise ValueError("Project description cannot be empty.")
        if not isinstance(team_roles, dict):
            logger.error("Team roles must be a dictionary.")
            raise ValueError("Team roles must be a dictionary.")

        output_dir = "output_plans"
        os.makedirs(output_dir, exist_ok=True)

        try:
            model = self.initialize_vertex_client(logger)
            prompt = self.create_kage_prompt(project_description, team_roles, logger)
            response_content = self.generate_kage_response(model, prompt, logger)
            project_plan_obj = self.parse_kage_response(response_content, logger)

            result_dict = project_plan_obj.model_dump()

            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            output_filename = f"plan_{project_name.replace(' ', '_')}_{timestamp}.json"
            output_filepath = os.path.join(output_dir, output_filename)

            final_output_data = {
                "input_parameters": {
                    "project_name": project_name,
                    "project_description": project_description,
                    "team_roles": team_roles
                },
                "generated_plan": result_dict
            }

            with open(output_filepath, 'w', encoding='utf-8') as f:
                json.dump(final_output_data, f, indent=4, ensure_ascii=False)
            logger.info(f"Successfully saved project plan with inputs to: {output_filepath}")

            end_time = time.time()
            logger.info(f"KAGE project plan generation completed in {end_time - start_time:.2f} seconds.")
            logger.info(f"Log file saved to: {log_file}")

            return result_dict
        except Exception as e:
            logger.error(f"KAGE project plan generation failed: {str(e)}")
            raise ValueError(f"KAGE project plan generation failed: {str(e)}")



if __name__ == "__main__":
    kage = Kage()
    
    team_roles= { 
        "Analyst 1": "AI and Data", 
        "Senior Consultant 1": "AI and Data",
        "Consultant 1": "Cloud", 
        "Senior Consultant 2": "Cloud",
        "Analyst 2": "Fullstack", 
        "Senior Consultant 3": "Fullstack"
        }
    
    name = {
        "dkjsakdsadjlsakd": "dsadsada",
        "dshadkjhsadkjhsad": "sdakhdksad"
    }
    
    team_roles2 = { 
        "Analyst": "AI and Data", 
        "Senior Consultant": "AI and Data",
        "Consultant": "Cloud",
        "Senior Consultant": "Cloud",
        "Analyst": "Fullstack", 
        "Senior Consultant": "Fullstack"
    }
    print(team_roles2)

    plan = kage.generate_project_plan(
                project_name="Company document comparison_V2",
                project_description=
                """Start Date: March 2025
                    Develop an AI agent that can extract text from a contract (word document) and compare it to a template. The AI agent must be able to compare the contract to the template and provide differences where the contract does not comply with the template and provide a proposal to the contract
                    Platform: Azure openai, Python backend, frontend.
                    Cloud:AWS. Requires AWS expertise for deployment and service integration.
                    Goal: Demonstrable proof-of-concept for company to test.
                    End Date: May 2025
                """,
                team_roles=team_roles
            )

