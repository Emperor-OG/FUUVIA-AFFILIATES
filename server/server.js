const express = require("express");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
require("dotenv").config();

const affiliatePublicRoutes = require("./routes/affiliatePublic");
const affiliateAuthRoutes = require("./routes/affiliateAuth");
const affiliateAdminRoutes = require("./routes/affiliateAdmin");

const app = express();
const PORT = process.env.PORT || 8080;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "affiliate-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Affiliate server running" });
});

app.use("/api/affiliates", affiliatePublicRoutes);
app.use("/api/affiliates", affiliateAuthRoutes);
app.use("/api/affiliates/admin", affiliateAdminRoutes);

const distPath = path.join(__dirname, "..", "dist");
app.use(express.static(distPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Affiliate server running on port ${PORT}`);
});
