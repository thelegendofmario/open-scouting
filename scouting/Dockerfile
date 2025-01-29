# syntax=docker/dockerfile:1
FROM python:3

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /usr/src/app

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

COPY requirements.txt .
COPY requirements-dev.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
RUN pip install -r requirements-dev.txt

COPY nginx.conf .

COPY . .

ENTRYPOINT ["./entrypoint.sh"]
