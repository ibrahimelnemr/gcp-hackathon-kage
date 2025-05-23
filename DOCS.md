## Backend - local development (venv)

To set up the python environment locally

first ensure you are using Python `3.12.3`
`cd gcp-hackathon-kage`

`cd backend_django`

`python -m venv venv`

`source venv/bin/activate`

`pip install -r requirements.txt`

Then to run the django app

`python manage.py runserver 0.0.0.0:8080`

## Backend - local development (docker)

`cd gcp-hackathon-kage`

`cd backend`

`docker build -t kage-backend .`

To run an interactive terminal for development:
`docker run -it --rm -p 8080:8080 -v "$(pwd)":/app -w /app kage-backend bash`

within the terminal, run `python manage.py runserver 0.0.0.0:8080`

To run the app itself:
`docker run -d -p 8080:8080 -v "$(pwd)":/app -w /app kage-backend`

## Frontend - local development (docker)

Note that if no backend URL is passed via `-e BACKEND_URL=http://enter-backend-url-here` it will assumed to be localhost:8080

`cd gcp-hackathon-kage`

`cd frontend`

`docker build -t kage-frontend .`

Run the app itself (terminal), remove container when finished to view/test app
`docker run --rm -it -p 5173:5173 -e BACKEND_URL=http://enter-backend-url-here kage-frontend`

Run the app itself in terminal, remove container when finished, allow for local development, include container node modules not local
`docker run --rm -it -p 5173:5173 -e BACKEND_URL=http://enter-backend-url-here -v "$(pwd)":/app -v kage-frontend_node_modules:/app/node_modules -w /app --user root kage-frontend bash`

or to use default backend url
`docker run --rm -it -p 5173:5173 -v "$(pwd)":/app -v kage-frontend_node_modules:/app/node_modules -w /app kage-frontend --user root bash`

then within the terminal, run `npm run dev`

Run app
`docker run -p 5173:5173 kage-frontend`

## Push to docker registry for deployment

For backend

`cd backend`

`docker build -t kage-backend:latest .`

`docker tag kage-backend ibrahimelnemr/kage-backend:latest`

`docker push ibrahimelnemr/kage-backend:latest`

For frontend

`cd frontend`

`docker build -t kage-frontend .`

`docker tag kage-frontend ibrahimelnemr/kage-frontend:latest`

`docker push ibrahimelnemr/kage-frontend:latest`

## Frontend deployment / environment variables

by default the frontend will assume the backend url is http://localhost:8080

however, for running in production with a different backend ensure to pass an environment variable using `-e` specifying the url at runtime

this will generate a .env file in the frontend folder with the correct backend url

`docker run -p 5173:5173 --rm -e BACKEND_URL=http://localhost:5050 --user root ibrahimelnemr/kage-frontend:latest`

## Working local development commands

`cd gcp-hackathon-kage/backend`
backend: `docker run -it --rm -p 8080:8080 -v "$(pwd)":/app -w /app kage-backend bash`
`python manage.py runserver 0.0.0.0:8080`

`cd gcp-hackathon-kage/frontend`
frontend: `docker run --rm -it -p 5173:5173 -v "$(pwd)":/app -v kage-frontend_node_modules:/app/node_modules -w /app --user root kage-frontend bash`
`npm run dev`

npm i react-markdown react-gfm

## Database schema

Employee
- id: int
- name: string
- level: string
- department: string

Project
- id: int
- name: string
- description: string

Task
- id: int
- project_id: int
- employee_id: int
- description: string
- status: string



## Connect to vertex AI

in the `backend` root folder add the credentials file `centered-accord-442214-b9-89fe65beac89.json`

add a `.env` file in the `backend_django` root folder and set
`GOOGLE_APPLICATION_CREDENTIALS=centered-accord-442214-b9-89fe65beac89.json`

## Django development

`python manage.py makemigrations api`

`python manage.py migrate`

`python manage.py runserver 0.0.0.0:8080`

`python manage.py test`

## GCP deployment

specify the container as

`docker.io/ibrahimelnemr/kage-backend:latest`

`docker.io/ibrahimelnemr/kage-frontend:latest`

## Troubleshooting

gcloud ai models list --project=centered-accord-442214-b9 --region=us-central1 

gcloud projects add-iam-policy-binding centered-accord-442214-b9 \
  --member="serviceAccount:895087232693-compute@developer.gserviceaccount.com" \
  --role="roles/aiplatform.admin"

gcloud services enable aiplatform.googleapis.com --project=centered-accord-442214-b9

gcloud projects add-iam-policy-binding centered-accord-442214-b9 \
  --member="serviceAccount:895087232693-compute@developer.gserviceaccount.com" \
  --role="roles/aiplatform.admin"

  ## Sample Project

  Description

  Develop an AI agent that can extract text from a contract (word document) and compare it to a template. The AI agent must be able to compare the contract to the template and provide differences where the contract does not comply with the template and provide a proposal to the contract


  Name

  Company document comparison_V2


Team members

John Appleseed - Analyst - AI & Data

Jane Doe - Consultant - Cloud

# Deployment - final

For backend

`cd backend`

`docker build -t kage-backend:latest .`

`docker tag kage-backend ibrahimelnemr/kage-backend:latest`

`docker push ibrahimelnemr/kage-backend:latest`

For frontend

`cd frontend`

`docker build -t kage-frontend .`

`docker tag kage-frontend ibrahimelnemr/kage-frontend:latest`

`docker push ibrahimelnemr/kage-frontend:latest`


`gcloud auth login`

add this to `~/.zshrc`
`export PATH="$PATH:/usr/local/share/google-cloud-sdk/bin"`

`gcloud auth configure-docker us-central1-docker.pkg.dev`

`gcloud projects add-iam-policy-binding centered-accord-442214-b9 --member="user:YOUR_EMAIL@gmail.com" --role="roles/artifactregistry.writer"`

`gcloud artifacts repositories create kage --repository-format=docker --location=us-central1 --description="Kage Docker Images"`

`docker push us-central1-docker.pkg.dev/centered-accord-442214-b9/kage/kage-backend:latest`



cd backend

docker build -t kage-backend:latest .

docker tag kage-backend:latest \
  us-central1-docker.pkg.dev/centered-accord-442214-b9/kage/kage-backend:latest

docker push \
  us-central1-docker.pkg.dev/centered-accord-442214-b9/kage/kage-backend:latest




cd frontend

docker build -t kage-frontend:latest .

docker tag kage-frontend:latest \
  us-central1-docker.pkg.dev/centered-accord-442214-b9/kage/kage-frontend:latest

docker push \
  us-central1-docker.pkg.dev/centered-accord-442214-b9/kage/kage-frontend:latest


