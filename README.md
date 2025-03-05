# HTML5 Photo App

This application allows users to capture, crop, resize, and send photos to a backend.

## Prerequisites

- Docker installed on your system.

## Running the Application with Docker

1.  **Build the Docker image:**

    ```bash
    docker build -t photo-app .
    ```

2.  **Run the Docker container:**

    ```bash
    docker run -p 5173:5173 photo-app
    ```
    This command maps port 5173 inside the container to port 5173 on your host machine. You can access the application by navigating to `http://&lt;your-host-ip&gt;:5173` in your browser. Replace `<your-host-ip>` with your machine's IP address. You can typically find your IP address using `ipconfig` (Windows) or `ifconfig` (macOS/Linux) in your terminal.

    Alternatively, you can access the application via `http://localhost:5173` or `http://127.0.0.1:5173` if you are running the browser on the same machine as Docker.

## Accessing from other devices

Make sure the firewall on the host machine allows inbound traffic on port 5173.
