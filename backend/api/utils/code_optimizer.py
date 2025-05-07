from google.cloud import aiplatform
import requests
from dotenv import load_dotenv
import os
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
    