
/**
 * API Orchestrator – coordinates Groq and TMDb services.
 * Exposes a single function `getMoodRecommendations(mood)` that returns
 * an array of enriched movie objects ready for UI rendering.
 */

import { fetchMovieTitlesFromGroq } from './groqService.js?v=20260521j';
import { getOmdbRatings } from './omdbService.js?v=20260521i';
import { searchMoviesByTitle, getMovieDetails } from './tmdbService.js?v=20260521i';
import { getState, setState } from './state.js?v=20260521i';

const HISTORY_LIMIT = 60;

function normalizeHistory(history = {}) {
    return {
        movieIds: Array.isArray(history.movieIds) ? history.movieIds.map(String) : [],
        titles: Array.isArray(history.titles) ? history.titles.filter(Boolean) : [],
    };
}

function rememberRecommendations(history, movies) {
    const nextIds = [...history.movieIds];
    const nextTitles = [...history.titles];

    movies.forEach(movie => {
        const id = String(movie.id);
        const title = movie.title || movie.original_title;
        if (id && !nextIds.includes(id)) {
            nextIds.push(id);
        }
        if (title && !nextTitles.some(item => item.toLowerCase() === title.toLowerCase())) {
            nextTitles.push(title);
        }
    });

    return {
        movieIds: nextIds.slice(-HISTORY_LIMIT),
        titles: nextTitles.slice(-HISTORY_LIMIT),
    };
}

async function enrichMovieRatings(movie) {
    const imdbId = movie.external_ids?.imdb_id || movie.imdb_id;
    const omdbRatings = await getOmdbRatings(imdbId);

    return {
        ...movie,
        ratings: {
            imdb: omdbRatings?.imdb || null,
            imdbVotes: omdbRatings?.imdbVotes || null,
            rottenTomatoes: omdbRatings?.rottenTomatoes || null,
            metacritic: omdbRatings?.metacritic || null,
            tmdb: movie.vote_average ? movie.vote_average.toFixed(1) : null,
            tmdbVotes: movie.vote_count || null,
        },
    };
}

/**
 * Helper – validates a title via TMDb search and returns the best match.
 * @param {string} title Title returned by Groq.
 * @returns {Promise<object|null>} TMDb movie object (or null if not found).
 */
async function validateTitleWithTMDb(title) {
    try {
        const candidates = await searchMoviesByTitle(title);
        if (!candidates || candidates.length === 0) {
            return null;
        }
        // Choose the first result (TMDb relevance ranking)
        const best = candidates[0];
        return best;
    } catch (e) {
        console.error('TMDb validation error for title', title, e);
        return null;
    }
}

/**
 * Orchestrates the end‑to‑end flow: mood → Groq titles → TMDb validation → details.
 * @param {string} mood Mood selected by the user (e.g., "happy").
 * @param {number} [minResults=3] Minimum number of valid movies required.
 * @param {number} [maxResults=5] Maximum number of movies to show.
 * @returns {Promise<object[]>} Array of enriched movie objects.
 */
export async function getMoodRecommendations(mood, minResults = 3, maxResults = 5) {
    // Reset UI state before starting
    setState({ loading: true, error: null, movies: [] });

    try {
        const initialState = getState();
        const history = normalizeHistory(initialState.recommendationHistory);

        // 1️⃣ Get raw titles from Groq (may be cached)
        const rawTitles = await fetchMovieTitlesFromGroq(mood, history.titles);
        if (!Array.isArray(rawTitles) || rawTitles.length === 0) {
            throw new Error('Groq returned no titles');
        }

        // 2️⃣ Validate each title via TMDb search (parallel but limited concurrency)
        const validationPromises = rawTitles.map(validateTitleWithTMDb);
        const validated = await Promise.all(validationPromises);
        const validMovies = validated.filter(Boolean);

        // 3️⃣ If we have fewer than the required movies, attempt a second Groq call
        if (validMovies.length < minResults) {
            console.warn(`Only ${validMovies.length} valid movies, retrying Groq...`);
            const additionalTitles = await fetchMovieTitlesFromGroq(mood, [...history.titles, ...rawTitles]);
            const extraValidPromises = additionalTitles.map(validateTitleWithTMDb);
            const extraValidated = await Promise.all(extraValidPromises);
            const extraValid = extraValidated.filter(Boolean);
            // Merge without duplicates (by TMDb id)
            const existingIds = new Set(validMovies.map(m => m.id));
            for (const m of extraValid) {
                if (!existingIds.has(m.id)) {
                    validMovies.push(m);
                    existingIds.add(m.id);
                }
                if (validMovies.length >= minResults) break;
            }
        }

        // 4️⃣ Fetch detailed info for each valid movie (parallel)
        const detailPromises = validMovies.map(m => getMovieDetails(m.id));
        const detailedMovies = await Promise.all(detailPromises);
        const ratedMovies = await Promise.all(detailedMovies.map(enrichMovieRatings));
        const watchedMovies = getState().watchedMovies || {};
        const seenIds = new Set(history.movieIds);
        const unwatchedMovies = ratedMovies.filter(movie => {
            const id = String(movie.id);
            return !watchedMovies[movie.id] && !seenIds.has(id);
        }).slice(0, maxResults);

        if (unwatchedMovies.length === 0) {
            throw new Error('Новые фильмы не найдены. Попробуйте другое настроение или очистите историю рекомендаций.');
        }

        // 5️⃣ Update state with results
        setState({
            movies: unwatchedMovies,
            loading: false,
            recommendationHistory: rememberRecommendations(history, unwatchedMovies),
        });
        return unwatchedMovies;
    } catch (error) {
        console.error('Error in getMoodRecommendations:', error);
        setState({ error: error.message, loading: false });
        throw error; // Propagate so UI can also handle if needed
    }
}
