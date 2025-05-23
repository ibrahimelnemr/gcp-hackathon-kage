# KAGE: AI-Powered Project Management Tool

KAGE is an AI-powered project management tool designed to streamline team collaboration, task assignments, and repository analysis.

---

## 🚀 Features

- **AI-Powered Task Assignments**: Automatically generate task assignments based on project descriptions and team roles.
- **Repository Analysis**: Analyze GitHub repositories to identify potential improvements, refactors, and tasks.
- **AI-Assisted Code Changes**: Generate and apply AI-suggested code changes directly to your repository.
- **Seamless GitHub Integration**: Link repositories, analyze codebases, and commit changes with ease.
- **Interactive Task Boards**: Manage tasks visually with drag-and-drop functionality.
- **Cloud Integration**: Built to run on Google Cloud Platform with Vertex AI support.

---

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, Vite
- **Backend**: Django, Python, PyGitHub, Vertex AI
- **Containerization**: Docker
- **Cloud**: Google Cloud Platform (GCP)

---

## 🖥️ Local Development

### Backend

1. **Build Docker image**:
   ```bash
   cd backend
   docker build -t kage-backend .
   ```

2. **Run the container and development server:**
    ```bash
    # to open container terminal
    docker run -it --rm -p 8080:8080 -v "$(pwd)":/app -w /app kage-backend bash

    # within container terminal
    python manage.py runserver 0.0.0.0:8080
    ```

### Frontend

1. **Build Docker image**:
   ```bash
   cd frontend
   docker build -t kage-frontend .
   ```

2. **Run the container and development server:**
    ```bash
    # to open container terminal
    docker run --rm -it -p 5173:5173 -v "$(pwd)":/app -v kage-frontend_node_modules:/app/node_modules -w /app kage-frontend bash

    # within container terminal
    npm run dev
    ```

### Docker Compose

Alternately, `cd gcp-hackathon-kage` and run `docker-compose up`

This will build and run both the backend and frontend services, exposing the backend on port 8080 and the frontend on port 5173. 

---

## 📖 Documentation

For detailed setup instructions, refer to the DOCS.md file.

---

## 🔮 Potential Future Additions

- [ ] Integration with Jira, Trello, and Asana for task management.
- [ ] Support for additional version control systems like GitLab and Bitbucket.
- [ ] Dedicated chat interface for interacting with KAGE's AI agent.
- [ ] Integration with DeepSeek models or Ollama models for local AI processing.
- [ ] Support for a local PostgreSQL database to enable full functionality without GCP credentials.