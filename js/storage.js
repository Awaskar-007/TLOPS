/**
 * storage.js - Session & Cloud Storage Helper (MongoDB Atlas Powered)
 * 
 * Replaces browser localStorage with sessionStorage for active session state,
 * and clears legacy localStorage database keys so all data is sourced directly
 * from the MongoDB Atlas backend.
 */

// Purge old local database keys from localStorage
(function purgeLegacyLocalStorage() {
    try {
        localStorage.removeItem('tinkerlab_inventory');
        localStorage.removeItem('tinkerlab_requests');
        localStorage.removeItem('tinkerlab_custom_requests');
        localStorage.removeItem('users');
    } catch (e) {
        // Ignore storage errors in restricted contexts
    }
})();

/**
 * Retrieves and parses JSON data from sessionStorage.
 * @param {string} key - The key name.
 * @param {*} [defaultValue=null] - Value returned if key doesn't exist or parsing fails.
 * @returns {*} The parsed data, or defaultValue.
 */
function getData(key, defaultValue = null) {
    try {
        const rawValue = sessionStorage.getItem(key);
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
 * Serializes and saves data to sessionStorage.
 * @param {string} key - The key name.
 * @param {*} value - The value to serialize and store.
 * @returns {boolean} True if successfully saved.
 */
function saveData(key, value) {
    try {
        if (value === undefined) {
            sessionStorage.removeItem(key);
            return true;
        }
        const serialized = JSON.stringify(value);
        sessionStorage.setItem(key, serialized);
        return true;
    } catch (error) {
        console.error(`[storage.js] Error saving data for key "${key}":`, error);
        return false;
    }
}

/**
 * Removes an item from sessionStorage.
 * @param {string} key - The key to remove.
 */
function removeData(key) {
    try {
        sessionStorage.removeItem(key);
    } catch (error) {
        console.error(`[storage.js] Error removing key "${key}":`, error);
    }
}

// Make functions available globally on window
window.getData = getData;
window.saveData = saveData;
window.removeData = removeData;
