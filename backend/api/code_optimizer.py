from google.cloud import aiplatform
import requests
# Initialize Vertex AI
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

from google import genai
from google.genai import types
import base64

class CodeOptimizer:
    def __init__(self):
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getenv("CODE_OPTIMIZER_GOOGLE_APPLICATION_CREDENTIALS")
        load_dotenv()

        self.client = genai.Client(
            vertexai=True,
            project=os.getenv("CODE_OPTIMIZER_GCP_PROJECT_ID"),
            location=os.getenv("CODE_OPTIMIZER_GCP_LOCATION"),
        )

    def generate(self, input):
        model = "projects/{}/locations/{}/endpoints/124751688799092736".format(
            os.getenv("CODE_OPTIMIZER_GCP_PROJECT_ID"),
            os.getenv("CODE_OPTIMIZER_GCP_LOCATION"),
        )

        contents = [
            types.Content(
                role="user",
                parts=[{"text": f"{input} In your output, make a clear distinction between the code and the explanation. Use the format: 'Code: ... Explanation: ...'"}]
            )
        ]
        generate_content_config = types.GenerateContentConfig(
            temperature=1,
            top_p=0.95,
            max_output_tokens=8192,
            response_modalities=["TEXT"],
            safety_settings=[
                types.SafetySetting(category="HARM_CATEGORY_HATE_SPEECH", threshold="OFF"),
                types.SafetySetting(category="HARM_CATEGORY_DANGEROUS_CONTENT", threshold="OFF"),
                types.SafetySetting(category="HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold="OFF"),
                types.SafetySetting(category="HARM_CATEGORY_HARASSMENT", threshold="OFF")
            ],
        )

        # Generate content in a single call
        response = self.client.models.generate_content(
            model=model,
            contents=contents,
            config=generate_content_config,
        )

        # Process the response to produce structured output
        response_text = response.text
        code_start = response_text.find("Code: ") + len("Code: ")
        explanation_start = response_text.find("Explanation:")

        code = response_text[code_start:explanation_start].strip()
        explanation = response_text[explanation_start + len("Explanation: "):].strip()

        structured_output = {
            "code": code,
            "explanation": explanation
        }

        return structured_output
    


# def generate(input):
#     os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getenv("CODE_OPTIMIZER_GOOGLE_APPLICATION_CREDENTIALS")

#     client = genai.Client(
#         vertexai=True,
#         project=os.getenv("CODE_OPTIMIZER_GCP_PROJECT_ID"),
#         location=os.getenv("CODE_OPTIMIZER_GCP_LOCATION"),
#     )

#     model = "projects/{}/locations/{}/endpoints/124751688799092736".format(
#         os.getenv("CODE_OPTIMIZER_GCP_PROJECT_ID"),
#         os.getenv("CODE_OPTIMIZER_GCP_LOCATION"),
#     )

#     contents = [
#         types.Content(
#             role="user",
#             parts=[{"text": f"{input} In your output, make a clear distinction between the code and the explanation. Use the format: 'Code: ... Explanation: ...'"}]
#         )
#     ]
#     generate_content_config = types.GenerateContentConfig(
#         temperature=1,
#         top_p=0.95,
#         max_output_tokens=8192,
#         response_modalities=["TEXT"],
#         safety_settings=[
#             types.SafetySetting(category="HARM_CATEGORY_HATE_SPEECH", threshold="OFF"),
#             types.SafetySetting(category="HARM_CATEGORY_DANGEROUS_CONTENT", threshold="OFF"),
#             types.SafetySetting(category="HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold="OFF"),
#             types.SafetySetting(category="HARM_CATEGORY_HARASSMENT", threshold="OFF")
#         ],
#     )

#     # Generate content in a single call
#     response = client.models.generate_content(
#         model=model,
#         contents=contents,
#         config=generate_content_config,
#     )

#     # Process the response to produce structured output
#     response_text = response.text
#     code_start = response_text.find("Code: ") + len("Code: ")
#     explanation_start = response_text.find("Explanation:")

#     code = response_text[code_start:explanation_start].strip()
#     explanation = response_text[explanation_start + len("Explanation: "):].strip()

#     structured_output = {
#         "code": code,
#         "explanation": explanation
#     }

#     return structured_output






# input = "\n        \n                    Code Before Optimization:\n                    from dotenv import load_dotenv\nimport logging\nfrom pathlib import Path\n\n# Create logs directory if it doesn't exist\nlogs_dir = Path(\"logs\")\nlogs_dir.mkdir(exist_ok=True)\n\n# Configure logging\nlogging.basicConfig(\n    level=logging.INFO,\n    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',\n    handlers=[\n        # File handler for general application logs\n        logging.FileHandler('logs/app.log'),\n        # Stream handler for console output\n        logging.StreamHandler()\n    ]\n)\n\n# Suppress verbose fontTools logging\nlogging.getLogger('fontTools').setLevel(logging.WARNING)\nlogging.getLogger('fontTools.subset').setLevel(logging.WARNING)\nlogging.getLogger('fontTools.ttLib').setLevel(logging.WARNING)\n\n# Create logger instance\nlogger = logging.getLogger(__name__)\n\nload_dotenv()\n\nfrom backend.server.server import app\n\nif __name__ == \"__main__\":\n    import uvicorn\n    \n    logger.info(\"Starting server...\")\n    uvicorn.run(app, host=\"0.0.0.0\", port=8000)\n\n                    SonarCloud Metrics Before Optimization: \n                    Bugs=0, \n                    Code Smells=0, \n                    Duplicated Lines=0.0, \n                    Cognitive Complexity=1, \n                    Security=1.0, \n                    Vulnerabilities0, \n                    Ncloc=23.0, \n                    Complexity=1.0\n\n                    Generate an optimized version:\n                "
# response = generate(input)
# print(f"Optimized code: \n{response["code"]}")
# print("----------------------")
# print(f"Explanation and Improvements: \n{response["explanation"]}")
