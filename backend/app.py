from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  
# CORS(app, resources={r"/*": {"origins": "*"}})
# CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}})
# CORS(app, resources={r"/*": {"origins": "*"}})


@app.route("/", methods=["GET"])
def index():
    return "project management API"


@app.route("/", methods=["POST"])
def generate_plan():
    data = request.get_json()

    # Log input for debugging
    print("Received input:", data)

    # Mock response
    mock_response = {
        "generated_plan": {
            "tasks": [
                {
                    "task_id": 1,
                    "description": "Run Axe accessibility scan on the portal.",
                    "assigned_role_experience": "Senior Consultant",
                    "assigned_role_department": "Accessibility",
                    "rationale": "Needs accessibility expertise to configure tool and interpret results."
                },
                {
                    "task_id": 2,
                    "description": "Review login flow for keyboard navigation issues.",
                    "assigned_role_experience": "Senior Consultant",
                    "assigned_role_department": "Accessibility",
                    "rationale": "Requires manual accessibility testing experience."
                }
            ],
            "missing_roles": [
                {
                    "experience": "Consultant",
                    "department": "Fullstack",
                    "reasoning": "Helps with workload and React-specific tasks."
                }
            ]
        }
    }

    return jsonify(mock_response)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
