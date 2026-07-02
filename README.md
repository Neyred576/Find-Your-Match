# Find Your Match

A modern, real-time random text and video chat platform.

## Features
- **Instant text chat**: Socket.IO powered messaging with typing indicators
- **High-quality video chat**: Peer-to-peer WebRTC connection
- **Anonymous**: No sign-up required, just click and chat
- **Real-time matchmaking**: Instantly connect with the next available user
- **Admin Dashboard**: Real-time stats and moderation tools

## Tech Stack
- **Frontend**: Next.js 14, React, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, Socket.IO
- **Database**: MongoDB (Mongoose)
- **Infrastructure**: Redis, Docker

## Setup (Docker - Recommended)

1. Ensure Docker and Docker Compose are installed.
2. In the root directory, run:
   ```bash
   docker-compose up --build -d
   ```
3. Access the application:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`

## Manual Setup

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

## Admin Access
- URL: `http://localhost:3000/admin`
- Password: `Prosper@090021` (This should be hashed and placed in the backend `.env` file as `ADMIN_PASSWORD_HASH`)
