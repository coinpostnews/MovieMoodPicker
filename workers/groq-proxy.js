const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const DEFAULT_ALLOWED_ORIGINS = [
  "https://coinpostnews.github.io",
  "http://localhost:4173",
  "http://localhost:4174",
];

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowedOrigin = getAllowedOrigin(origin, env);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(allowedOrigin),
      });
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, allowedOrigin);
    }

    if (!allowedOrigin) {
      return json({ error: "Origin is not allowed" }, 403, null);
    }

    if (!env.GROQ_API_KEY) {
      return json({ error: "GROQ_API_KEY secret is not configured" }, 500, allowedOrigin);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ error: "Request body must be valid JSON" }, 400, allowedOrigin);
    }

    const mood = String(payload.mood || "").trim();
    const excludedTitles = Array.isArray(payload.excludedTitles)
      ? payload.excludedTitles.map(String).filter(Boolean).slice(0, 60)
      : [];

    if (!mood) {
      return json({ error: "Mood is required" }, 400, allowedOrigin);
    }

    const groqResponse = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "system", content: buildPrompt(mood, excludedTitles) }],
        temperature: 0.7,
      }),
    });

    const data = await groqResponse.json().catch(() => ({}));
    if (!groqResponse.ok) {
      const message = data?.error?.message || groqResponse.statusText || "Groq API error";
      return json({ error: message }, groqResponse.status, allowedOrigin);
    }

    const rawContent = data?.choices?.[0]?.message?.content || "";
    const titles = parseTitles(rawContent);
    if (titles.length === 0) {
      return json({ error: "Groq returned no parseable titles" }, 502, allowedOrigin);
    }

    return json({ titles }, 200, allowedOrigin);
  },
};

function buildPrompt(mood, excludedTitles) {
  const exclusions = excludedTitles.length > 0
    ? `Do not suggest any of these movies: ${excludedTitles.join(", ")}.`
    : "";

  return [
    `User mood: ${mood}.`,
    exclusions,
    "Suggest 5-8 different movie titles that match this mood.",
    "Return a JSON array of movie titles only, no extra text.",
  ].filter(Boolean).join(" ");
}

function parseTitles(rawContent) {
  try {
    const parsed = JSON.parse(rawContent);
    if (Array.isArray(parsed)) {
      return parsed.map(String).map((title) => title.trim()).filter(Boolean);
    }
  } catch {
    // Fall through to quoted-string extraction.
  }

  const matches = rawContent.match(/"([^"]+)"/g) || [];
  return matches.map((item) => item.replace(/"/g, "").trim()).filter(Boolean);
}

function getAllowedOrigin(origin, env) {
  const configured = env.ALLOWED_ORIGINS
    ? env.ALLOWED_ORIGINS.split(",").map((item) => item.trim()).filter(Boolean)
    : DEFAULT_ALLOWED_ORIGINS;

  return configured.includes(origin) ? origin : "";
}

function corsHeaders(origin) {
  if (!origin) {
    return {};
  }

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin),
    },
  });
}
