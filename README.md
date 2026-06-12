# AI-Powered Customer Support Routing System

## Overview

This project is a mini AI-powered customer support routing system built using Node.js, Express, Supabase, and JWT Authentication.

The system allows customers to submit support requests, automatically classifies them using a mock AI workflow, assigns priorities, stores AI results separately, and provides an admin dashboard for monitoring and managing requests.

---

## Features

### Customer Request Management
- Create customer requests
- Store customer information and messages
- Track request status

### AI Classification Workflow
- Category classification
- Priority assignment
- Automatic summary generation
- Confidence scoring
- Separate AI output storage

### Async Processing
- Request creation returns immediately
- AI classification runs asynchronously
- Background queue simulation using setTimeout

### Authentication & Security
- JWT Authentication
- Password hashing using bcrypt
- Role-based authorization (Admin vs Agent)
- Environment variable protection

### Admin Dashboard
- Frontend login page
- View customer requests
- View AI classifications
- Auto-refresh dashboard updates
- Add internal notes
- Update request status

---

## Tech Stack

### Backend
- Node.js
- Express.js

### Database
- Supabase PostgreSQL

### Authentication
- JWT (JSON Web Tokens)
- bcrypt

### Frontend
- HTML
- CSS
- JavaScript

---

## Database Schema

### users

| Field | Type |
|---------|---------|
| id | bigint |
| email | text |
| password_hash | text |
| role | text |
| created_at | timestamp |

### customer_requests

| Field | Type |
|---------|---------|
| id | bigint |
| customer_name | text |
| customer_email | text |
| message | text |
| status | text |
| created_at | timestamp |

### ai_classifications

| Field | Type |
|---------|---------|
| id | bigint |
| request_id | bigint |
| category | text |
| priority | text |
| summary | text |
| confidence | numeric |
| reason | text |

### internal_notes

| Field | Type |
|---------|---------|
| id | bigint |
| request_id | bigint |
| author | text |
| note | text |
| created_at | timestamp |

---

## API Endpoints

### Authentication

```http
POST /login
POST /register
```

### Requests

```http
POST /requests
GET /requests
PATCH /requests/:id/status
```

### Notes

```http
POST /requests/:id/notes
```

### AI Classifications

```http
GET /classifications
```

---

## AI Workflow

Customer Request

↓

Stored in customer_requests

↓

Background Processing

↓

Mock AI Classification

↓

Category + Priority + Summary Generated

↓

Stored in ai_classifications

↓

Displayed in Admin Dashboard

---

## Authentication Flow

Admin Login

↓

Credentials Verified

↓

JWT Token Generated

↓

Token Stored in Browser

↓

Protected API Access

↓

Role-Based Authorization

---

## Architecture

Frontend (login.html, admin.html)

↓

Express API

↓

Supabase Database

↓

Background AI Worker Simulation

↓

AI Classification Storage

↓

Admin Dashboard Updates

---

## Setup Instructions

### Install Dependencies

```bash
npm install
```

### Create Environment File

Create a `.env` file:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
JWT_SECRET=your_jwt_secret
```

### Run Server

```bash
npm start
```

Server runs on:

```text
http://localhost:5000
```

---

## Security Features

- JWT Authentication
- Password Hashing with bcrypt
- Role-Based Authorization
- Environment Variable Protection
- Protected Admin Endpoints

---

## Known Limitations

- Uses a mock AI classifier instead of a real LLM
- Dashboard uses auto-refresh instead of true realtime updates
- Basic frontend styling
- Limited validation

---

## Future Improvements

- Supabase Realtime
- Socket.io integration
- React dashboard
- Redis/BullMQ queue
- Event timeline tracking
- OpenAI/Gemini integration
- Refresh tokens

---

## Author

**Sanjana Bejoy**

Built for the Cognifyr AI Workflow Ops Backend Internship Assessment.
