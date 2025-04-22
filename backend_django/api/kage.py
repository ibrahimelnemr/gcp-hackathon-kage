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

GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID")
GCP_LOCATION = os.getenv("GCP_LOCATION", "us-central1") 
VERTEX_MODEL_NAME = os.getenv("VERTEX_MODEL_NAME", "gemini-1.5-flash-001")

if not GCP_PROJECT_ID:
    raise ValueError("GCP Project ID not found. Please set GCP_PROJECT_ID in your .env file or environment.")


class Task(BaseModel):
    task_id: int
    description: str
    assigned_role_experience: str
    assigned_role_department: str
    rationale: str


class MissingRole(BaseModel):
    experience: str
    department: str
    reasoning: str


class ProjectPlan(BaseModel):
    tasks: List[Task]
    missing_roles: List[MissingRole] = Field(default=[])

    @field_validator('tasks')
    @classmethod
    def check_tasks_not_empty(cls, tasks_value: List[Task]) -> List[Task]:
        if not tasks_value:
            raise ValueError("The list of tasks cannot be empty.")
        return tasks_value


class Kage:
    def __init__(self, project_name: str):
        self.project_name = project_name
        self.logger, _ = self._setup_logging(project_name)
        self.model = self._initialize_vertex_client()

    def _setup_logging(self, project_name: str) -> Tuple[logging.Logger, str]:
        try:
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            logs_dir = "logs"
            if not os.path.exists(logs_dir):
                os.makedirs(logs_dir)

            log_filepath = os.path.join(logs_dir, f"kage_plan_{project_name}_{timestamp}.log")

            logger = logging.getLogger(f"kage_{project_name}")
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

    def _initialize_vertex_client(self) -> GenerativeModel:
        try:
            self.logger.info(f"Initializing Vertex AI client for project '{GCP_PROJECT_ID}' in location '{GCP_LOCATION}'")
            vertexai.init(project=GCP_PROJECT_ID, location=GCP_LOCATION)
            model = GenerativeModel(VERTEX_MODEL_NAME)
            self.logger.info(f"Vertex AI client initialized successfully with model '{VERTEX_MODEL_NAME}'.")
            return model
        except Exception as e:
            self.logger.error(f"Failed to initialize Vertex AI client: {e}")
            raise

    def _create_prompt(self, project_description: str, team_roles: Dict[str, str]) -> str:
        self.logger.info("Creating KAGE project plan prompt")
        self.logger.info(team_roles)

        formatted_roles = "\n".join([f"- {exp}: {dep}" for exp, dep in team_roles.items()])
        if not formatted_roles:
            formatted_roles = "No team roles provided."

        experience_definitions = """[...TRUNCATED EXPERIENCE DEFINITIONS FOR BREVITY...]"""

        prompt_template = PromptTemplate(
            template="""
            You are KAGE, an expert project management assistant...
            **Project Description:**
            {project_description}

            {experience_definitions}

            **Available Team Roles (Experience: Department):**
            {team_roles}

            **Instructions - Follow these steps SEQUENTIALLY:**
            [...]
            """,
            input_variables=["project_description", "team_roles", "experience_definitions"]
        )

        return prompt_template.format(
            project_description=project_description,
            team_roles=formatted_roles,
            experience_definitions=experience_definitions
        )

    def generate_plan(self, project_description: str, team_roles: Dict[str, str]) -> ProjectPlan:
        self.logger.info("Generating project plan")

        parser = PydanticOutputParser(pydantic_object=ProjectPlan)
        prompt = self._create_prompt(project_description, team_roles)
        self.logger.info("Sending prompt to Vertex AI model")

        try:
            response = self.model.generate_content(
                prompt,
                generation_config={"temperature": 0.4, "max_output_tokens": 2048}
            )
            raw_output = response.text
            self.logger.info("Model response received")

            # Try to parse the model output
            try:
                plan = parser.parse(raw_output)
                self.logger.info("Output successfully parsed")
                return plan
            except Exception as e:
                self.logger.warning(f"Initial parse failed, trying OutputFixingParser: {e}")
                fixer = OutputFixingParser.from_llm(parser=parser, llm=ChatVertexAI())
                return fixer.parse(raw_output)

        except Exception as e:
            self.logger.error(f"Failed to generate plan: {e}")
            raise
