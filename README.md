# Intelligent Traffic Violation Detection System

An agent-ready smart traffic management foundation with a polished operator login, Google OAuth, MongoDB-backed sessions, Docker, and Jenkins deployment.

## Local development

1. Copy `server/.env.example` to `server/.env`.
2. Set `MONGODB_URI`, `SESSION_SECRET`, and the Google OAuth values. In Google Cloud Console, add `http://localhost:5000/auth/google/callback` as an authorized redirect URI.
3. Install and start MongoDB, then run:

```powershell
npm install
npm run install:all
npm run dev
```

The client runs at `http://localhost:5173`. Demo access is `demo@traffic.ai` / `Demo@123`.

## Docker and Jenkins

`docker compose up --build` starts the API/client container on port 5000 and MongoDB with a persistent volume. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `SESSION_SECRET` in the Jenkins job or deployment environment. The `Jenkinsfile` installs dependencies, runs tests, builds the client, builds the Docker image, and deploys with Docker Compose. The Jenkins agent must have Docker and the Docker Compose plugin available.
