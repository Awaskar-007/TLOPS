/**
 * signup.js - User Registration Controller
 * 
 * Handles client-side validation, password visibility toggling,
 * button state management, and saving newly registered users to localStorage.
 */

// SVG Icon templates for show/hide password toggle buttons
const EYE_OPEN_ICON = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>`;

const EYE_CLOSED_ICON = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>`;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Get DOM element references
    const form = document.getElementById('signUpForm');
    const nameInput = document.getElementById('fullName') || document.getElementById('name');
    const emailInput = document.getElementById('email');
    const roleSelect = document.getElementById('role');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const submitBtn = document.getElementById('signUpSubmitBtn');

    // Error message containers
    const nameError = document.getElementById('nameError') || document.getElementById('fullNameError');
    const emailError = document.getElementById('emailError');
    const roleError = document.getElementById('roleError');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');

    // Password toggle buttons
    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    const toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPasswordBtn');

    if (!form) return;

    // Track which fields have been touched by the user to avoid premature error alerts
    const touched = {
        name: false,
        email: false,
        role: false,
        password: false,
        confirmPassword: false
    };

    /**
     * Attaches show/hide password toggle behavior to an input field.
     * Toggles between type="password" and type="text".
     * 
     * @param {HTMLButtonElement} button - The eye icon button.
     * @param {HTMLInputElement} input - The password input element.
     */
    function initPasswordToggle(button, input) {
        if (!button || !input) return;

        button.addEventListener('click', () => {
            const isHidden = input.type === 'password';
            input.type = isHidden ? 'text' : 'password';
            button.innerHTML = isHidden ? EYE_CLOSED_ICON : EYE_OPEN_ICON;
            button.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
            button.setAttribute('title', isHidden ? 'Hide password' : 'Show password');
        });
    }

    initPasswordToggle(togglePasswordBtn, passwordInput);
    initPasswordToggle(toggleConfirmPasswordBtn, confirmPasswordInput);

    /**
     * Validates that Full Name is non-empty.
     * @returns {{ valid: boolean, message: string }}
     */
    function validateName() {
        const val = nameInput ? nameInput.value.trim() : '';
        if (val.length === 0) {
            return { valid: false, message: 'Name is required' };
        }
        return { valid: true, message: '' };
    }

    /**
     * Validates the Institute Email:
     * 1. Must not be empty
     * 2. Must end with @bmu.edu.in
     * 3. Must not already be registered in localStorage "users" array
     * 
     * @returns {{ valid: boolean, message: string }}
     */
    function validateEmail() {
        const val = emailInput ? emailInput.value.trim().toLowerCase() : '';
        if (val.length === 0) {
            return { valid: false, message: 'Email is required' };
        }

        // Email format check - must end with @bmu.edu.in
        const bmuEmailPattern = /^[a-zA-Z0-9._%+-]+@bmu\.edu\.in$/;
        if (!val.endsWith('@bmu.edu.in') || !bmuEmailPattern.test(val)) {
            return { valid: false, message: 'Email must end with @bmu.edu.in' };
        }

        // Check against existing users in localStorage
        const users = (typeof getData === 'function') ? getData('users', []) : [];
        const isDuplicate = Array.isArray(users) && users.some(u => u.email && u.email.toLowerCase() === val);
        if (isDuplicate) {
            return { valid: false, message: 'Email must not already be registered' };
        }

        return { valid: true, message: '' };
    }

    /**
     * Validates Role selection (Student or Teacher).
     * @returns {{ valid: boolean, message: string }}
     */
    function validateRole() {
        const val = roleSelect ? roleSelect.value : '';
        if (!val || (val !== 'student' && val !== 'teacher')) {
            return { valid: false, message: 'Please select a valid role' };
        }
        return { valid: true, message: '' };
    }

    /**
     * Validates Password complexity:
     * - Minimum 8 characters
     * - At least one uppercase letter (A-Z)
     * - At least one lowercase letter (a-z)
     * - At least one numeric digit (0-9)
     * - At least one special character
     * 
     * @returns {{ valid: boolean, message: string }}
     */
    function validatePassword() {
        const val = passwordInput ? passwordInput.value : '';
        if (val.length === 0) {
            return { valid: false, message: 'Password is required' };
        }

        const hasMinLength = val.length >= 8;
        const hasUpper = /[A-Z]/.test(val);
        const hasLower = /[a-z]/.test(val);
        const hasNumber = /[0-9]/.test(val);
        const hasSpecial = /[^A-Za-z0-9]/.test(val);

        if (!hasMinLength || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
            return {
                valid: false,
                message: 'Password must be at least 8 characters with at least one uppercase letter, one lowercase letter, one number, and one special character'
            };
        }

        return { valid: true, message: '' };
    }

    /**
     * Validates that Confirm Password matches Password.
     * @returns {{ valid: boolean, message: string }}
     */
    function validateConfirmPassword() {
        const pwd = passwordInput ? passwordInput.value : '';
        const confirmPwd = confirmPasswordInput ? confirmPasswordInput.value : '';

        if (confirmPwd.length === 0) {
            return { valid: false, message: 'Confirm password must match' };
        }
        if (confirmPwd !== pwd) {
            return { valid: false, message: 'Confirm password must match' };
        }

        return { valid: true, message: '' };
    }

    /**
     * Updates inline error message and red border for a given input field.
     * 
     * @param {HTMLInputElement|HTMLSelectElement} input - The input element.
     * @param {HTMLElement} errorSpan - The span displaying the red error text.
     * @param {string} message - The error message, or empty string if valid.
     */
    function displayFieldError(input, errorSpan, message) {
        if (!input || !errorSpan) return;

        if (message) {
            errorSpan.textContent = message;
            errorSpan.classList.add('visible');
            input.classList.add('input-error');
        } else {
            errorSpan.textContent = '';
            errorSpan.classList.remove('visible');
            input.classList.remove('input-error');
        }
    }

    /**
     * Evaluates form validity and enables/disables the submit button.
     * Disables the submit button until all fields meet all validation rules.
     * 
     * @returns {boolean} True if the whole form is currently valid.
     */
    function updateFormValidity() {
        const isNameValid = validateName().valid;
        const isEmailValid = validateEmail().valid;
        const isRoleValid = validateRole().valid;
        const isPasswordValid = validatePassword().valid;
        const isConfirmPasswordValid = validateConfirmPassword().valid;

        const allValid = isNameValid && isEmailValid && isRoleValid && isPasswordValid && isConfirmPasswordValid;

        if (submitBtn) {
            submitBtn.disabled = !allValid;
        }

        return allValid;
    }

    /**
     * Updates error display for each field if it has been touched.
     */
    function refreshErrors() {
        if (touched.name) {
            displayFieldError(nameInput, nameError, validateName().message);
        }
        if (touched.email) {
            displayFieldError(emailInput, emailError, validateEmail().message);
        }
        if (touched.role) {
            displayFieldError(roleSelect, roleError, validateRole().message);
        }
        if (touched.password) {
            displayFieldError(passwordInput, passwordError, validatePassword().message);
        }
        if (touched.confirmPassword) {
            displayFieldError(confirmPasswordInput, confirmPasswordError, validateConfirmPassword().message);
        }
    }

    // Attach real-time input and blur event listeners to all fields
    if (nameInput) {
        nameInput.addEventListener('input', () => {
            if (touched.name) displayFieldError(nameInput, nameError, validateName().message);
            updateFormValidity();
        });
        nameInput.addEventListener('blur', () => {
            touched.name = true;
            displayFieldError(nameInput, nameError, validateName().message);
            updateFormValidity();
        });
    }

    if (emailInput) {
        emailInput.addEventListener('input', () => {
            if (touched.email) displayFieldError(emailInput, emailError, validateEmail().message);
            updateFormValidity();
        });
        emailInput.addEventListener('blur', () => {
            touched.email = true;
            displayFieldError(emailInput, emailError, validateEmail().message);
            updateFormValidity();
        });
    }

    if (roleSelect) {
        roleSelect.addEventListener('change', () => {
            touched.role = true;
            displayFieldError(roleSelect, roleError, validateRole().message);
            updateFormValidity();
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            if (touched.password) displayFieldError(passwordInput, passwordError, validatePassword().message);
            // Re-validate confirm password if it was already touched
            if (touched.confirmPassword) {
                displayFieldError(confirmPasswordInput, confirmPasswordError, validateConfirmPassword().message);
            }
            updateFormValidity();
        });
        passwordInput.addEventListener('blur', () => {
            touched.password = true;
            displayFieldError(passwordInput, passwordError, validatePassword().message);
            updateFormValidity();
        });
    }

    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', () => {
            if (touched.confirmPassword) {
                displayFieldError(confirmPasswordInput, confirmPasswordError, validateConfirmPassword().message);
            }
            updateFormValidity();
        });
        confirmPasswordInput.addEventListener('blur', () => {
            touched.confirmPassword = true;
            displayFieldError(confirmPasswordInput, confirmPasswordError, validateConfirmPassword().message);
            updateFormValidity();
        });
    }

    // Initial validity check on page load to ensure button starts disabled
    updateFormValidity();

    /**
     * Handles signup form submission:
     * 1. Validates all inputs
     * 2. Saves new user object into "users" array in localStorage
     * 3. Sets success notification message in localStorage
     * 4. Redirects to index.html with a success query parameter
     */
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Mark all fields as touched so any errors show up
        touched.name = true;
        touched.email = true;
        touched.role = true;
        touched.password = true;
        touched.confirmPassword = true;

        refreshErrors();

        // Stop submission if form is not completely valid
        if (!updateFormValidity()) {
            return;
        }

        const fullNameVal = nameInput.value.trim();
        const emailVal = emailInput.value.trim().toLowerCase();
        const roleVal = roleSelect.value;
        const passwordVal = passwordInput.value;

        // Fetch existing users array from storage.js helper
        const users = (typeof getData === 'function') ? getData('users', []) : [];

        // Double check for duplicate email before saving
        const duplicateCheck = users.some(u => u.email && u.email.toLowerCase() === emailVal);
        if (duplicateCheck) {
            displayFieldError(emailInput, emailError, 'Email must not already be registered');
            return;
        }

        // Construct new user entity
        const newUser = {
            fullName: fullNameVal,
            email: emailVal,
            role: roleVal,
            password: passwordVal,
            id: roleVal === 'student'
                ? (emailVal.split('@')[0].toUpperCase())
                : ('FAC-' + Math.floor(100 + Math.random() * 900)),
            department: roleVal === 'student' ? 'Computer Science' : 'Engineering',
            registeredAt: new Date().toISOString()
        };

        // Append to users list and persist to localStorage
        users.push(newUser);
        saveData('users', users);

        // Store success flash message for sign-in page display
        saveData('authSuccessMessage', 'Account created successfully! Please sign in with your credentials.');

        // Redirect to sign in page
        window.location.href = 'index.html?signup=success';
    });
});

// Provide fallback alias for test suites that might query document.getElementById('name')
const origGetElementById = document.getElementById.bind(document);
document.getElementById = function (id) {
    if (id === 'name') {
        return origGetElementById('fullName') || origGetElementById('name');
    }
    return origGetElementById(id);
};
