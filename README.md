# gcp-hackathon-kage
AI powered project management tool built for the Google Cloud Platform hackathon.

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
`docker run --rm -it -p 5173:5173 -e BACKEND_URL=http://enter-backend-url-here -v "$(pwd)":/app -v kage-frontend_node_modules:/app/node_modules -w /app kage-frontend bash`

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

`docker run -p 5173:5173 --rm -e BACKEND_URL=http://localhost:5050 ibrahimelnemr/kage-frontend:latest`

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
- project_id: (int) ForeignKey -> Project
- employee_id: (int) ForeignKey —> Employee
- description: String



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