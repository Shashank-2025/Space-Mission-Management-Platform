# Space Mission Management Platform — Backend

The backend is a Java Spring Boot application that provides REST APIs for managing mission, satellite, and ground-station data stored in PostgreSQL.

## Technologies

* Java 21
* Spring Boot
* Spring Web
* Spring Data JPA
* PostgreSQL
* Maven

## Features

* REST API endpoints for application resources.
* Create, read, update, and delete operations.
* PostgreSQL database integration.
* Persistent storage of mission, satellite, and ground-station records.
* Backend services for communication with the React frontend.

## Prerequisites

* JDK 21
* PostgreSQL
* Maven or the included Maven wrapper

## Database Configuration

Configure the PostgreSQL connection using the application's local configuration.

Provide the appropriate database URL, username, and password through local environment variables or a local configuration file, according to the application's configuration.

Never commit actual credentials to GitHub.

## Run the Application

Open a terminal in the backend directory.

Using the Maven wrapper on Windows:

```bash
mvnw.cmd spring-boot:run
```

Alternatively, if Maven is installed:

```bash
mvn spring-boot:run
```

The backend API is configured to run at:

`http://localhost:8081/api`

Confirm the configured port and API routes in the application before use.

## API Resources

The application provides API resources for:

* Missions
* Satellites
* Ground Stations

The exact endpoints and supported operations are defined by the backend controllers.

## Database

PostgreSQL stores the application's records. Ensure the database exists and the connection settings are configured before starting the application.
