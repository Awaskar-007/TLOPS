/**
 * login.js - Sign-in Controller with Validation and Auth Alert
 *
 * Handles role toggling, password visibility, live validation,
 * authenticates against stored users in localStorage, and displays
 * inline error messages and success/error alerts.
 */

document.addEventListener('DOMContentLoaded', () => {
    // ----- Elements -----
    const studentRoleBtn = document.getElementById('studentRoleBtn');
    const teacherRoleBtn = document.getElementById('teacherRoleBtn');
    const signInForm = document.getElementById('signInForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitBtn = document.getElementById('signInSubmitBtn');
    const authAlertContainer = document.getElementById('authAlertContainer');

    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const togglePasswordBtn = document.getElementById('togglePasswordBtn');

    // ----- State -----
    let currentRole = 'student'; // default role on page load
    const touched = { email: false, password: false };

    // ----- Icons for password toggle -----
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

    // ----- Helper: alert rendering -----
    function showAlert(message, type = 'success') {
        if (!authAlertContainer) return;
        const alertDiv = document.createElement('div');
        alertDiv.className = `auth-alert auth-alert-${type}`;
        const icon = type === 'success' ? '✔️' : '❗';
        alertDiv.innerHTML = `<span class="auth-alert-icon">${icon}</span>${message}`;
        authAlertContainer.appendChild(alertDiv);
        // Auto‑remove after 4 seconds
        setTimeout(() => {
            if (authAlertContainer.contains(alertDiv)) {
                authAlertContainer.removeChild(alertDiv);
            }
        }, 4000);
    }

    // ----- Show success message from signup (if any) -----
    if (typeof getData === 'function') {
        const successMsg = getData('authSuccessMessage');
        if (successMsg) {
            showAlert(successMsg, 'success');
            removeData('authSuccessMessage');
        }
    }

    // ----- Password visibility toggle -----
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', () => {
            const hidden = passwordInput.type === 'password';
            passwordInput.type = hidden ? 'text' : 'password';
            togglePasswordBtn.innerHTML = hidden ? EYE_CLOSED_ICON : EYE_OPEN_ICON;
            togglePasswordBtn.setAttribute('aria-label', hidden ? 'Hide password' : 'Show password');
            togglePasswordBtn.setAttribute('title', hidden ? 'Hide password' : 'Show password');
        });
    }

    // ----- Role handling -----
    function setRole(role) {
        currentRole = role;
        if (role === 'teacher') {
            studentRoleBtn.classList.remove('active');
            teacherRoleBtn.classList.add('active');
            emailInput.placeholder = 'meera.k@bmu.edu.in';
            signInForm.setAttribute('action', 'teacher/dashboard.html');
        } else {
            teacherRoleBtn.classList.remove('active');
            studentRoleBtn.classList.add('active');
            emailInput.placeholder = 'cse001@bmu.edu.in';
            signInForm.setAttribute('action', 'student/dashboard.html');
        }
        // Re‑validate on role change (email domain may differ)
        updateFormValidity();
    }
    if (studentRoleBtn) studentRoleBtn.addEventListener('click', () => setRole('student'));
    if (teacherRoleBtn) teacherRoleBtn.addEventListener('click', () => setRole('teacher'));

    // ----- Validation helpers -----
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

    function validateEmail() {
        const val = emailInput ? emailInput.value.trim().toLowerCase() : '';
        if (val.length === 0) return { valid: false, message: 'Email is required' };
        // Must end with @bmu.edu.in regardless of role
        const pattern = /^[a-zA-Z0-9._%+-]+@bmu\.edu\.in$/;
        if (!pattern.test(val)) {
            return { valid: false, message: 'Email must end with @bmu.edu.in' };
        }
        return { valid: true, message: '' };
    }

    function validatePassword() {
        const val = passwordInput ? passwordInput.value : '';
        if (val.length === 0) return { valid: false, message: 'Password is required' };
        // No extra complexity on login – just non‑empty
        return { valid: true, message: '' };
    }

    function updateFormValidity() {
        const emailValid = validateEmail().valid;
        const pwdValid = validatePassword().valid;
        const allValid = emailValid && pwdValid;
        if (submitBtn) submitBtn.disabled = !allValid;
        return allValid;
    }

    // ----- Input event listeners -----
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

    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            if (touched.password) displayFieldError(passwordInput, passwordError, validatePassword().message);
            updateFormValidity();
        });
        passwordInput.addEventListener('blur', () => {
            touched.password = true;
            displayFieldError(passwordInput, passwordError, validatePassword().message);
            updateFormValidity();
        });
    }

    // Initialise form state (button disabled)
    updateFormValidity();

    // ----- Form submission (MongoDB Atlas Authentication) -----
    if (signInForm) {
        signInForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            touched.email = true;
            touched.password = true;
            const emailVal = emailInput.value.trim().toLowerCase();
            const pwdVal = passwordInput.value;

            submitBtn.disabled = true;
            submitBtn.textContent = 'Authenticating with MongoDB...';

            try {
                const res = await fetch('/api/users/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: emailVal,
                        password: pwdVal,
                        role: currentRole
                    })
                });

                const data = await res.json();

                if (!res.ok) {
                    displayFieldError(emailInput, emailError, data.error || 'Authentication failed');
                    showAlert(data.error || 'Invalid credentials in MongoDB', 'error');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Sign In';
                    return;
                }

                const user = data.user;
                saveData('currentUser', {
                    role: user.role.toLowerCase(),
                    fullName: user.name,
                    id: user.rollNumber || user.id,
                    email: user.email
                });
                saveData('tinkerlab_role', user.role.toLowerCase());
                saveData('tlops_flash_toast', 'Welcome back, ' + user.name + '! (Authenticated via MongoDB Atlas)');

                const root = './';
                window.location.href = user.role.toLowerCase() === 'teacher'
                    ? `${root}teacher/dashboard.html`
                    : `${root}student/dashboard.html`;

            } catch (err) {
                console.error('Login error:', err);
                showAlert('Connection error connecting to MongoDB Atlas', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign In';
            }
        });
    }
});
