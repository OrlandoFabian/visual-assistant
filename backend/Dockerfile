FROM python:3.13-slim AS builder
WORKDIR /app
RUN pip install --no-cache-dir pipenv
COPY Pipfile Pipfile.lock* ./
RUN pipenv install --deploy --system || pipenv install --system

FROM python:3.13-slim
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.13/site-packages /usr/local/lib/python3.13/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY . .
EXPOSE 8000
CMD ["gunicorn", "-k", "gevent", "-w", "2", "--max-requests", "1000", "--max-requests-jitter", "100", "-b", "0.0.0.0:8000", "app:create_app()"]
