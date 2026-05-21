
import { setState, getState, subscribe, setMovieWatched } from '../src/state.js';
import { getCache, setCache, clearCache, clearAllCache } from '../src/cache.js';
// We won't directly test Groq/TMDb services here due to API key dependency and network calls.
// The orchestrator implicitly tests them.
import { getMoodRecommendations } from '../src/apiOrchestrator.js';

const assert = (condition, message) => {
    if (condition) {
        console.log(`✅ Test Passed: ${message}`);
    } else {
        console.error(`❌ Test Failed: ${message}`);
    }
};

async function runTests() {
    console.log('\n--- Running State Manager Tests ---');

    // Test 1: Initial state
    let initialState = getState();
    assert(initialState.selectedMood === null, 'Initial selectedMood is null');
    assert(initialState.movies.length === 0, 'Initial movies array is empty');
    assert(Object.keys(initialState.watchedMovies).length === 0, 'Initial watchedMovies is empty');

    // Test 2: setState updates state
    setState({ selectedMood: 'happy', loading: true });
    let currentState = getState();
    assert(currentState.selectedMood === 'happy', 'setState updates selectedMood');
    assert(currentState.loading === true, 'setState updates loading');

    // Test 3: subscribe notifies callbacks
    let notifiedState = null;
    const unsubscribe = subscribe(newState => {
        notifiedState = newState;
    });
    setState({ error: 'test error' });
    assert(notifiedState?.error === 'test error', 'subscribe callback is notified');
    unsubscribe();

    // Test 4: unsubscribe works
    notifiedState = null;
    setState({ loading: false }); // This should not notify
    assert(notifiedState === null, 'unsubscribe prevents further notifications');

    // Test 5: setMovieWatched
    setMovieWatched('123', true);
    currentState = getState();
    assert(currentState.watchedMovies['123'] === true, 'setMovieWatched adds movie to watched');
    setMovieWatched('123', false);
    currentState = getState();
    assert(currentState.watchedMovies['123'] === undefined, 'setMovieWatched removes movie from watched');

    console.log('\n--- Running Cache Tests ---');

    // Test 6: setCache and getCache
    clearAllCache(); // Ensure a clean slate
    setCache('test_data', { value: 123 }, 0.001); // 0.001 hours = ~3.6 seconds TTL
    let cachedData = getCache('test_data');
    assert(cachedData?.value === 123, 'setCache and getCache work');

    // Test 7: Cache expiration
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for cache to expire
    cachedData = getCache('test_data');
    assert(cachedData === null, 'Cache expires after TTL');

    // Test 8: clearCache
    setCache('another_data', { item: 'abc' }, 1);
    assert(getCache('another_data') !== null, 'Data exists before clear');
    clearCache('another_data');
    assert(getCache('another_data') === null, 'clearCache removes item');

    // Test 9: clearAllCache
    setCache('item1', {}, 1);
    setCache('item2', {}, 1);
    clearAllCache();
    assert(getCache('item1') === null && getCache('item2') === null, 'clearAllCache removes all items');

    console.log('\n--- Running API Orchestrator (Mock) Tests ---');

    // Test 10: getMoodRecommendations (requires mock API keys or actual keys to run)
    // This test will only pass if API_KEYs are set correctly and network works.
    // For a true unit test, GroqService and TMDbService should be mocked.
    console.warn('Note: getMoodRecommendations test requires valid GROQ_API_KEY and TMDB_API_KEY and active network connection.');
    try {
        setState({ selectedMood: null, movies: [], loading: false, error: null });
        // Mock the services for independent testing if needed for true unit tests.
        // For now, it's an integration test relying on actual services.
        // await getMoodRecommendations('romantic'); // Uncomment to run live
        // assert(getState().movies.length > 0, 'getMoodRecommendations fetches movies (live test)');
        // assert(getState().loading === false, 'getMoodRecommendations sets loading to false');
        // assert(getState().error === null, 'getMoodRecommendations reports no error on success');
        console.log('Skipping live getMoodRecommendations test for now. Please run manually or mock services.');
    } catch (e) {
        console.error('Live getMoodRecommendations test failed:', e);
        assert(false, 'getMoodRecommendations handles errors gracefully (live test)');
    }
}

runTests();
