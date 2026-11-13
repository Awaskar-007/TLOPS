/**
 * storage.js - Session & Cloud Storage Helper (MongoDB Atlas Powered)
 * 
 * Manages active user authentication session across browser tabs
 * and clears legacy localStorage database tables so all persistent data
 * is sourced directly from MongoDB Atlas.
 */

// Purge legacy mock database keys from localStorage
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
 * Retrieves and parses JSON data from session/local storage.
 * @param {string} key - The key name.
 * @param {*} [defaultValue=null] - Value returned if key doesn't exist or parsing fails.
 * @returns {*} The parsed data, or defaultValue.
 */
function getData(key, defaultValue = null) {
    try {
        const rawValue = sessionStorage.getItem(key) || localStorage.getItem(key);
        if (rawValue === null || rawValue === undefined) {
            return defaultValue;
        }
        return JSON.parse(rawValue);
    } catch (error) {
        return defaultValue;
    }
}

/**
 * Serializes and saves data to session/local storage for the user session.
 * @param {string} key - The key name.
 * @param {*} value - The value to serialize and store.
 * @returns {boolean} True if successfully saved.
 */
function saveData(key, value) {
    try {
        if (value === undefined || value === null) {
            sessionStorage.removeItem(key);
            localStorage.removeItem(key);
            return true;
        }
        const serialized = JSON.stringify(value);
        sessionStorage.setItem(key, serialized);
        localStorage.setItem(key, serialized);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Removes an item from session and local storage.
 * @param {string} key - The key to remove.
 */
function removeData(key) {
    try {
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
    } catch (error) {}
}

// Make functions available globally on window
window.getData = getData;
window.saveData = saveData;
window.removeData = removeData;
