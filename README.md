# BookMyShoww 🎬

A full-stack movie ticket booking platform inspired by BookMyShow — built with **Spring Boot** on the backend and **React (Vite)** on the frontend. It has a public customer-facing booking flow and a completely separate, role-gated admin dashboard for managing movies, venues, screens, and shows.

---

## Tech Stack

**Backend**
- Java 25
- Spring Boot 4.1.0
- Spring Web (MVC)
- Spring Data JPA / Hibernate
- Spring Security (HTTP Basic Auth, method-level `@PreAuthorize`)
- MySQL
- Lombok
- Maven

**Frontend**
- React 18
- Vite
- React Router v7
- lucide-react (icons)

---

## Features

### Customer side
- Browse the movie catalogue and see currently running shows without logging in
- Filter shows by city
- Register a new account (name, email, password, phone number, DOB)
- Log in and view seat layouts for a selected show
- Book one or more seats for a show, with live pricing per seat category (Recliner, VIP, Couple, Premium, Regular)
- Automatic convenience fee + platform fee calculation on top of ticket price
- View personal booking history
- Cancel an existing booking
- Seat-level double-booking protection — a seat that's already `CONFIRMED` for a show can't be booked again, even under concurrent requests

### Admin side
- Fully separate admin dashboard (`/admin`), completely hidden from and inaccessible to regular customers
- Manage movies: create, update, delete, and upload posters
- Manage venues and screens
- Manage seats per screen (by seat type)
- Schedule shows per movie/screen, with:
  - Overlap detection (can't double-book a screen for conflicting time slots)
  - Per-seat-category pricing for every show
- View and manage all customer bookings
- Server-side enforced role checks (`@PreAuthorize("hasRole('ADMIN')")`) — admin-only endpoints are protected at the API layer, not just hidden in the UI

### Security
- Passwords are stored as BCrypt hashes — never in plaintext
- No hardcoded/in-memory users — every user (including admins) lives in the `User` table
- Booking requests are validated against the authenticated user's own email, so one customer can't book on behalf of another user's ID
- Public GET endpoints (movies, shows, venues, screens, seats, poster images) so the catalogue loads before login; everything else requires authentication
- Admin-only write operations enforced both at the route level and the method level

---

## Project Structure

```
bookmyshoww/
├── src/main/java/com/alok/bookmyshoww/
│   ├── auth/            # Spring Security config + UserDetailsService
│   ├── config/          # Web/CORS config
│   ├── controller/      # REST controllers (Movie, Show, Venue, Screen, Seat, Booking, User, Admin, Upload)
│   ├── dto/             # Request DTOs (e.g. BookingRequestDto)
│   ├── enums/           # Role, Genre, Language, SeatType, BookingStatus
│   ├── exceptions/      # Custom exceptions + centralized @RestControllerAdvice handler
│   ├── model/           # JPA entities (User, Venue, Screen, Seat, Movie, Show, Booking, BookingSeat)
│   ├── repository/      # Spring Data JPA repositories
│   └── service/         # Business logic layer
├── src/main/resources/
│   └── application.yaml # DB connection + JPA config
├── uploads/movies/      # Uploaded movie posters (served statically)
├── frontend/
│   ├── src/
│   │   ├── App.jsx      # Customer app (/*) + Admin app (/admin/*), routed separately
│   │   ├── api.js       # Fetch wrapper + Basic Auth credential handling
│   │   └── styles.css
│   └── package.json
└── pom.xml
```

**Entity relationships at a glance:**

`Venue` → has many `Screen` → has many `Seat`
`Movie` + `Screen` → combine into a `Show`
`Show` + `Seat`(s) → booked together into a `Booking`, tracked individually as `BookingSeat` rows (with a unique `(show_id, seat_id)` constraint to guarantee no seat is ever double-sold)

---

## Getting Started

### Prerequisites
- JDK 25
- Maven (or use the included `mvnw` wrapper)
- MySQL Server running locally
- Node.js + npm (for the frontend)

### 1. Database setup

Create the database:

```sql
CREATE DATABASE bookmyshow;
```

Update the credentials in `src/main/resources/application.yaml` to match your local MySQL setup:

```yaml
spring:
  datasource:
    username: root
    password: <your-password>
    url: jdbc:mysql://localhost:3306/bookmyshow
```

`ddl-auto: update` is set, so Hibernate will create/update the required tables automatically on first run.

> ⚠️ Don't commit real database credentials to version control — swap this to an environment variable or a `.gitignore`'d local profile before pushing.

### 2. Run the backend

```bash
./mvnw spring-boot:run
```

The API will start on `http://localhost:8080`.

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on Vite's default port (typically `http://localhost:5173`) and talks to the backend at `http://localhost:8080` (configured in `frontend/src/api.js`).

---

## How to Access the Admin Dashboard

There's no separate "admin sign-up" — admin access is just a `USER` account whose `role` has been promoted in the database. Here's the exact flow:

### Step 1 — Register as a normal user
1. Open the customer app in your browser (`http://localhost:5173`)
2. Click **Sign In → Create an account**
3. Fill in name, email, password, and phone number, and submit

This hits `POST /` on the backend, which always forces the new account's role to `USER` — there is no way to self-register as an admin.

### Step 2 — Promote that user to ADMIN via your DB GUI
Open your MySQL GUI of choice (MySQL Workbench, TablePlus, DBeaver, phpMyAdmin, etc.), connect to the `bookmyshow` database, and run:

```sql
UPDATE user
SET role = 'ADMIN'
WHERE email = 'your-registered-email@example.com';
```

That's it — no backend restart needed, since the role is read fresh from the DB on every login.

### Step 3 — Log in at `/admin`
1. Navigate to `http://localhost:5173/admin`
2. Sign in with the **same email and password** you just registered with
3. You'll land on the admin dashboard, now able to manage movies, venues, screens, shows, and bookings

Behind the scenes, this works because authentication is just Spring Security **HTTP Basic Auth** backed by the `User` table (see `CustomUserDetailsService`) — the same login credentials work on both the customer site and the admin site. What differs is the `role` claim Spring Security reads (`USER` vs `ADMIN`), which gates access to admin-only endpoints via `@PreAuthorize("hasRole('ADMIN')")` on the backend. The frontend just decides which UI to show; the actual enforcement always happens server-side, so even if someone bypassed the frontend, the API would still reject non-admin requests with a `403`.

---

## API Overview

| Resource | Public | Authenticated (any user) | Admin only |
|---|---|---|---|
| `POST /` (register) | ✅ | | |
| `GET /movie`, `/show`, `/venue`, `/screen`, `/seat` | ✅ | | |
| `GET /me` | | ✅ | |
| `POST /booking` | | ✅ (own account only) | |
| `GET /booking/user/{userId}` | | ✅ (own bookings) | ✅ (any user) |
| `PATCH /booking/{id}/cancel` | | ✅ (own booking) | ✅ (any booking) |
| `POST/PATCH/DELETE /movie`, `/show` | | | ✅ |
| `POST /upload/poster` | | | ✅ |
| `GET /admin/check` | | | ✅ |

---

## Notes / Known Limitations

- Seat concurrency is protected by a **unique DB constraint** (`show_id`, `seat_id`) plus a pre-check query, not pessimistic row locking (`SELECT ... FOR UPDATE`). Two simultaneous booking requests for the same seat will race, but the losing request gets a clean `409 Conflict` (`SeatAlreadyBookedException`) instead of corrupting data.
- Poster images are stored on the local filesystem (`uploads/movies/`), not in cloud storage — fine for local dev, would need to move to S3/Cloudinary/etc. for production.
- `ddl-auto: update` is convenient for development but isn't safe for production schema migrations — a tool like Flyway or Liquibase would be the next step.
