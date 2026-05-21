/**
 * Groq Service – fetches movie suggestions based on a mood.
 * Uses the Groq public endpoint (https://api.groq.com/openai/v1/chat/completions).
 * The API key should be provided by replacing the placeholder for local MVP testing.
 */

import { setCache, getCache } from "./cache.js?v=20260521i";
import { delay } from "./utils.js?v=20260521i";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = "<YOUR_GROQ_API_KEY>";
const GROQ_PLACEHOLDER_KEY = "<YOUR_GROQ_API_KEY>";
const GROQ_MODEL = "llama-3.3-70b-versatile";

/**
 * Builds the system prompt for mood‑to‑movie suggestion.
 * @param {string} mood The user‑selected mood (e.g., "happy").
 * @param {string[]} excludedTitles Movie titles to avoid repeating.
 * @returns {string} Prompt text.
 */
function buildPrompt(mood, excludedTitles = []) {
  const exclusions = excludedTitles.length > 0
    ? `Do not suggest any of these movies: ${excludedTitles.join(", ")}.`
    : "";
  return `User mood: ${mood}. ${exclusions} Suggest 5-8 different movie titles that match this mood. Return a JSON array of movie titles only, no extra text.`;
}

/**
 * Calls the Groq API with a generated prompt.
 * @param {string} mood Mood selected by the user.
 * @param {string[]} [excludedTitles=[]] Movie titles to avoid repeating.
 * @param {number} [timeout=30000] Timeout in ms (default 30s).
 * @returns {Promise<string[]>} Array of movie titles.
 */
export async function fetchMovieTitlesFromGroq(mood, excludedTitles = [], timeout = 30000) {
  if (!GROQ_API_KEY || GROQ_API_KEY === GROQ_PLACEHOLDER_KEY) {
    throw new Error(
      "Groq API key is not configured. Add your free-tier key before deploying.",
    );
  }

  // First, try to get from cache (1‑hour TTL as per spec)
  const exclusionKey = excludedTitles.slice(0, 30).join("|").toLowerCase();
  const cacheKey = `groq_mood_${mood}_${exclusionKey}`;
  const cached = getCache(cacheKey);
  if (cached) {
    return cached;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  const body = {
    model: GROQ_MODEL,
    messages: [{ role: "system", content: buildPrompt(mood, excludedTitles) }],
    temperature: 0.7,
  };

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const apiMessage =
        errorBody?.error?.message || response.statusText || "Unknown Groq API error";
      console.error("Groq API error", response.status, apiMessage);
      throw new Error("Groq API error " + response.status + ": " + apiMessage);
    }
    const data = await response.json();
    // Expected structure: { choices: [{ message: { content: '...json...' } }] }
    const rawContent = data?.choices?.[0]?.message?.content;
    let titles = [];
    try {
      titles = JSON.parse(rawContent);
    } catch (e) {
      console.warn("Failed to parse Groq JSON, attempting fallback extraction");
      // Simple fallback: extract quoted strings
      const matches = rawContent?.match(/"([^"]+)"/g) || [];
      titles = matches.map((m) => m.replace(/"/g, ""));
    }
    // Cache the result for 1 hour
    setCache(cacheKey, titles, 1);
    return titles;
  } catch (e) {
    if (e.name === "AbortError") {
      console.error("Groq request timed out");
    }
    // Propagate error to caller
    throw e;
  }
}
