# Cloudflare DNS Manager

A full-stack application to efficiently manage your Cloudflare DNS records with a modern, intuitive user interface.

## Features

-   **Secure Authentication:** Key-based login system with mandatory initial key change for enhanced security.
-   **Multi-language Support:** Supports English, Japanese, Simplified Chinese, and Traditional Chinese.
-   **Modern UI:** Clean, Apple-inspired design with responsive layouts and intuitive interactions.
-   **DNS Record Management (CRUD):**
    *   View DNS records for selected zones.
    *   Add new DNS records (A, AAAA, CNAME, TXT, MX, NS, PTR, SPF, SRV, CAA, DANE, SVCB, HTTPS).
    *   Edit existing DNS records.
    *   Delete DNS records.
    *   Toggle Cloudflare proxy status directly from the dashboard for applicable record types.
-   **API Token Management:** Configure and test your Cloudflare API Token directly from the Admin Panel.
-   **Login Key Management:** Securely update your login key from the Admin Panel.

## Technologies Used

**Frontend (Client):**
-   React.js
-   Tailwind CSS
-   React Router DOM
-   `react-hot-toast` for notifications
-   `i18next` & `react-i18next` for internationalization
-   `@heroicons/react` for icons

**Backend (Server):**
-   Node.js
-   Express.js
-   SQLite (for authentication configuration)
-   `bcryptjs` for password hashing
-   `jsonwebtoken` for JWT authentication
-   `axios` for Cloudflare API interaction
-   `cors` for Cross-Origin Resource Sharing

## Setup Instructions

### Prerequisites

-   Node.js (v18 or higher)
-   npm (Node Package Manager)
-   Docker & Docker Compose (for containerized deployment)
-   A Cloudflare account with an API Token (Global API Key or API Token with Zone:DNS permissions).

### 1. Local Development Setup

This method allows you to run the frontend and backend services separately for development and debugging.

#### Backend Setup

1.  **Navigate to the server directory:**
    ```bash
    cd server
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Initialize Configuration & Set Default Key:**
    The system will automatically generate an initial login key (`admin123`) and a JWT secret if `server/src/config/auth.json` does not exist.
    ```bash
    npm start # Run once to generate initial config
    ```
    *Note: The default login key is `admin123`. You will be prompted to change it upon first login.*
4.  **Configure Cloudflare API Token:**
    Create a `.env` file in the `server` directory and add your Cloudflare API Token:
    ```
    # server/.env
    CLOUDFLARE_API_TOKEN=YOUR_CLOUDFLARE_API_TOKEN
    ```
    Alternatively, you can configure this via the Admin Panel after logging in.
5.  **Start the Backend Service:**
    ```bash
    npm start
    ```
    The backend API will be available at `http://localhost:3001`.

#### Frontend Setup

1.  **Navigate to the client directory:**
    ```bash
    cd client
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the Frontend Development Server:**
    ```bash
    npm start
    ```
    The frontend application will be available at `http://localhost:3000`.

### 2. Docker Compose Deployment

This method allows you to run both frontend and backend services in isolated Docker containers.

1.  **Ensure Docker and Docker Compose are installed.**
2.  **Navigate to the project root directory:**
    ```bash
    cd cloudflare-dns-dashboard/ # Or wherever your project root is
    ```
3.  **Build and Run Services:**
    ```bash
    docker-compose up --build
    ```
    This command will:
    *   Build Docker images for both client and server based on their respective `Dockerfile`s.
    *   Start the frontend service (Nginx serving React app) on `http://localhost:8081`.
    *   Start the backend API service (Node.js) internally.
    *   Initialize the default login key (`admin123`) if `server/src/config/auth.json` does not exist.
    *   Persist authentication configuration and SQLite database in Docker volumes.

4.  **Access the Application:**
    The frontend application will be available in your browser at `http://localhost:8081`.
    The backend API will be accessible internally by the frontend.

### Initial Login & Key Change

Upon first login with the default key (`admin123`), you will be prompted to change your password immediately for security reasons. This modal cannot be dismissed until a new key is set.

## Internationalization (i18n)

The application supports multiple languages: English, Japanese, Simplified Chinese, and Traditional Chinese.

-   **Language Detection:** The application attempts to detect your browser's language.
-   **Language Switcher:** You can manually switch languages using the dropdown in the navigation bar.
-   **Adding New Languages:** To add a new language, create a new `translation.json` file in `client/public/locales/{your-lang-code}/` and update `client/src/i18n.js` with the new language code.

## Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests.

## License

This project is licensed under the MIT License.