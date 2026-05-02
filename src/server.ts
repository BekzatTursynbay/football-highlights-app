import express from "express";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "../public")));

// Optionally, serve watch.html for direct root access
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/watch.html"));
});

// Protected endpoint triggered by GitHub Actions cron
app.post("/run", (req, res) => {
  const token = req.headers["x-cron-secret"];
  if (!token || token !== process.env.CRON_SECRET) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  // Import here to avoid circular dependency
  const { runHighlights } = require("./index");
  runHighlights()
    .then(() => res.json({ ok: true }))
    .catch((err: Error) => {
      console.error("Error in /run:", err);
      res.status(500).json({ error: err.message });
    });
});

app.listen(PORT, () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
