# E-Learning Platform

A full-stack, comprehensive e-learning management system (LMS) built with the MERN stack (MongoDB, Express, React, Node.js). This platform allows instructors to create and sell courses, and students to purchase, enroll, and track their progress through video lessons.

## Features

### 🎓 For Students
*   **Browse & Search:** Search for courses by title, category, or tags. Filter by price or difficulty level.
*   **Shopping Cart:** Add courses to your cart and seamlessly checkout using Stripe integration.
*   **My Learning Dashboard:** Track your progress across all enrolled courses in real-time.
*   **Course Viewer:** Watch video lessons, mark them as complete, and track your overall completion percentage.
*   **Reviews & Ratings:** Leave reviews and ratings for courses you have enrolled in and completed.

### 👨‍🏫 For Instructors
*   **Instructor Dashboard:** Get an overview of your created courses and student enrollments.
*   **Course Management:** Create, edit, and publish new courses. Add thumbnails, descriptions, and dynamic requirements.
*   **Curriculum Builder:** Create ordered lessons for each course. Add video URLs, text content, and mark specific lessons as free previews.
*   **Soft Deletion:** Safely delete courses or lessons without breaking existing student enrollments.

### 🛡️ Security & Architecture
*   **Robust Authentication:** Secure JWT-based authentication with automatic refresh token rotation via Axios interceptors.
*   **Role-Based Access Control (RBAC):** Distinct permissions for `student`, `instructor`, and `admin` roles.
*   **Data Validation:** Strict schema validation on both the frontend and backend using **Zod**.
*   **Payment Processing:** Secure payment processing and automated webhook fulfillment via **Stripe**.

## Tech Stack

**Frontend:**
*   React (via Vite)
*   Tailwind CSS for styling
*   React Router for navigation
*   Axios for API requests (with custom interceptors)
*   Lucide React for iconography

**Backend:**
*   Node.js & Express.js
*   MongoDB & Mongoose (with custom Soft Delete plugins)
*   JSON Web Tokens (JWT) for stateless auth
*   Zod for request validation
*   Stripe Node SDK for payments

## Getting Started

### Prerequisites
*   Node.js (v16+)
*   MongoDB Instance (Local or Atlas)
*   Stripe Account (for payment processing)

### Installation

1.  **Clone the repository** (if applicable) and navigate to the project directory.

2.  **Install Backend Dependencies**
    ```bash
    cd Server
    npm install
    ```

3.  **Install Frontend Dependencies**
    ```bash
    cd client
    npm install
    ```

### Environment Variables

Create a `.env` file in the **Server** directory with the following configuration:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:3000

# JWT Configuration
Jwt_Secret=your_access_token_secret
Jwt_Refresh_Secret=your_refresh_token_secret
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### Running the Application

1.  **Start the Backend Server**
    ```bash
    cd Server
    npm start
    ```
    *(The backend will run on `http://localhost:5000`)*

2.  **Start the Frontend Development Server**
    ```bash
    cd client
    npm run dev
    ```
    *(The frontend will run on `http://localhost:3000`)*

## API Structure

The API is structured around several core domains, mounted under `/api/v1`:

*   `/auth` - Registration, login, token refresh, and profile management.
*   `/courses` - Course CRUD, publishing, and searching. Nested routes handle lessons (`/:courseId/lessons`) and reviews (`/:courseId/reviews`).
*   `/categories` - Category management.
*   `/cart` - Shopping cart management.
*   `/payments` - Stripe checkout session creation and webhook fulfillment.
*   `/enrollments` - Progress tracking and completion markers.

## License

This project is licensed under the MIT License.
