import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcryptjs";

const app = express();
const port = process.env.PORT || 5000;
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, select: false },
  googleId: { type: String, index: true },
  avatar: String,
  role: { type: String, enum: ["admin", "operator"], default: "operator" }
}, { timestamps: true });
const User = mongoose.model("User", userSchema);

app.use(cors({ origin: clientUrl, credentials: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || "development-only-session-secret",
  resave: false,
  saveUninitialized: false,
  store: process.env.MONGODB_URI ? MongoStore.create({ mongoUrl: process.env.MONGODB_URI }) : undefined,
  cookie: {
    httpOnly: true,
    sameSite: process.env.SECURE_COOKIES === "true" ? "none" : "lax",
    secure: process.env.SECURE_COOKIES === "true",
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => User.findById(id).then((user) => done(null, user)).catch(done));
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || `${clientUrl}/auth/google/callback`
  }, async (_accessToken, _refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) return done(new Error("Google did not provide an email address."));
      const user = await User.findOneAndUpdate(
        { email },
        { $set: { name: profile.displayName, googleId: profile.id, avatar: profile.photos?.[0]?.value } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      return done(null, user);
    } catch (error) { return done(error); }
  }));
}

const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar });
const requireAuth = (req, res, next) => req.isAuthenticated() ? next() : res.status(401).json({ message: "Authentication required." });

app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "traffic-violation-api" }));
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 6) return res.status(400).json({ message: "Name, email, and a password of at least 6 characters are required." });
    if (await User.findOne({ email })) return res.status(409).json({ message: "An account with this email already exists." });
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 12), role: "operator" });
    req.login(user, (error) => error ? res.status(500).json({ message: "Unable to start your session." }) : res.status(201).json({ user: publicUser(user) }));
  } catch (error) { res.status(500).json({ message: "Unable to create account." }); }
});
app.post("/api/auth/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const user = await User.findOne({ email }).select("+password");
    const isDemo = email === "demo@traffic.ai" && password === "Demo@123";
    if (!user && isDemo) {
      const demo = await User.create({ name: "Demo Operator", email, password: await bcrypt.hash(password, 12), role: "admin" });
      return req.login(demo, (error) => error ? res.status(500).json({ message: "Unable to start your session." }) : res.json({ user: publicUser(demo) }));
    }
    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: "Invalid email or password." });
    req.login(user, (error) => error ? res.status(500).json({ message: "Unable to start your session." }) : res.json({ user: publicUser(user) }));
  } catch (error) { res.status(500).json({ message: "Unable to sign in." }); }
});
app.post("/api/auth/demo", async (req, res) => {
  try {
    const email = "demo@traffic.ai";
    const demo = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          name: "Demo Operator",
          email,
          password: await bcrypt.hash("Demo@123", 12),
          role: "admin"
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    req.login(demo, (error) => error
      ? res.status(500).json({ message: "Unable to start the demo session." })
      : res.json({ user: publicUser(demo) }));
  } catch (error) {
    console.error("Demo login failed:", error);
    res.status(500).json({ message: "Unable to start the demo session." });
  }
});
app.get("/auth/google", (req, res, next) => process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  ? passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next)
  : res.status(503).send("Google OAuth is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to the server environment."));
app.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: `${clientUrl}?authError=google` }), (_req, res) => res.redirect(clientUrl));
app.get("/api/auth/me", requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));
app.post("/api/auth/logout", (req, res) => req.logout((error) => error ? res.status(500).json({ message: "Unable to sign out." }) : req.session.destroy(() => res.json({ message: "Signed out." }))));
app.get("/api/dashboard", requireAuth, (_req, res) => res.json({ message: "Dashboard data is available." }));

const clientDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../client/dist");
app.use(express.static(clientDist));
app.get("*", (_req, res) => res.sendFile(path.join(clientDist, "index.html")));

async function start() {
  if (process.env.MONGODB_URI) await mongoose.connect(process.env.MONGODB_URI);
  app.listen(port, () => console.log(`Traffic API listening on port ${port}`));
}
start().catch((error) => { console.error("Unable to start server:", error); process.exit(1); });
