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

To run an interactive terminal development:
`docker run -it --rm -p 8080:8080 -v "$(pwd)":/app -w /app kage-backend bash`

To run the app itself:
`docker run -d -p 8080:8080 -v "$(pwd)":/app -w /app kage-backend`

## Frontend - local development (docker)

`cd gcp-hackathon-kage`

`cd frontend`

`docker build -t kage-frontend .`

To run an interactive terminal development:
`docker run -it --rm -p 5173:5173 -v "$(pwd)":/app -w /app kage-frontend bash`

To run the app itself:
`docker run -d -p 5173:5173 -v "$(pwd)":/app -w /app kage-frontend`


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

## Troubleshooting

gcloud ai models list --project=centered-accord-442214-b9 --region=us-central1 

gcloud projects add-iam-policy-binding centered-accord-442214-b9 \
  --member="serviceAccount:895087232693-compute@developer.gserviceaccount.com" \
  --role="roles/aiplatform.admin"

gcloud services enable aiplatform.googleapis.com --project=centered-accord-442214-b9

gcloud projects add-iam-policy-binding centered-accord-442214-b9 \
  --member="serviceAccount:895087232693-compute@developer.gserviceaccount.com" \
  --role="roles/aiplatform.admin"