# KAGE: AI-Powered Project Management Tool

KAGE is an AI-powered project management tool designed to streamline team collaboration, task assignments, and repository analysis. Built for the Google Cloud Platform Hackathon, KAGE leverages cutting-edge AI technologies to assist teams in managing projects efficiently.

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

2. **Run the container and development server:**:
    ```bash
    
    # to open container terminal
    docker run -it --rm -p 8080:8080 -v "$(pwd)":/app -w /app kage-backend bash

    # within container terminal
    python manage.py runserver 0.0.0.0:8080```

### Frontend

1. **Build Docker image**:
   ```bash
   cd frontend
   docker build -t kage-frontend .
   ```

2. **Run the container and development server:**:
    ```bash
    
    # to open container terminal
    docker run --rm -it -p 5173:5173 -v "$(pwd)":/app -v kage-frontend_node_modules:/app/node_modules -w /app kage-frontend bash

    # within container terminal
    npm run dev```


## 📖 Documentation

For detailed setup instructions, refer to the DOCS.md file.
