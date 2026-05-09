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
app.post("/run", async (req, res) => {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("POST /run failed: missing CRON_SECRET");
    res.status(500).json({ error: "Server misconfiguration: missing CRON_SECRET" });
    return;
  }

  const headerToken = req.headers["x-cron-secret"];
  const token = Array.isArray(headerToken) ? headerToken[0] : headerToken;

  if (!token || token !== cronSecret) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    // Import here to avoid circular dependency
    const { runHighlights } = require("./index") as {
      runHighlights: () => Promise<void>;
    };

    await runHighlights();
    res.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("POST /run failed:", err);
    res.status(500).json({
      error: "Internal server error",
      message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
