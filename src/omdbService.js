/**
 * OMDb Service - enriches TMDb movies with IMDb, Rotten Tomatoes, and Metacritic ratings.
 * Uses OMDb API (https://www.omdbapi.com/).
 */

import { getCache, setCache } from "./cache.js?v=20260521i";

const OMDB_API_BASE = "https://www.omdbapi.com/";
const OMDB_API_KEY = "119ab55a"; // TODO: replace with real key.
const OMDB_PLACEHOLDER_KEY = "<YOUR_OMDB_API_KEY>";

export function hasOmdbApiKey() {
  return Boolean(OMDB_API_KEY && OMDB_API_KEY !== OMDB_PLACEHOLDER_KEY);
}

function normalizeRatings(data = {}) {
  const ratings = {
    imdb: data.imdbRating && data.imdbRating !== "N/A" ? data.imdbRating : null,
    imdbVotes: data.imdbVotes && data.imdbVotes !== "N/A" ? data.imdbVotes : null,
    rottenTomatoes: null,
    metacritic: data.Metascore && data.Metascore !== "N/A" ? `${data.Metascore}/100` : null,
  };

  (data.Ratings || []).forEach((item) => {
    if (item.Source === "Rotten Tomatoes") {
      ratings.rottenTomatoes = item.Value;
    }
    if (item.Source === "Metacritic" && !ratings.metacritic) {
      ratings.metacritic = item.Value;
    }
  });

  return ratings;
}

export async function getOmdbRatings(imdbId) {
  if (!hasOmdbApiKey() || !imdbId) {
    return null;
  }

  const cacheKey = `omdb_ratings_${imdbId}`;
  const cached = getCache(cacheKey);
  if (cached) {
    return cached;
  }

  const url = new URL(OMDB_API_BASE);
  url.searchParams.set("apikey", OMDB_API_KEY);
  url.searchParams.set("i", imdbId);
  url.searchParams.set("plot", "short");

  const response = await fetch(url.toString());
  if (!response.ok) {
    console.warn("OMDb ratings error", response.status, response.statusText);
    return null;
  }

  const data = await response.json();
  if (data.Response === "False") {
    console.warn("OMDb ratings unavailable", data.Error || imdbId);
    return null;
  }

  const ratings = normalizeRatings(data);
  setCache(cacheKey, ratings, 24);
  return ratings;
}
