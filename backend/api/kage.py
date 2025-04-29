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

    def create_kage_prompt(self, project_description: str, team_roles: List[Dict[str, str]], logger: logging.Logger) -> str:
        logger.info("Creating KAGE project plan prompt")
        logger.info(team_roles)

        parser = PydanticOutputParser(pydantic_object=ProjectPlan)

        # Format team_roles as a list of strings
        formatted_roles = "\n".join(
            [f"- {role['name']} (Level: {role['level']}, Department: {role['department']})" for role in team_roles]
        )
        if not formatted_roles:
            formatted_roles = "No team roles provided."

        experience_definitions = """
        **Experience Level Guidelines (Based on Company Structure):**

        *   **Analyst (Typically 0-2 years company experience):**
            *   Focus: Primarily executes specific, assigned tasks within their department.
            *   Oversight: Requires guidance and reports to the most senior role from their *same department* who is assigned to the project. This senior role must be *at least* a Senior Consultant level.

        *   **Consultant (Typically 2-5 years company experience):**
            *   Focus: A more experienced Analyst, expected to execute assigned tasks with higher proficiency and potentially less direct supervision than an Analyst. Still primarily focused on execution within their department.
            *   Oversight: Also reports to the most senior role from their same department (Senior Consultant or higher) for guidance and review. *Potentially could take on oversight if senior role is absent and capability/willingness is confirmed.

        *   **Senior Consultant (Typically 3+ years company experience):**
            *   Focus: Works on combining the input of the lower experience levels into a professional clean "final product". **Does not work on their own tasks**, they merely help put everything together.
            *   Oversight Role: **Provides guidance and oversight** for Analysts and Consultants within their *same department* on the project. This is the minimum level required for this departmental oversight function.
            *   Contribution: Expected to deliver high-quality work and potentially lead specific technical areas or workstreams within their department's scope.

        *   **Senior Oversight / Lead Role (Often a Senior Consultant or Manager):**
            *   Focus: This function (which might be fulfilled by the most senior person present, e.g., a lead Senior Consultant) is responsible for compiling and integrating the work produced by their department members on the project.
            *   Responsibility: Ensures the department's output is neat, concise, consistent, and meets quality standards before being considered "final" for integration with other project parts. May involve reviewing work, coordinating tasks within the department, and potentially managing the departmental workload for the project.

        *(Use these specific guidelines to interpret roles, assign tasks, and identify missing roles/oversight.)*
        """

        prompt_template = PromptTemplate(
            template="""
            You are KAGE, an expert project management assistant. Your goal is to create a structured project plan by first decomposing the work, then assigning it to the available team, and finally identifying any gaps including workload imbalances.

            **Project Description:**
            {project_description}

            {experience_definitions}

            **Available Team Roles (Name, Level, Department):**
            {team_roles}

            **Instructions - Follow these steps SEQUENTIALLY:**

            1.  **Decompose Project into Tasks (Team Independent):**
                *   Analyze the **Project Description** *only*.
                *   Break down the project into a list of concise, actionable tasks. Each task should represent a logical chunk of work ideally manageable by a single person.
                *   **Do NOT consider the 'Available Team Roles' during this decomposition step.** Focus solely on the work required by the project itself.
                *   Assign a unique sequential 'task_id' starting from 1 to each decomposed task.

            2.  **Assign Decomposed Tasks to Available Roles:**
                *   Now, take the list of tasks created in Step 1.
                *   For *each* task, attempt to assign it to the *most suitable* team member profile from the 'Available Team Roles' list (anything to do with data extraction or AI should be assigned to AI and Data for example).
                *   Base the assignment on the task's nature, its inferred skill requirements, and the 'Experience Level Guidelines' provided above.
                *   Use the exact Name, Level, and Department strings from the 'Available Team Roles' when assigning.
                *   Provide a 'rationale' for each task assignment, explaining *why* that specific role profile is the best fit from the available options, or noting if the fit isn't perfect but is the closest available.

            3.  **Identify Missing Roles, Skills, Oversight, and Workload Gaps:**
                *   Analyze the task list (Step 1) and assignments (Step 2) against 'Available Team Roles'.
                *   **(a) Skill/Department Gaps:** Identify critical skills/departments needed for tasks but completely absent in the team. Recommend adding appropriate roles (Name, Level, Department).
                *   **(b) Oversight Gaps:** Verify required Senior Consultant (or higher) oversight for departments with assigned Analysts/Consultants. If missing, recommend adding a 'Senior Consultant' for that department, noting the Consultant alternative if applicable (needs confirmation).
                *   **(c) Workload Imbalance Analysis:**
                    i.  **Count Tasks per Unique Role:** For each unique role key in 'Available Team Roles', count how many tasks were assigned to it in Step 2.
                    ii. **Identify Potential Overload:** Pay close attention to any unique role key assigned a high number of tasks - **consider 2 or more tasks as potentially high load**, adjust based on task nature. Also consider if a junior role (Analyst) is assigned many complex tasks. **No analyst should have more than 2 tasks** so suggest more analysts if need be.
                    iii.**Check for Reassignment:** Before recommending new hires *purely* for workload, check: Could any tasks assigned to an identified overloaded role be *reasonably* reassigned to another *existing* unique role key that has significantly fewer tasks assigned, even if the skill fit is slightly less perfect? Note this possibility if applicable.
                    iv. **Recommend Additions for Workload:** If reassignment is not feasible or insufficient, and a role/department remains overloaded (based on task count or complexity for role level), **recommend adding another specific role** (typically 'Analyst' or 'Consultant') to that department.
                    v.  **Mandatory Reasoning:** The 'reasoning' for any role recommended *due to workload* **must explicitly state** "Workload balancing for [Department Name]", mention the overloaded role(s) (e.g., "to support [Unique Role Key]"), and ideally reference the high task count (e.g., "due to high task count assigned"). If suggesting reassignment was considered, mention that briefly in the reasoning for adding the new role (e.g., "...reassignment insufficient").
                *   Combine all findings (a, b, c) into the `missing_roles` list. Provide clear 'reasoning' for each suggestion per the instructions.
                *   If no gaps found, provide an empty list for `missing_roles`.

            4.  **Output Format:** Structure your entire response strictly as a JSON object conforming to the following schema. Do **not** include any text outside the JSON structure.

            **Output JSON Schema:**
            {format_instructions}

            Generate the project plan now.
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
            logger.info(response);

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

    def generate_project_plan(self, project_name: str, project_description: str, team_roles: List[Dict[str, str]]) -> Dict:
        logger, log_file = self.setup_logging(project_name)
        logger.info(f"Starting KAGE project plan generation for: {project_name}")
        start_time = time.time()

        if not project_description:
            logger.error("Project description cannot be empty.")
            raise ValueError("Project description cannot be empty.")
        if not isinstance(team_roles, list):
            logger.error("Team roles must be a list of objects.")
            raise ValueError("Team roles must be a list of objects.")

        # Validate team_roles format
        for role in team_roles:
            if not all(key in role for key in ["name", "level", "department"]):
                logger.error("Each team role must have 'name', 'level', and 'department' fields.")
                raise ValueError("Each team role must have 'name', 'level', and 'department' fields.")

        output_dir = "output_plans"
        os.makedirs(output_dir, exist_ok=True)

        try:
            model = self.initialize_vertex_client(logger)
            prompt = self.create_kage_prompt(project_description, team_roles, logger)
            response_content = self.generate_kage_response(model, prompt, logger)
            project_plan_obj = self.parse_kage_response(response_content, logger)

            # Format employees correctly
            employees = [
                {"name": role["name"], "level": role["level"], "department": role["department"]}
                for role in team_roles
            ]

            # Format tasks correctly
            tasks = [
                {
                    "description": task.description,
                    "status": "pending",  # Default status
                    "assigned_role_experience": task.assigned_role_experience,
                    "assigned_role_department": task.assigned_role_department,
                }
                for task in project_plan_obj.tasks
            ]

            # Format project details
            project = {
                "name": project_name,
                "description": project_description,
            }

            final_output_data = {
                "project": project,
                "employees": employees,
                "tasks": tasks,
            }

            # Save the output to a file
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            output_filename = f"plan_{project_name.replace(' ', '_')}_{timestamp}.json"
            output_filepath = os.path.join(output_dir, output_filename)

            with open(output_filepath, 'w', encoding='utf-8') as f:
                json.dump(final_output_data, f, indent=4, ensure_ascii=False)
            logger.info(f"Successfully saved project plan with inputs to: {output_filepath}")

            end_time = time.time()
            logger.info(f"KAGE project plan generation completed in {end_time - start_time:.2f} seconds.")
            logger.info(f"Log file saved to: {log_file}")

            return final_output_data
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

