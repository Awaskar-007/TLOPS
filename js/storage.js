/**
 * storage.js - LocalStorage Helper Functions
 * 
 * Provides safe wrappers for saving and retrieving JSON data
 * from browser localStorage with try/catch error handling.
 */

/**
 * Retrieves and parses JSON data from localStorage by key.
 * @param {string} key - The key name in localStorage.
 * @param {*} [defaultValue=null] - Value returned if key doesn't exist or parsing fails.
 * @returns {*} The parsed data, or defaultValue on error / missing key.
 */
function getData(key, defaultValue = null) {
    try {
        const rawValue = localStorage.getItem(key);
        // If the key does not exist, return the default value
        if (rawValue === null || rawValue === undefined) {
            return defaultValue;
        }
        return JSON.parse(rawValue);
    } catch (error) {
        console.warn(`[storage.js] Error parsing data for key "${key}":`, error);
        return defaultValue;
    }
}

/**
 * Serializes and saves data to localStorage under the given key.
 * @param {string} key - The key name in localStorage.
 * @param {*} value - The value to serialize and store.
 * @returns {boolean} True if successfully saved, false if an error occurred.
 */
function saveData(key, value) {
    try {
        // If value is undefined or null, we can store JSON null or remove the item
        if (value === undefined) {
            localStorage.removeItem(key);
            return true;
        }
        const serialized = JSON.stringify(value);
        localStorage.setItem(key, serialized);
        return true;
    } catch (error) {
        console.error(`[storage.js] Error saving data for key "${key}":`, error);
        return false;
    }
}

/**
 * Removes an item from localStorage.
 * @param {string} key - The key to remove.
 */
function removeData(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`[storage.js] Error removing key "${key}":`, error);
    }
}

// Make functions available globally on the window object
window.getData = getData;
window.saveData = saveData;
window.removeData = removeData;
