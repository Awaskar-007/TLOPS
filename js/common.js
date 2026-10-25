/**
 * common.js - Shared Application Logic
 * 
 * Contains reusable code executed across all pages:
 * 1. Authentication guard (route protection & role checks)
 * 2. Sidebar user details population
 * 3. Logout button event handling
 */

/**
 * Returns relative path prefix to reach project root directory.
 * Used to construct reliable relative redirects regardless of folder depth.
 * @returns {string} '../' if inside a subfolder (like /student/ or /teacher/), else './'
 */
function getPathToRoot() {
    const path = window.location.pathname.replace(/\\/g, '/');
    if (path.includes('/student/') || path.includes('/teacher/')) {
        return '../';
    }
    return './';
}

/**
 * Retrieves the currently authenticated user from localStorage.
 * Checks 'currentUser' first, and falls back to 'tinkerlab_role'.
 * @returns {Object|null} User object with role and profile info, or null if not logged in.
 */
function getLoggedInUser() {
    // 1. Check if explicit currentUser object exists
    const currentUser = getData('currentUser');
    if (currentUser && currentUser.role) {
        return currentUser;
    }

    // 2. Fallback check for tinkerlab_role key
    const role = getData('tinkerlab_role');
    if (role === 'student') {
        const profile = getData('tinkerlab_profile', {
            fullName: 'Arjun Sharma',
            rollNumber: 'CS21B001',
            email: 'cs21b001@bmu.edu.in',
            department: 'Computer Science'
        });
        return {
            role: 'student',
            fullName: profile.fullName || 'Arjun Sharma',
            id: profile.rollNumber || 'CS21B001',
            email: profile.email || 'cs21b001@bmu.edu.in',
            department: profile.department || 'Computer Science'
        };
    } else if (role === 'teacher') {
        const profile = getData('tinkerlab_teacher_profile', {
            fullName: 'Dr. Meera Krishnan',
            employeeId: 'ECE-FAC-012',
            email: 'meera.k@bmu.edu.in',
            department: 'Electronics & Communication Engineering'
        });
        return {
            role: 'teacher',
            fullName: profile.fullName || 'Dr. Meera Krishnan',
            id: profile.employeeId || 'ECE-FAC-012',
            email: profile.email || 'meera.k@bmu.edu.in',
            department: profile.department || 'Electronics & Communication Engineering'
        };
    }

    // No authenticated user found
    return null;
}

/**
 * Auth guard function: Protects pages and enforces role-based access.
 * - If no user is logged in, redirects to index.html (login page).
 * - If a student attempts to open a teacher page, redirects to student dashboard.
 * - If a teacher attempts to open a student page, redirects to teacher dashboard.
 */
function checkAuth() {
    const path = window.location.pathname.replace(/\\/g, '/');
    const isStudentPage = path.includes('/student/');
    const isTeacherPage = path.includes('/teacher/');

    // Only apply route protection to student and teacher portal pages
    if (!isStudentPage && !isTeacherPage) {
        return;
    }

    const user = getLoggedInUser();
    const root = getPathToRoot();

    // 1. If not logged in at all, redirect to login page
    if (!user) {
        console.warn('[common.js] Access denied: No active user session. Redirecting to login.');
        window.location.replace(`${root}index.html`);
        return;
    }

    // 2. If student opens a teacher page, redirect to student dashboard
    if (isTeacherPage && user.role !== 'teacher') {
        console.warn('[common.js] Access denied: Student tried to access teacher page. Redirecting to student dashboard.');
        window.location.replace(`${root}student/dashboard.html`);
        return;
    }

    // 3. If teacher opens a student page, redirect to teacher dashboard
    if (isStudentPage && user.role !== 'student') {
        console.warn('[common.js] Access denied: Teacher tried to access student page. Redirecting to teacher dashboard.');
        window.location.replace(`${root}teacher/dashboard.html`);
        return;
    }
}

/**
 * Fills the sidebar user name and ID/role from the logged-in user in localStorage.
 */
function fillSidebarUserInfo() {
    const user = getLoggedInUser();
    if (!user) return;

    if (user.role === 'student') {
        // Fetch up-to-date student profile from localStorage
        const p = getData('tinkerlab_profile', {
            fullName: user.fullName || 'Arjun Sharma',
            rollNumber: user.id || 'CS21B001'
        });

        const nameEl = document.getElementById('sidebarUserName');
        if (nameEl) {
            nameEl.textContent = p.fullName || 'Arjun Sharma';
        }

        const idEl = document.getElementById('sidebarUserId');
        if (idEl) {
            idEl.innerHTML = `${p.rollNumber || 'CS21B001'} &bull; Student`;
        }

        // Also update greeting header if present on dashboard
        const greetingEl = document.getElementById('studentGreetingName');
        if (greetingEl) {
            greetingEl.textContent = p.fullName || 'student';
        }
    } else if (user.role === 'teacher') {
        // Fetch up-to-date teacher profile from localStorage
        const p = getData('tinkerlab_teacher_profile', {
            fullName: user.fullName || 'Dr. Meera Krishnan',
            employeeId: user.id || 'ECE-FAC-012'
        });

        const nameEl = document.getElementById('sidebarTeacherName');
        if (nameEl) {
            nameEl.textContent = p.fullName || 'Dr. Meera Krishnan';
        }

        const idEl = document.getElementById('sidebarUserId');
        if (idEl) {
            idEl.innerHTML = `${p.employeeId || 'ECE-FAC-012'} &bull; Lab Administrator`;
        }
    }
}

/**
 * Clears logged-in user state and redirects to index.html
 */
function logout() {
    removeData('currentUser');
    removeData('tinkerlab_role');
    const root = getPathToRoot();
    window.location.href = `${root}index.html`;
}

/**
 * Finds all logout buttons and attaches event listeners to handle logout behavior.
 */
function initLogoutButton() {
    const logoutButtons = document.querySelectorAll('.logout-btn, #logoutBtn, [data-action="logout"]');
    logoutButtons.forEach(btn => {
        btn.addEventListener('click', (event) => {
            event.preventDefault();
            logout();
        });
    });
}

// Automatically check auth and initialize UI when script runs
checkAuth();

document.addEventListener('DOMContentLoaded', () => {
    fillSidebarUserInfo();
    initLogoutButton();
});

// Export functions globally
window.getLoggedInUser = getLoggedInUser;
window.checkAuth = checkAuth;
window.fillSidebarUserInfo = fillSidebarUserInfo;
window.logout = logout;
window.initLogoutButton = initLogoutButton;
