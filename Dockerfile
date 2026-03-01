# X1 Panel - production image for Render
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY app.py .
COPY templates/ templates/
COPY static/ static/

# Render exposes PORT; default for local Docker
ENV PORT=5000
EXPOSE 5000

# Gunicorn binds to 0.0.0.0:PORT so Render can route traffic
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT:-5000} --workers 2 --threads 4 --timeout 120 app:app"]
