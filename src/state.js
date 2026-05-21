
const STATE_KEY = 'movieMoodPickerState';
const SUBSCRIBERS = [];

let state = {
    selectedMood: null,
    movies: [],
    selectedMovieId: null,
    selectedMovie: null,
    loading: false,
    error: null,
    recommendationHistory: {
        movieIds: [],
        titles: [],
    },
    watchedMovies: JSON.parse(localStorage.getItem('watchedMovies')) || {},
};

/**
 * Loads the state from localStorage.
 * @returns {object} The loaded state or initial state if not found/invalid.
 */
function loadState() {
    try {
        const serializedState = localStorage.getItem(STATE_KEY);
        if (serializedState === null) {
            return state; // Return initial state if nothing in localStorage
        }
        const loadedState = JSON.parse(serializedState);
        // Merge with initial state to ensure all keys are present
        return { ...state, ...loadedState };
    } catch (e) {
        console.warn("Could not load state from localStorage", e);
        return state; // Return initial state on error
    }
}

/**
 * Saves the current state to localStorage.
 * @param {object} currentState The state to save.
 */
function saveState(currentState) {
    try {
        const serializedState = JSON.stringify(currentState);
        localStorage.setItem(STATE_KEY, serializedState);
    } catch (e) {
        console.error("Could not save state to localStorage", e);
    }
}

// Load initial state on module load
state = loadState();

/**
 * Updates the state and notifies all subscribers.
 * @param {object} newStatePatch An object containing the properties to update in the state.
 */
export function setState(newStatePatch) {
    const prevState = { ...state };
    state = { ...state, ...newStatePatch };
    saveState(state); // Save updated state

    SUBSCRIBERS.forEach(callback => {
        callback(state, prevState);
    });
}

/**
 * Returns the current state.
 * @returns {object} The current state.
 */
export function getState() {
    return { ...state };
}

export function clearRecommendationHistory() {
    setState({
        recommendationHistory: {
            movieIds: [],
            titles: [],
        },
        error: null,
    });
}

/**
 * Subscribes a callback function to state changes.
 * The callback will be invoked with the new state and previous state whenever setState is called.
 * @param {function} callback The function to call on state change.
 * @returns {function} An unsubscribe function.
 */
export function subscribe(callback) {
    SUBSCRIBERS.push(callback);
    return () => {
        const index = SUBSCRIBERS.indexOf(callback);
        if (index > -1) {
            SUBSCRIBERS.splice(index, 1);
        }
    };
}

// Helper for watched movies, as it's a separate localStorage item
export function setMovieWatched(movieId, isWatched) {
    const watchedMovies = { ...state.watchedMovies };
    if (isWatched) {
        watchedMovies[movieId] = true;
    } else {
        delete watchedMovies[movieId];
    }
    localStorage.setItem('watchedMovies', JSON.stringify(watchedMovies));
    setState({ watchedMovies }); // Update state and notify subscribers
}
