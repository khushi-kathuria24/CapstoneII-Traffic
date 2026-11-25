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

The Delhi map uses Google Maps JavaScript API and its traffic layer when a key is configured. In Google Cloud, enable **Maps JavaScript API** and billing, then create a browser key restricted by HTTP referrer (allow `http://localhost:5174/*` and `http://localhost:5001/*` if serving the client through Docker). Add it to the ignored `client/.env.local` file:

```env
VITE_GOOGLE_MAPS_API_KEY=your-restricted-browser-key
```

Restart the client after setting the key. Without it, the map falls back to OpenStreetMap. Junction markers and citizen-service content remain sample data.

## API documentation

Swagger UI is available at `http://localhost:5000/api/docs`.
The OpenAPI 3 specification is available at `http://localhost:5000/api/openapi.json`.
In Swagger UI, run **POST /api/auth/demo** (or signup/login), copy the returned `accessToken`, then click **Authorize** and enter the token. Use it to call protected endpoints such as **GET /api/auth/me** and **GET /api/dashboard**. Bearer tokens expire after 15 minutes and cannot be revoked early; logout clears the existing session cookie, which remains supported alongside bearer tokens.

## Tests

Run `npm test` for API endpoint tests. They start the API on a temporary local port and do not require MongoDB. Jenkins runs this command in its **Install and test** stage. The Selenium browser flow is separate and requires the complete application to be running; run it with `npm run test:e2e`.

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

`docker compose up --build` starts the API/client container at `http://localhost:5001` and MongoDB with a persistent volume. The host port defaults to 5001 so it does not conflict with the local Node API on port 5000; override it with `APP_HOST_PORT` if needed.

In Jenkins, open **Manage Jenkins → Credentials → System → Global credentials** and add these two **Secret text** credentials:

| Credential ID | Secret value |
|---|---|
| `traffic-google-client-id` | OAuth 2.0 Web application client ID |
| `traffic-google-client-secret` | OAuth 2.0 Web application client secret |
| `traffic-ngrok-authtoken` | ngrok account authtoken |

The Jenkins agent must have Docker, Docker Compose v2, Node.js, and the ngrok CLI available, plus all three credentials listed above. The pipeline starts an HTTPS ngrok tunnel to the configured `APP_HOST_PORT` before deployment and passes its public URL to the app (including the Google OAuth callback). The tunnel stays active after a successful build and is replaced on the next build; it is stopped if the build fails. Set the optional `NGROK_DOMAIN` build parameter to an ngrok reserved domain for a stable URL. For Google sign-in, authorize the tunnel's HTTPS origin and `/auth/google/callback` redirect URI in Google OAuth; a randomly assigned ngrok URL changes between builds and must be authorized before sign-in will work. Keep the port-5000 callback authorized for local Node development. The Jenkins pipeline generates a fresh 48-byte session-signing secret for each deployment, so users may need to sign in again after a deploy. Deployment waits for the container's `/api/health` check and updates the app without stopping the persistent MongoDB service.
