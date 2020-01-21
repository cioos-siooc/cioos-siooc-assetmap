FROM python:3.7-alpine

# WORKDIR
COPY . /app
WORKDIR /app

RUN pip install -r requirements.txt
ENTRYPOINT ["python"]
CMD ["main.py"]
