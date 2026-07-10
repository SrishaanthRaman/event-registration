# Momently — Event Registration & Booking Platform

A full-stack event registration and booking website where users can sign up, log in, explore event packages, and book available dates through a real-time availability calendar — capped at a maximum of 4 events per day to ensure quality service for every booking.

---

##  Live Demo

**Hosted URL:** https://momentlyevents.onrender.com

*Note: hosted on Render's free tier — the server may take 30-50 seconds to wake up if it hasn't been visited recently.*

---

##  Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [How the Calendar Availability Logic Works](#how-the-calendar-availability-logic-works)
- [Known Limitations](#known-limitations)
- [Future Improvements](#future-improvements)
- [Team](#team)

---

##  Features

- **User Authentication** — Signup, login, and logout using session-based authentication with bcrypt password hashing
- **Real-Time Availability Calendar** — Interactive calendar (powered by Flatpickr) showing open, limited, and fully booked dates using color-coded dot indicators
- **4-Events-Per-Day Cap** — Server-side enforced limit ensures no date can be overbooked, verified independently of the frontend
- **Event Booking** — Users can select a date, name their event, and choose from Basic, Premium, or Deluxe packages
- **Contact Form** — Visitor inquiries are stored directly in the database for follow-up
- **Responsive Single-Page Design** — Smooth-scrolling navigation across Home, About, Services, Gallery, Team, and Contact sections
- **Bold, Fully Customizable Theme** — Every background color/image in the codebase is clearly commented for easy editing
- **Cloud Database** — All user, booking, and message data persisted in MongoDB Atlas

---

##  Tech Stack

**Frontend:**
- HTML5, CSS3, Vanilla JavaScript
- [Flatpickr](https://flatpickr.js.org/) — lightweight date-picker library

**Backend:**
- Node.js
- Express.js

**Database:**
- MongoDB Atlas (cloud-hosted)
- Mongoose (ODM)

**Authentication:**
- express-session (session management)
- bcrypt (password hashing)

**Deployment:**
- Render (hosting)
- GitHub (version control, auto-deploy on push)

---

##  Project Architecture

```
┌─────────────┐        HTTP Requests        ┌──────────────┐
│   Browser   │ ───────────────────────────▶ │   Express    │
│  (Frontend) │ ◀─────────────────────────── │   Server     │
└─────────────┘        JSON Responses        └──────┬───────┘
                                                      │
                                                      │ Mongoose
                                                      ▼
                                              ┌──────────────┐
                                              │   MongoDB    │
                                              │    Atlas     │
                                              └──────────────┘
```

The frontend is served as static files directly by Express — there is no separate frontend server. All API routes are prefixed with `/api/` and return JSON. The frontend communicates with the backend using the native `fetch()` API.

---

##  Folder Structure

```
event-registration/
├── server.js                  # Application entry point
├── package.json                # Dependencies and scripts
├── .env                        # Environment variables (not committed)
├── .gitignore
├── config/
│   └── db.js                  # MongoDB Atlas connection logic
├── models/
│   ├── User.js                # User schema
│   ├── Booking.js             # Booking schema
│   └── Message.js             # Contact message schema
├── routes/
│   ├── authRoutes.js          # Signup, login, logout
│   ├── bookingRoutes.js       # Booking + availability logic
│   └── messageRoutes.js       # Contact form submission
├── middleware/
│   └── auth.js                # Session-protection middleware
└── public/                     # Frontend — served statically by Express
    ├── index.html
    ├── css/
    │   └── style.css
    ├── js/
    │   ├── main.js             # Nav + modal + contact form logic
    │   ├── auth.js             # Signup/login/logout logic
    │   └── calendar.js         # Calendar + booking logic
    └── images/                 # Gallery and team photos
```

---

##  Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/SrishaanthRaman/event-registration.git
cd event-registration
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:
```
MONGO_URI=your_mongodb_atlas_connection_string
SESSION_SECRET=any_random_secret_string
PORT=5050
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open in browser**
```
http://localhost:5050
```

---

##  Environment Variables

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string, including database name |
| `SESSION_SECRET` | Random string used to sign session cookies |
| `PORT` | Port the local server runs on (default: 5050) |

**Note:** `.env` is excluded from version control via `.gitignore`. Never commit real credentials.

---

##  API Endpoints

### Auth Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/signup` | Register a new user | No |
| POST | `/login` | Log in and start a session | No |
| POST | `/logout` | Destroy current session | No |

### Booking Routes (`/api/bookings`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/availability?month=YYYY-MM` | Get booking counts for every date in a given month | No |
| POST | `/` | Create a new booking | Yes |
| GET | `/my-bookings` | Get all bookings made by the logged-in user | Yes |
| DELETE | `/:id` | Cancel a booking (owner only) | Yes |

### Message Routes (`/api/messages`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/` | Submit a contact form message | No |

---

##  Database Schema

**User**
```js
{
  name: String,
  age: Number,
  phone: String,
  email: String (unique),
  password: String (bcrypt hashed),
  createdAt: Date
}
```

**Booking**
```js
{
  userId: ObjectId (ref: User),
  eventName: String,
  package: String,        // "Basic" | "Premium" | "Deluxe"
  date: String,            // format: "YYYY-MM-DD"
  status: String,           // "confirmed" | "cancelled"
  createdAt: Date
}
```

**Message**
```js
{
  name: String,
  email: String,
  message: String,
  createdAt: Date
}
```

---

##  How the Calendar Availability Logic Works

1. Each date is stored as a plain string (`"YYYY-MM-DD"`) on every booking, making it simple to count bookings per day without complex date-range queries.
2. When the calendar renders a month, it calls `GET /api/bookings/availability?month=YYYY-MM`, which counts confirmed bookings grouped by date.
3. Each day on the calendar displays up to 4 small dot indicators — filled dots represent booked slots, colored based on how full the day is (open → limited → full).
4. When a user attempts to book a date, the server **independently re-counts** existing bookings for that date before saving — this is the actual enforcement point, not just the visual calendar. Even if the frontend were bypassed entirely, the 4-per-day cap cannot be exceeded.

---

##  Known Limitations

- **Session storage:** Uses `express-session`'s default in-memory store. Sessions may reset if the server restarts (e.g., during a Render free-tier spin-down after inactivity). A production version would use a persistent session store like `connect-mongo`.
- **Race conditions:** The booking availability check and the actual save are two separate steps, not wrapped in a database transaction. In theory, two users booking the exact same last slot at the exact same millisecond could both succeed. This is a low-probability edge case at this project's scale.
- **File-based uploads:** Not currently used in this version — ID proof upload was removed to avoid issues with Render's ephemeral filesystem, where locally stored files don't persist across deployments.
- **Free-tier hosting:** The live site may take 30–50 seconds to respond if it hasn't received traffic in the last 15 minutes, due to Render's free-tier server sleep behavior.

---

##  Future Improvements

- Persistent session storage (MongoDB-backed sessions)
- Email confirmation on successful booking
- Admin dashboard to view/manage all bookings and messages
- Booking cancellation UI (backend route already implemented)
- Payment gateway integration (Razorpay/Stripe) instead of manual bank transfer
- Atomic transaction handling for booking creation to fully eliminate race conditions

---

##  Team

**Srishaanth Raman.S.M** — Backend Developer
Built the Express server, MongoDB schema design, authentication system, and booking/calendar availability logic.

**Stuti Agrawal** — Frontend Developer
Built the site structure, styling, calendar UI, and connected the frontend to the backend API.

---

##  License

This project was built for academic purposes as part of a college coursework submission.
