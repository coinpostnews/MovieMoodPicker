
import { clearRecommendationHistory, getState, setState, subscribe, setMovieWatched } from './state.js?v=20260521i';
import { getMoodRecommendations } from './apiOrchestrator.js?v=20260521i';

// DOM Elements
const moodSelector = document.getElementById('mood-selector');
const loadingIndicator = document.getElementById('loading-indicator');
const errorMessageElement = document.getElementById('error-message');
const resultsActions = document.getElementById('results-actions');
const refreshButton = document.getElementById('refresh-button');
const clearHistoryButton = document.getElementById('clear-history-button');
const historyStatus = document.getElementById('history-status');
const movieListElement = document.getElementById('movie-list');
const movieDetailModalOverlay = document.getElementById('movie-detail-modal-overlay');
const movieDetailModalContent = document.getElementById('movie-detail-modal-content');
const modalCloseButton = document.getElementById('modal-close-button');
const modalMovieDetails = document.getElementById('modal-movie-details');

/**
 * Opens the movie detail modal with the given movie data.
 * @param {object} movie - The movie data to display in the modal.
 */
function openMovieDetailModal(movie) {
    console.log('Opening modal for movie:', movie);
    const title = movie.title || movie.original_title || 'Без названия';
    const genres = movie.genres && movie.genres.length > 0
        ? movie.genres.map(g => g.name).join(', ')
        : 'Жанры не указаны';
    const releaseDate = movie.release_date || 'Не указана';
    const overview = movie.overview || 'Описание недоступно.';

    modalMovieDetails.innerHTML = `
        <img src="${getPosterUrl(movie)}" alt="${escapeHtml(title)} Poster">
        <div class="info-section">
            <h2>${escapeHtml(title)}</h2>
            <div>
                <strong>Рейтинги:</strong>
                ${createRatingsHtml(movie)}
            </div>
            <p><strong>Жанры:</strong> ${escapeHtml(genres)}</p>
            <p><strong>Дата выхода:</strong> ${escapeHtml(releaseDate)}</p>
            <p><strong>Длительность:</strong> ${escapeHtml(formatRuntime(movie.runtime))}</p>
            <p><strong>Режиссер:</strong> ${escapeHtml(getDirector(movie))}</p>
            <p><strong>Актеры:</strong> ${escapeHtml(getCast(movie))}</p>
            <p><strong>Описание:</strong> ${escapeHtml(overview)}</p>
            <div class="providers">
                <h3>Где посмотреть</h3>
                ${createProvidersHtml(movie)}
            </div>
        </div>
    `;
    movieDetailModalOverlay.classList.add('active');
}

/**
 * Closes the movie detail modal.
 */
function closeMovieDetailModal() {
    movieDetailModalOverlay.classList.remove('active');
    modalMovieDetails.innerHTML = ''; // Clear content when closing
}

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';
const POSTER_SIZE = 'w500'; // w92, w154, w185, w342, w500, w780, original
const PROVIDER_LOGO_SIZE = 'w45';
const PLACEHOLDER_POSTER = 'https://via.placeholder.com/250x375?text=No+Poster';

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function getPosterUrl(movie) {
    return movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${POSTER_SIZE}${movie.poster_path}` : PLACEHOLDER_POSTER;
}

function formatRuntime(minutes) {
    if (!minutes) return 'Не указана';
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return hours > 0 ? `${hours} ч ${rest} мин` : `${rest} мин`;
}

function getDirector(movie) {
    return movie.credits?.crew?.find(person => person.job === 'Director')?.name || 'Не указан';
}

function getCast(movie) {
    const cast = movie.credits?.cast || [];
    return cast.length > 0
        ? cast.slice(0, 5).map(actor => actor.name).join(', ')
        : 'Не указан';
}

function getRatingItems(movie) {
    const ratings = movie.ratings || {};
    const items = [];

    if (ratings.imdb) {
        items.push({
            source: 'imdb',
            logo: 'IMDb',
            label: 'IMDb',
            value: `${ratings.imdb}/10${ratings.imdbVotes ? ` (${ratings.imdbVotes})` : ''}`,
        });
    }
    if (ratings.rottenTomatoes) {
        items.push({
            source: 'rt',
            logo: 'RT',
            label: 'Rotten Tomatoes',
            value: ratings.rottenTomatoes,
        });
    }
    if (ratings.metacritic) {
        items.push({
            source: 'metacritic',
            logo: 'MC',
            label: 'Metacritic',
            value: ratings.metacritic,
        });
    }
    if (items.length === 0 && ratings.tmdb) {
        items.push({
            source: 'tmdb',
            logo: 'TMDb',
            label: 'TMDb',
            value: `${ratings.tmdb}/10${ratings.tmdbVotes ? ` (${ratings.tmdbVotes} голосов)` : ''}`,
        });
    }
    if (items.length === 0 && movie.vote_average) {
        items.push({
            source: 'tmdb',
            logo: 'TMDb',
            label: 'TMDb',
            value: `${movie.vote_average.toFixed(1)}/10`,
        });
    }

    return items;
}

function createRatingsHtml(movie) {
    const items = getRatingItems(movie);
    if (items.length === 0) {
        return '<div class="ratings-list"><div class="rating-row"><span class="rating-value">Нет рейтинга</span></div></div>';
    }

    return `
        <div class="ratings-list">
            ${items.map(item => `
                <div class="rating-row rating-source-${escapeHtml(item.source)}">
                    <span class="rating-logo" aria-hidden="true">${escapeHtml(item.logo)}</span>
                    <span class="rating-value">${escapeHtml(item.value)}</span>
                </div>
            `).join('')}
        </div>
    `;
}

function getRussianProviders(movie) {
    const providers = movie['watch/providers']?.results?.RU;
    return providers?.flatrate || providers?.rent || providers?.buy || [];
}

function createProvidersHtml(movie) {
    const providers = getRussianProviders(movie);
    if (providers.length === 0) {
        return '<p>Информация о стриминге недоступна.</p>';
    }

    const items = providers.map(provider => {
        const logo = provider.logo_path ? `${TMDB_IMAGE_BASE_URL}${PROVIDER_LOGO_SIZE}${provider.logo_path}` : '';
        const logoHtml = logo ? `<img src="${logo}" alt="">` : '';
        return `
            <div class="provider-item">
                ${logoHtml}
                <span>${escapeHtml(provider.provider_name)}</span>
            </div>
        `;
    }).join('');

    return `<div class="provider-list">${items}</div>`;
}

// Placeholder for IntersectionObserver for lazy loading
let lazyLoadObserver;

function initializeLazyLoad() {
    if ('IntersectionObserver' in window) {
        lazyLoadObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');
                    if (src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        }, { rootMargin: '0px 0px 100px 0px' }); // Load images 100px before they enter viewport
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        console.warn('IntersectionObserver not supported, images will load immediately.');
    }
}

/**
 * Creates an HTML string for a single movie card.
 * @param {object} movie - The movie data from TMDb.
 * @param {boolean} isWatched - Whether the movie is marked as watched.
 * @returns {string} HTML string for the movie card.
 */
function createMovieCard(movie, isWatched) {
    const posterPath = getPosterUrl(movie);
    const title = movie.title || movie.original_title || 'N/A';
    const genres = movie.genres && movie.genres.length > 0
        ? movie.genres.slice(0, 2).map(g => g.name).join(', ')
        : 'Жанры не указаны';
    const overview = movie.overview ? movie.overview.substring(0, 150) + '...' : 'Описание недоступно.';

    return `
        <div class="movie-card" data-movie-id="${movie.id}">
            <img data-src="${posterPath}" alt="${escapeHtml(title)} Poster" class="lazyload-img">
            <div class="movie-card-info">
                <h3>${escapeHtml(title)}</h3>
                <p class="genres">${escapeHtml(genres)}</p>
                ${createRatingsHtml(movie)}
                <p>${escapeHtml(overview)}</p>
                <label class="watched-checkbox">
                    <input type="checkbox" data-movie-id="${movie.id}" ${isWatched ? 'checked' : ''}>
                    Просмотрено
                </label>
            </div>
        </div>
    `;
}

/**
 * Renders the list of movie cards.
 * @param {object[]} movies - An array of movie objects.
 * @param {string|null} selectedMood - The currently selected mood.
 * @param {object} watchedMovies - Object of watched movie IDs.
 */
function renderMovies(movies, selectedMood, watchedMovies) {
    movieListElement.innerHTML = ''; // Clear previous movies
    if (lazyLoadObserver) {
        lazyLoadObserver.disconnect(); // Disconnect old observers
    }

    if (!selectedMood) {
        movieListElement.innerHTML = '<p class="empty-state-message">Выберите настроение, чтобы получить рекомендации!</p>';
        return;
    }

    if (!movies || movies.length === 0) {
        movieListElement.innerHTML = '<p class="empty-state-message">По вашему настроению фильмы не найдены. Попробуйте другое!</p>';
        return;
    }

    const movieCardsHtml = movies.map(movie => {
        const isWatched = watchedMovies[movie.id];
        return createMovieCard(movie, isWatched);
    }).join('');
    movieListElement.innerHTML = movieCardsHtml;

    // Attach click listener to movie cards to open modal
    movieListElement.querySelectorAll('.movie-card').forEach(card => {
        card.addEventListener('click', async (event) => {
            // Prevent opening modal when clicking on the checkbox
            if (event.target.closest('.watched-checkbox')) {
                return;
            }
            const movieId = card.dataset.movieId;
            if (movieId) {
                // In a real application, you would fetch full movie details here
                // For now, we'll use the movie data we already have
                const state = getState();
                const movie = state.movies.find(m => m.id === parseInt(movieId));
                if (movie) {
                    openMovieDetailModal(movie);
                }
            }
        });
    });

    // Apply lazy loading for newly rendered images
    if (lazyLoadObserver) {
        movieListElement.querySelectorAll('.lazyload-img').forEach(img => {
            lazyLoadObserver.observe(img);
        });
    } else {
        movieListElement.querySelectorAll('.lazyload-img').forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}


function renderError(message) {
    if (message) {
        errorMessageElement.textContent = message;
        errorMessageElement.classList.add('active');
    } else {
        errorMessageElement.classList.remove('active');
        errorMessageElement.textContent = '';
    }
}

function toggleLoading(isLoading) {
    if (isLoading) {
        loadingIndicator.classList.add('active');
    } else {
        loadingIndicator.classList.remove('active');
    }
}

function renderResultsActions(state) {
    const hasMood = Boolean(state.selectedMood);
    const shouldShow = hasMood && !state.loading;
    resultsActions.classList.toggle('active', shouldShow);
    refreshButton.disabled = Boolean(state.loading);
    clearHistoryButton.disabled = Boolean(state.loading);
    refreshButton.textContent = state.loading ? 'Обновляю...' : 'Обновить подборку';
}

async function requestRecommendations(mood) {
    historyStatus.textContent = '';
    setState({ selectedMood: mood, loading: true, error: null, movies: [] });

    try {
        await getMoodRecommendations(mood);
    } catch (e) {
        console.error('Failed to get mood recommendations:', e);
    }
}

// --- State Subscription and UI Updates ---

/**
 * Attaches change listeners to watched checkboxes.
 * When a checkbox is toggled, updates the watched state.
 */
function attachWatchedCheckboxListeners() {
    // Find all checkbox inputs within movie list
    const checkboxes = movieListElement.querySelectorAll('input[data-movie-id]');
    checkboxes.forEach(cb => {
        // Remove any existing listener to avoid duplicates (simple approach)
        const newCb = cb.cloneNode(true);
        cb.parentNode.replaceChild(newCb, cb);
        newCb.addEventListener('change', (e) => {
            const movieId = newCb.dataset.movieId;
            const isChecked = newCb.checked;
            if (movieId) {
                setMovieWatched(movieId, isChecked);
            }
        });
    });
}
subscribe(newState => {
    console.log('State updated:', newState);

    // Update loading indicator
    toggleLoading(newState.loading);

    // Update error message
    renderError(newState.error);

    // Update refresh controls
    renderResultsActions(newState);

    // Update movie list (placeholder for now)
    renderMovies(newState.movies, newState.selectedMood, newState.watchedMovies);

    // Update mood button active state
    Array.from(moodSelector.children).forEach(button => {
        if (button.dataset.mood === newState.selectedMood) {
            button.classList.add('selected');
        } else {
            button.classList.remove('selected');
        }
    });

    // Re-attach event listeners for watched checkboxes on new movie cards
    attachWatchedCheckboxListeners();
});

// --- Event Handlers ---
moodSelector.addEventListener('click', async (event) => {
    const button = event.target.closest('.mood-button');
    if (!button) return;

    const mood = button.dataset.mood;
    if (!mood) return;

    await requestRecommendations(mood);
});

refreshButton.addEventListener('click', async () => {
    const mood = getState().selectedMood;
    if (!mood || getState().loading) return;
    await requestRecommendations(mood);
});

clearHistoryButton.addEventListener('click', () => {
    if (getState().loading) return;
    clearRecommendationHistory();
    historyStatus.textContent = 'История очищена';
});

// Initialize UI based on current state (e.g., from localStorage)
document.addEventListener('DOMContentLoaded', () => {
    const initialState = getState();
    toggleLoading(initialState.loading);
    renderError(initialState.error);
    renderResultsActions(initialState);
    initializeLazyLoad(); // Initialize IntersectionObserver once
    renderMovies(initialState.movies, initialState.selectedMood, initialState.watchedMovies);

    // Set initial selected mood button if any
    if (initialState.selectedMood) {
        const selectedButton = moodSelector.querySelector(`[data-mood="${initialState.selectedMood}"]`);
        if (selectedButton) {
            selectedButton.classList.add('selected');
        }
    }
    attachWatchedCheckboxListeners(); // Attach listeners for any initially rendered watched checkboxes

    // Close modal when close button is clicked
    modalCloseButton.addEventListener('click', closeMovieDetailModal);

    // Close modal when clicking outside the modal content
    movieDetailModalOverlay.addEventListener('click', (event) => {
        if (event.target === movieDetailModalOverlay) {
            closeMovieDetailModal();
        }
    });
});
