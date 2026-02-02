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

app.listen(PORT, () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
