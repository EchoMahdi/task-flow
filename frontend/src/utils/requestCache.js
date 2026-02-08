/**
 * ============================================================================
 * Request Cache Utility
 * Simple in-memory cache for API requests to prevent duplicate calls
 * ============================================================================
 */

// Cache storage
const cache = new Map();
const cacheTimestamps = new Map();

// Default cache TTL in milliseconds (5 minutes)
const DEFAULT_TTL = 5 * 60 * 1000;

/**
 * Generate a cache key from request parameters
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @param {Object} params - Query parameters
 * @returns {string} Cache key
 */
const generateCacheKey = (method, url, params = {}) => {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${JSON.stringify(params[key])}`)
    .join('&');
  return `${method.toUpperCase()}:${url}?${sortedParams}`;
};

/**
 * Check if cache entry is still valid
 * @param {string} key - Cache key
 * @param {number} ttl - Time to live in milliseconds
 * @returns {boolean} True if cache is still valid
 */
const isCacheValid = (key, ttl = DEFAULT_TTL) => {
  const timestamp = cacheTimestamps.get(key);
  if (!timestamp) return false;
  return Date.now() - timestamp < ttl;
};

/**
 * Get cached response
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @param {Object} params - Query parameters
 * @param {number} ttl - Cache TTL in milliseconds
 * @returns {Object|null} Cached response or null
 */
export const getCachedResponse = (method, url, params = {}, ttl = DEFAULT_TTL) => {
  const key = generateCacheKey(method, url, params);
  
  if (isCacheValid(key, ttl)) {
    return cache.get(key);
  }
  
  // Clean up expired entry
  cache.delete(key);
  cacheTimestamps.delete(key);
  return null;
};

/**
 * Set cached response
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @param {Object} params - Query parameters
 * @param {*} response - Response to cache
 * @returns {void}
 */
export const setCachedResponse = (method, url, params, response) => {
  const key = generateCacheKey(method, url, params);
  cache.set(key, response);
  cacheTimestamps.set(key, Date.now());
};

/**
 * Invalidate cache entries matching a URL pattern
 * @param {string} urlPattern - URL pattern to invalidate
 * @returns {number} Number of entries invalidated
 */
export const invalidateCache = (urlPattern) => {
  let invalidated = 0;
  const regex = new RegExp(urlPattern);
  
  for (const key of cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key);
      cacheTimestamps.delete(key);
      invalidated++;
    }
  }
  
  return invalidated;
};

/**
 * Invalidate specific cache entry
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @param {Object} params - Query parameters
 * @returns {boolean} True if entry was found and deleted
 */
export const invalidateCacheEntry = (method, url, params = {}) => {
  const key = generateCacheKey(method, url, params);
  
  if (cache.has(key)) {
    cache.delete(key);
    cacheTimestamps.delete(key);
    return true;
  }
  
  return false;
};

/**
 * Clear all cache entries
 * @returns {void}
 */
export const clearCache = () => {
  cache.clear();
  cacheTimestamps.clear();
};

/**
 * Get cache statistics
 * @returns {Object} Cache stats
 */
export const getCacheStats = () => {
  return {
    size: cache.size,
    entries: Array.from(cache.keys()),
  };
};

export default {
  getCachedResponse,
  setCachedResponse,
  invalidateCache,
  invalidateCacheEntry,
  clearCache,
  getCacheStats,
};
