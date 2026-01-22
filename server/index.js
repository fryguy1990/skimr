import express from "express";

const app = express();
const PORT = 8787;

// Simple health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.get("/api/fetch", async (req, res) => {
  try {
    const url = req.query.url;

    if (!url || typeof url !== "string") {
      res.status(400).send("Missing ?url=");
      return;
    }

    // Basic safety: only allow http/https
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      res.status(400).send("Invalid URL");
      return;
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
      res.status(400).send("Only http/https allowed");
      return;
    }

    // Optional: block localhost/private network targets
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.endsWith(".local")
    ) {
      res.status(400).send("Blocked host");
      return;
    }

    // Fetch upstream HTML
    const upstream = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SkimrDemo/1.0; +https://example.com)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    const contentType = upstream.headers.get("content-type") || "";

    if (!upstream.ok) {
      res.status(upstream.status).send(`Upstream error: ${upstream.status}`);
      return;
    }

    // If the site returns non-HTML, stop
    if (!contentType.includes("text/html")) {
      res
        .status(415)
        .send(`Upstream did not return HTML. Content-Type: ${contentType}`);
      return;
    }

    const html = await upstream.text();

    // Allow your frontend to call this endpoint
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "text/html; charset=utf-8");

    res.status(200).send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send("Proxy failed");
  }
});

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
