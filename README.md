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
`docker run -it --rm -v "$(pwd)":/app -w /app kage-backend-django bash`

Alternately to run the app itself run

`docker run -d -p 8080:8080 -v "$(pwd)":/app -w /app my-python-app`

