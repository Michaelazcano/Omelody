# Use an official Python image as the base
FROM python:3.9

# Set the working directory inside the container
WORKDIR /app

# Copy the application files into the container
COPY . /app

# Install dependencies
RUN pip install -r requirements.txt

# Expose the Flask port
EXPOSE 5000

# Run the application
CMD ["python", "app.py"]


