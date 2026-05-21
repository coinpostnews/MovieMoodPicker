
import { safeParseJSON } from './utils.js?v=20260521i';

const CACHE_PREFIX = 'mm_cache_';

/**
 * Retrieves data from localStorage cache if it's not expired.
 * @param {string} key The unique key for the cache entry.
 * @returns {any | null} The cached data if valid and not expired, otherwise null.
 */
export function getCache(key) {
    const cachedItem = localStorage.getItem(CACHE_PREFIX + key);
    if (!cachedItem) {
        return null;
    }

    const { data, expiry } = safeParseJSON(cachedItem, {});
    if (!data || !expiry) {
        console.warn(`Invalid cache format for key: ${key}`);
        localStorage.removeItem(CACHE_PREFIX + key); // Clean up invalid cache
        return null;
    }

    if (Date.now() > expiry) {
        console.log(`Cache expired for key: ${key}`);
        localStorage.removeItem(CACHE_PREFIX + key); // Remove expired item
        return null;
    }

    return data;
}

/**
 * Stores data in localStorage cache with a Time To Live (TTL).
 * @param {string} key The unique key for the cache entry.
 * @param {any} data The data to cache.
 * @param {number} ttlHours The time to live for the cache entry, in hours.
 */
export function setCache(key, data, ttlHours) {
    const expiry = Date.now() + ttlHours * 60 * 60 * 1000; // Convert hours to milliseconds
    const item = {
        data,
        expiry,
    };
    try {
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
    } catch (e) {
        console.error("Error saving to cache", e);
        // Handle potential localStorage full error (e.g., clear oldest items)
    }
}

/**
 * Clears a specific item from the cache.
 * @param {string} key The key of the item to clear.
 */
export function clearCache(key) {
    localStorage.removeItem(CACHE_PREFIX + key);
}

/**
 * Clears all items prefixed with CACHE_PREFIX from the cache.
 */
export function clearAllCache() {
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
            localStorage.removeItem(key);
        }
    });
}
