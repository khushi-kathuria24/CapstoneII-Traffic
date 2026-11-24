# TrafficNexus

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

The client runs at `http://localhost:5174` and the API at `http://localhost:5000`. Demo access is `demo@traffic.ai` / `Demo@123`.

## Google Maps setup

The Delhi map uses Google Maps JavaScript API and its traffic layer when a key is configured. In Google Cloud, enable **Maps JavaScript API** and billing, then create a browser key restricted by HTTP referrer (allow `http://localhost:5174/*` and `http://localhost:5000/*` if serving the client through the API). Add it to the ignored `client/.env.local` file:

```env
VITE_GOOGLE_MAPS_API_KEY=your-restricted-browser-key
```

Restart the client after setting the key. Without it, the map falls back to OpenStreetMap. Junction markers and citizen-service content remain sample data.

## API documentation

Swagger UI is available at `http://localhost:5000/api/docs`.
The OpenAPI 3 specification is available at `http://localhost:5000/api/openapi.json`.

## Selenium browser test

With Microsoft Edge and the complete application running, execute:

```powershell
npm run test:e2e
```

This opens Microsoft Edge in headless mode, signs in with the demo account, verifies the dashboard, and tests logout.

## Record a Selenium walkthrough

With the application running, execute:

```powershell
npm run record:demo
```

With Microsoft Edge and the complete application running, this opens a visible, maximized browser window, checks that **Continue with Google** redirects to Google's OAuth page, signs in with the demo account, and visits every admin dashboard section. It then logs out, selects **User portal**, signs in again, and visits the citizen services. It does not enter Google credentials or complete Google consent. Recording is never started by `npm run dev`; it starts only when you explicitly run `npm run record:demo`. The approximately 30-second MP4 is saved under `recordings/`. To change the application URL or output file, set `APP_URL` or `RECORDING_PATH` before running the command.

Open two terminals in the repository. In the first, start the app:

```powershell
npm run dev
```

In the second, run the walkthrough:

```powershell
npm run record:demo
```

For a separate existing citizen account, set `CLIENT_TEST_EMAIL` and `CLIENT_TEST_PASSWORD` in the second terminal before running the walkthrough; otherwise it reuses the demo account. The two portal selections currently share the same authentication endpoint.

Without a Google Maps key, the Delhi map falls back to OpenStreetMap tiles. Congestion markers, sensor readings, bookings, fines, and civic reports are sample UI data and are not connected to live city services.

## Docker and Jenkins

`docker compose up --build` starts the API/client container on port 5000 and MongoDB with a persistent volume.

In Jenkins, open **Manage Jenkins → Credentials → System → Global credentials** and add these three **Secret text** credentials:

| Credential ID | Secret value |
|---|---|
| `traffic-google-client-id` | OAuth 2.0 Web application client ID |
| `traffic-google-client-secret` | OAuth 2.0 Web application client secret |
| `traffic-session-secret` | A long random session-signing secret |

The Google OAuth client must authorize `http://localhost:5000` and `http://localhost:5000/auth/google/callback`. The Jenkins agent must have Docker and the Docker Compose plugin available.
