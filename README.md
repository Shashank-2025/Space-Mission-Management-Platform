# Space Mission Management Platform

A full-stack web application for managing space missions, satellites, and ground stations through a centralized dashboard with interactive 3D space visualization.

## Overview

The Space Mission Management Platform provides a unified interface for organizing space mission information and managing satellite and ground-station records. It combines a React-based frontend, a Java Spring Boot backend, and a PostgreSQL database.

The platform integrates CesiumJS to display an interactive 3D globe, ground-station locations, and simulated satellite orbits based on configured orbital parameters.

## Features

* Centralized dashboard for space operations.
* Mission management with Create, Read, Update, and Delete (CRUD) operations.
* Satellite management with configurable orbital parameters.
* Ground-station management.
* Interactive 3D globe using CesiumJS.
* Simulated satellite orbital visualization.
* REST API integration between frontend and backend.
* PostgreSQL database integration for persistent storage.

## Technology Stack

| Component         | Technology                         |
| ----------------- | ---------------------------------- |
| Frontend          | React, JavaScript, Vite            |
| 3D Visualization  | CesiumJS                           |
| Backend           | Java, Spring Boot                  |
| API Communication | REST APIs                          |
| Database          | PostgreSQL                         |
| Development Tools | Visual Studio Code / IntelliJ IDEA |

## Project Structure

```text
space-mission-management-platform/
├── frontend/
├── backend/
├── .gitignore
└── README.md
```

## Prerequisites

Install the following before running the project:

* Java Development Kit (JDK) 21
* Node.js and npm
* PostgreSQL
* A compatible code editor or IDE

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/space-mission-management-platform.git
cd space-mission-management-platform
```

Replace `YOUR_USERNAME` with your GitHub username.

### 2. Configure the Database

Create a PostgreSQL database and configure the backend connection using your local database settings.

Keep database credentials outside version control. Do not commit passwords or other secrets.

### 3. Run the Backend

Open a terminal in the backend directory:

```bash
cd backend
```

Run the application using the Maven wrapper if available:

Windows:

```bash
mvnw.cmd spring-boot:run
```

Alternatively, if Maven is installed:

```bash
mvn spring-boot:run
```

The backend API is configured to run at:

`http://localhost:8081/api`

The port may depend on your local application configuration.

### 4. Run the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually:

`http://localhost:5173`

### 5. Configure Cesium

Configure the Cesium ion access token through the frontend's local environment configuration, using the variable name expected by the application.

For the current application, this is:

`VITE_CESIUM_ION_TOKEN`

Use a local environment file such as `.env.local`. Never commit the actual token to GitHub.

## Application Modules

### Mission Management

Create, view, update, and delete mission records.

### Satellite Management

Maintain satellite information, status, and orbital parameters used by the visualization.

### Ground Station Management

Manage ground-station information and display stations with valid coordinates on the globe.

### 3D Space Map

Visualize ground stations and simulated satellite orbits on an interactive 3D globe.

## Important Note

Satellite movement in the visualization is simulated using configured orbital parameters. The application does not provide real-time satellite tracking unless a live tracking data source is separately integrated.

## Future Enhancements

* Integration with live satellite tracking data.
* Role-based authentication and authorization.
* Mission scheduling and notifications.
* Advanced analytics and reporting.
* Deployment to a cloud environment.

## Author

Developed as an academic full-stack application demonstrating web development, REST API integration, database management, and 3D geospatial visualization.
