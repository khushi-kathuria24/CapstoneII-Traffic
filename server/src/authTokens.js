import { createHmac } from "node:crypto";
import jwt from "jsonwebtoken";

const issuer = "traffic-violation-api";
const audience = "traffic-violation-client";

const getSigningSecret = () => createHmac(
  "sha256",
  process.env.SESSION_SECRET || "development-only-session-secret"
).update("traffic-api-access-token").digest();

export const accessTokenLifetimeSeconds = 900;

export const createAccessToken = (user) => jwt.sign(
  { user },
  getSigningSecret(),
  {
    algorithm: "HS256",
    audience,
    expiresIn: accessTokenLifetimeSeconds,
    issuer,
    subject: user.id
  }
);

export const verifyAccessToken = (token) => jwt.verify(token, getSigningSecret(), {
  algorithms: ["HS256"],
  audience,
  issuer
});
