/**
 * TLOPS - Tinkering Lab Operations & Inventory Management System
 * Shared JavaScript Utilities & State Helpers
 */

const TLOPS = {
    // LocalStorage Keys
    STORAGE_KEYS: {
        ROLE: 'tinkerlab_role',
        PROFILE: 'tinkerlab_profile',
        CART: 'tinkerlab_cart',
        CUSTOM_REQUESTS: 'tinkerlab_custom_requests',
        INVENTORY: 'tinkerlab_inventory'
    },

    // Default Profile
    DEFAULT_PROFILE: {
        fullName: 'Arjun Sharma',
        rollNumber: 'CS21B001',
        email: 'cs21b001@bmu.edu.in',
        department: 'Computer Science',
        phone: '+91 98765 43210'
    },

    // Get current role ('student' | 'teacher')
    getRole() {
        return localStorage.getItem(this.STORAGE_KEYS.ROLE) || 'student';
    },

    // Set role
    setRole(role) {
        localStorage.setItem(this.STORAGE_KEYS.ROLE, role);
    },

    // Get user profile
    getProfile() {
        try {
            return Object.assign({}, this.DEFAULT_PROFILE, JSON.parse(localStorage.getItem(this.STORAGE_KEYS.PROFILE) || '{}'));
        } catch (e) {
            return this.DEFAULT_PROFILE;
        }
    },

    // Save user profile
    saveProfile(profileData) {
        localStorage.setItem(this.STORAGE_KEYS.PROFILE, JSON.stringify(profileData));
    },

    // Toast helper
    showToast(message, toastElId = 'toastNotice', messageElId = 'toastMessage', duration = 3500) {
        const toast = document.getElementById(toastElId);
        const msgEl = document.getElementById(messageElId);
        if (!toast || !msgEl) return;

        msgEl.innerHTML = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }
};

// Export to window
window.TLOPS = TLOPS;
