FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Train the Random Forest pipeline at build time so the image ships with
# nutrilife_pipeline.pkl / target_encoder.pkl already baked in - the
# service is ready to classify immediately on container start instead of
# falling back to the default "Balanced" response until someone trains it.
RUN python train.py

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
