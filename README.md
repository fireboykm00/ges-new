# GES Restaurant Stock Management System

A complete restaurant stock management system with authentication, role-based access control, and inventory tracking.

## Features

- User authentication with JWT
- Role-based access control (Admin, Manager, Staff)
- Stock management (CRUD operations)
- Supplier management
- Purchase tracking with automatic stock updates
- Usage recording with automatic stock decrements
- Expense tracking
- Monthly reporting

## Tech Stack

### Backend

- Spring Boot 3.x
- Spring Security with JWT
- Spring Data JPA
- H2 Database (in-memory for development)
- Maven

### Frontend

- React with TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components

## Getting Started

### Prerequisites

- Java 21
- Node.js 18+
- pnpm

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Run the application:

   ```bash
   mvn spring-boot:run
   ```

3. The backend will be available at http://localhost:8080

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Run the development server:

   ```bash
   pnpm dev
   ```

4. The frontend will be available at http://localhost:5173

## Default Users

The application comes with three default users:

- **Admin**: admin / password
- **Manager**: manager / password
- **Staff**: staff / password

You can also register new users through the registration page.

## API Documentation

The backend API is documented with Swagger UI and is available at:
http://localhost:8080/swagger-ui.html

## Database

The application uses an H2 in-memory database for development. The database is reset every time the application restarts.

To access the H2 console:

1. Go to http://localhost:8080/h2-console
2. Use the following settings:
   - JDBC URL: jdbc:h2:mem:gesdb
   - User Name: sa
   - Password: (leave empty)

## Development

### Backend Structure

```
backend/
├── src/main/java/com/ms/ges/
│   ├── model/          # Entity classes
│   ├── repository/     # Spring Data repositories
│   ├── controller/     # REST controllers
│   ├── service/        # Business logic services
│   ├── config/         # Security and configuration
│   └── GesApplication.java  # Main application class
└── src/main/resources/
    ├── application.properties  # Configuration
    └── data.sql               # Initial data (if any)
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── services/       # API service layer
│   ├── App.tsx         # Main application component
│   └── main.tsx        # Application entry point
└── public/
    └── index.html      # HTML template
```

## License

This project is licensed under the MIT License.
