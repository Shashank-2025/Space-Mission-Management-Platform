# Space Mission Management Platform — Frontend

The frontend is a React-based web application developed using Vite. It provides the user interface for managing missions, satellites, and ground stations, along with interactive 3D space visualization.

## Technologies

* React
* JavaScript
* Vite
* CesiumJS
* CSS

## Features

* Space operations dashboard.
* Mission, satellite, and ground-station management interfaces.
* CRUD operations through backend REST APIs.
* Interactive Cesium 3D globe.
* Ground-station markers and simulated satellite orbits.

## Prerequisites

* Node.js
* npm
* Running backend API

## Installation

From the frontend directory, run:

```bash
npm install
```

## Environment Configuration

Create a local `.env.local` file in this directory and configure the Cesium ion token:

```env
VITE_CESIUM_ION_TOKEN=your_cesium_ion_token
```

Replace the placeholder with your own token. Do not commit `.env.local` or expose your token in the repository.

## Run the Development Server

```bash
npm run dev
```

Open the local URL printed by Vite, usually:

`http://localhost:5173`

## Production Build

```bash
npm run build
```

Vite generates the production build in the `dist/` directory.

## Backend Dependency

The frontend communicates with the Spring Boot backend. Ensure the API is running and the frontend's API configuration points to the correct backend URL.

