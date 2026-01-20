export default async function handler(req, res) {
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

    // Optional: block localhost/private network targets (simple protection)
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.endsWith(".local")
    ) {
      res.status(400).send("Blocked host");
      return;
    }

    const upstream = await fetch(url, {
      headers: {
        // Helps many sites return readable HTML
        "User-Agent":
          "Mozilla/5.0 (compatible; SkimrDemo/1.0; +https://vercel.com)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!upstream.ok) {
      res.status(upstream.status).send(`Upstream error: ${upstream.status}`);
      return;
    }

    const html = await upstream.text();

    // CORS headers so your frontend can call this endpoint
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "text/html; charset=utf-8");

    res.status(200).send(html);
  } catch (err) {
    res.status(500).send("Proxy failed");
  }
}
