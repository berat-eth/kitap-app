# Sesli Kitap Backend

Node.js Express API for the audiobook application.

## Setup

1. Copy environment file:
   ```bash
   cp .env.example .env
   ```

2. Configure `.env` with your MySQL credentials and JWT secrets.

3. Create database and run schema:
   ```bash
   mysql -u root -p < sql/schema.sql
   ```

4. Install dependencies (if not done):
   ```bash
   npm install
   ```

5. Start server:
   ```bash
   npm run dev
   ```

## API Endpoints

- **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`, `/api/auth/me`
- **Books**: `GET/POST /api/books`, `GET/PUT/DELETE /api/books/:id`
- **Chapters**: `GET/POST /api/books/:bookId/chapters`, `DELETE /api/chapters/:id`, `POST /api/chapters/:id/progress`
- **Categories**: `GET/POST /api/categories`
- **Users**: `GET /api/users`, `PUT /api/users/profile`, `POST /api/users/device-token`
- **Notifications**: `POST /api/notifications/send`, `GET /api/notifications`

## Firebase

Place `firebase-service-account.json` in the project root for push notifications. The app runs without it; notifications will be logged but not sent.
