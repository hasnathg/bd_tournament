const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const playerRoutes = require("./routes/players.routes");
const tournamentRoutes = require("./routes/tournaments.routes");
const matchRoutes = require("./routes/matches.routes");



const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://bd-tournament.netlify.app"],
  })
);
app.use(express.json());

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/tournaments", tournamentRoutes);
app.use("/api/matches", matchRoutes);


// Start
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("BD Tournament API is running. Try /api/health");
});

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
