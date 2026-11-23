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

## API documentation

Swagger UI is available at `http://localhost:5000/api/docs`.
The OpenAPI 3 specification is available at `http://localhost:5000/api/openapi.json`.

## Selenium browser test

With Microsoft Edge and the complete application running, execute:

```powershell
npm run test:e2e
```

This opens Microsoft Edge in headless mode, signs in with the demo account, verifies the dashboard, and tests logout.

## Docker and Jenkins

`docker compose up --build` starts the API/client container on port 5000 and MongoDB with a persistent volume.

In Jenkins, open **Manage Jenkins → Credentials → System → Global credentials** and add these three **Secret text** credentials:

| Credential ID | Secret value |
|---|---|
| `traffic-google-client-id` | OAuth 2.0 Web application client ID |
| `traffic-google-client-secret` | OAuth 2.0 Web application client secret |
| `traffic-session-secret` | A long random session-signing secret |

The Google OAuth client must authorize `http://localhost:5000` and `http://localhost:5000/auth/google/callback`. The Jenkins agent must have Docker and the Docker Compose plugin available.
