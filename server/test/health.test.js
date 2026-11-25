import test from "node:test";
import assert from "node:assert/strict";

process.env.MONGODB_URI = "";
process.env.SESSION_SECRET = "test-session-secret-for-jwt-access-tokens";
const { app } = await import("../src/server.js");
const { createAccessToken } = await import("../src/authTokens.js");

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
});

test("health endpoint returns the API status and service name", async () => {
  const response = await fetch(`${baseUrl}/api/health`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    status: "ok",
    service: "traffic-violation-api"
  });
});

test("OpenAPI endpoint describes the health route", async () => {
  const response = await fetch(`${baseUrl}/api/openapi.json`);
  const document = await response.json();

  assert.equal(response.status, 200);
  assert.equal(document.openapi, "3.0.3");
  assert.equal(document.paths["/api/health"].get.summary, "Check API health");
  assert.deepEqual(document.components.securitySchemes.bearerAuth, {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "Use the accessToken returned by signup, login, or demo login. Tokens expire after 15 minutes and cannot be revoked before expiry; logout clears the session cookie."
  });
  assert.deepEqual(document.paths["/api/auth/me"].get.security, [
    { bearerAuth: [] },
    { sessionCookie: [] }
  ]);
  assert.deepEqual(document.paths["/api/dashboard"].get.security, [
    { bearerAuth: [] },
    { sessionCookie: [] }
  ]);
  assert.equal(document.paths["/api/auth/login"].post.responses["200"].content["application/json"].schema.$ref, "#/components/schemas/AuthResponse");
});

test("current-user endpoint rejects unauthenticated requests", async () => {
  const response = await fetch(`${baseUrl}/api/auth/me`);

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), {
    message: "Authentication required."
  });
});

test("bearer access tokens authorize protected endpoints", async () => {
  const user = {
    id: "test-user",
    name: "Test User",
    email: "test@example.com",
    role: "operator",
    avatar: null
  };
  const token = createAccessToken(user);
  const headers = { authorization: `Bearer ${token}` };

  const currentUserResponse = await fetch(`${baseUrl}/api/auth/me`, { headers });
  assert.equal(currentUserResponse.status, 200);
  assert.deepEqual((await currentUserResponse.json()).user, user);

  const dashboardResponse = await fetch(`${baseUrl}/api/dashboard`, { headers });
  assert.equal(dashboardResponse.status, 200);
});

test("protected endpoints reject invalid bearer tokens", async () => {
  const response = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { authorization: "Bearer invalid-token" }
  });

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), {
    message: "Invalid or expired bearer token."
  });
});
