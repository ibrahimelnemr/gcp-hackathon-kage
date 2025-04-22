# gcp-hackathon-kage
AI powered project management tool built for the Google Cloud Platform hackathon.

## Local development setup

To set up the python environment locally

first ensure you are using Python `3.12.3`
`cd gcp-hackathon-kage`

`cd backend_django`

`python -m venv venv`

`source venv/bin/activate`

`pip install -r requirements.txt`

Then to run the django app

`python manage.py runserver 0.0.0.0:8080`

Alternately, to set up with docker

`cd gcp-hackathon-kage`

`cd backend_django`

`docker build -t kage-backend-django .`

Then to run an interactive terminal for development run:
`docker run -it --rm -p 8080:8080 -v "$(pwd)":/app -w /app kage-backend-django bash`

Alternately to run the app itself run

`docker run -d -p 8080:8080 -v "$(pwd)":/app -w /app my-python-app`

## Database schema

## Connect to vertex AI

in the `backend_django` root folder add the credentials file `centered-accord-442214-b9-12a090e7cfac.json`

add a `.env` file in the `backend_django` root folder and set
`GOOGLE_APPLICATION_CREDENTIALS=centered-accord-442214-b9-12a090e7cfac.json`

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