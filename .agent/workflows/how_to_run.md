---
description: How to run the e-commerce project
---

# How to Run the Project

This guide explains how to start the backend services and the frontend application.

## Prerequisites

-   Docker & Docker Compose (optional, for easiest backend setup)
-   Java 17+ & Maven (if running backend manually)
-   Node.js & npm (for frontend)

## 1. Start the Backend

You can run the backend using Docker Compose or manually with Maven.

### Option A: Using Docker Compose (Recommended)

This will start the `product-api` and `gateway-api` services.

```bash
docker-compose -f docker-compose.product.yml up --build
```

The API Gateway will be available at `http://localhost:8080`.

### Option B: Manual Startup

If you prefer running services individually:

1.  **Start Product API**:
    Open a terminal in `product-api` and run:
    ```bash
    mvn spring-boot:run
    ```
    (Runs on port 9001)

2.  **Start Gateway API**:
    Open a terminal in `gateway-api` and run:
    ```bash
    mvn spring-boot:run
    ```
    (Runs on port 8080)

## 2. Start the Frontend

1.  Open a terminal in `frontend/ecommerce-frontend`.
2.  Install dependencies (if not already done):
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

The frontend will be available at `http://localhost:3000`.

## 3. Verification

-   Open `http://localhost:3000` in your browser.
-   You should see the shop page.
-   Click on a product to see the details and the new image gallery.
