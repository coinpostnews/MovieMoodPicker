/**
 * TMDb Service – utilities for searching movies and fetching movie details.
 * Uses TMDb v3 API (https://api.themoviedb.org/3).
 * The API key should be provided as `TMDB_API_KEY` (environment variable or hard‑coded for MVP).
 */

import { getCache, setCache } from "./cache.js?v=20260521i";

const TMDB_API_BASE = "https://api.themoviedb.org/3";
const TMDB_API_KEY = "c10c520dc33e619e300326baeb574236"; // TODO: replace with real key
const TMDB_PLACEHOLDER_KEY = "<YOUR_TMDB_API_KEY>";
const LANGUAGE = "ru-RU";

/**
 * Helper to build a full TMDb URL with common query parameters.
 * @param {string} path API endpoint path (e.g., '/search/movie')
 * @param {object} params Additional query parameters.
 * @returns {string} Full URL.
 */
function buildUrl(path, params = {}) {
  if (!TMDB_API_KEY || TMDB_API_KEY === TMDB_PLACEHOLDER_KEY) {
    throw new Error(
      "TMDb API key is not configured. Add your free-tier key before deploying.",
    );
  }

  const url = new URL(TMDB_API_BASE + path);
  url.searchParams.set("api_key", TMDB_API_KEY);
  url.searchParams.set("language", LANGUAGE);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}

/**
 * Searches TMDb for movies matching a title.
 * @param {string} title Movie title to search for.
 * @param {number} [page=1] Page number (TMDb pagination).
 * @returns {Promise<object[]>} Array of TMDb movie objects.
 */
export async function searchMoviesByTitle(title, page = 1) {
  const cacheKey = `tmdb_search_${title}_${page}`;
  const cached = getCache(cacheKey);
  if (cached) {
    return cached;
  }

  const url = buildUrl("/search/movie", { query: title, page });
  const response = await fetch(url);
  if (!response.ok) {
    console.error("TMDb search error", response.status, response.statusText);
    throw new Error("TMDb search failed");
  }
  const data = await response.json();
  const results = data.results || [];
  // Cache for 1 hour (search results are relatively static)
  setCache(cacheKey, results, 1);
  return results;
}

/**
 * Retrieves detailed information for a movie, including watch providers.
 * @param {number|string} movieId TMDb movie identifier.
 * @returns {Promise<object>} Detailed movie object.
 */
export async function getMovieDetails(movieId) {
  const cacheKey = `tmdb_detail_v2_${movieId}`;
  const cached = getCache(cacheKey);
  if (cached) {
    return cached;
  }

  const url = buildUrl(`/movie/${movieId}`, {
    append_to_response: "watch/providers,credits,external_ids",
  });
  const response = await fetch(url);
  if (!response.ok) {
    console.error("TMDb details error", response.status, response.statusText);
    throw new Error("TMDb details fetch failed");
  }
  const data = await response.json();
  // Cache for 24 hours (movie details change rarely)
  setCache(cacheKey, data, 24);
  return data;
}
