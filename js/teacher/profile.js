/**
 * teacher-profile.js - Teacher Profile Controller
 * 
 * Manages loading, editing, validating, and persisting administrator account details.
 * Integrates with storage.js and common.js to keep sidebar and credentials updated.
 */

const DEFAULT_TEACHER_PROFILE = {
    fullName: 'Dr. Meera Krishnan',
    email: 'meera.k@bmu.edu.in',
    department: 'Electronics & Communication Engineering',
    employeeId: 'ECE-FAC-012',
    phone: '+91 99887 65432'
};

let isEditing = false;

/**
 * Retrieves the current teacher profile from localStorage.
 * @returns {Object} Teacher profile data.
 */
function getProfile() {
    return getData('tinkerlab_teacher_profile', DEFAULT_TEACHER_PROFILE);
}

/**
 * Extracts initials from teacher full name, ignoring titles like 'Dr.' or 'Prof.'.
 * @param {string} name - Teacher name.
 * @returns {string} 2-letter uppercase initials.
 */
function getInitials(name) {
    if (!name) return 'MK';
    const parts = name.trim().split(/\s+/).filter(p => !p.startsWith('Dr.') && !p.startsWith('Prof.'));
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }
    return 'MK';
}

/**
 * Populates form inputs and display headers with current teacher profile data.
 */
function loadProfile() {
    const p = getProfile();

    const inputName = document.getElementById('inputFullName');
    const inputEmail = document.getElementById('inputEmail');
    const inputDept = document.getElementById('inputDepartment');
    const inputId = document.getElementById('inputEmployeeId');
    const inputPhone = document.getElementById('inputPhone');

    if (inputName) inputName.value = p.fullName;
    if (inputEmail) inputEmail.value = p.email;
    if (inputDept) inputDept.value = p.department;
    if (inputId) inputId.value = p.employeeId;
    if (inputPhone) inputPhone.value = p.phone;

    const displayName = document.getElementById('displayProfileName');
    const displayDept = document.getElementById('displayProfileDept');
    const avatar = document.getElementById('avatarInitials');

    if (displayName) displayName.textContent = p.fullName;
    if (displayDept) displayDept.innerHTML = `Lab Administrator &bull; ${p.department}`;
    if (avatar) avatar.textContent = getInitials(p.fullName);

    // Sync sidebar name
    if (window.fillSidebarUserInfo) {
        window.fillSidebarUserInfo();
    }
}

/**
 * Toggles edit mode for teacher profile fields.
 */
function toggleEditMode() {
    isEditing = !isEditing;
    const inputs = document.querySelectorAll('.profile-input');
    const editActions = document.getElementById('editActions');
    const btnEdit = document.getElementById('btnEditProfile');

    if (isEditing) {
        inputs.forEach(input => {
            input.removeAttribute('readonly');
            input.classList.add('editable');
        });
        if (editActions) editActions.style.display = 'flex';
        if (btnEdit) btnEdit.style.display = 'none';
        const firstInput = document.getElementById('inputFullName');
        if (firstInput) firstInput.focus();
    } else {
        cancelEditMode();
    }
}

/**
 * Cancels editing mode and restores original saved profile data.
 */
function cancelEditMode() {
    isEditing = false;
    const inputs = document.querySelectorAll('.profile-input');
    const editActions = document.getElementById('editActions');
    const btnEdit = document.getElementById('btnEditProfile');

    inputs.forEach(input => {
        input.setAttribute('readonly', 'true');
        input.classList.remove('editable');
    });

    if (editActions) editActions.style.display = 'none';
    if (btnEdit) btnEdit.style.display = 'inline-flex';
    loadProfile();
}

/**
 * Handles saving modified teacher profile values to localStorage.
 * @param {Event} e - Form submission event.
 */
function saveProfileChanges(e) {
    if (e) e.preventDefault();
    const updated = {
        fullName: (document.getElementById('inputFullName')?.value || '').trim(),
        email: (document.getElementById('inputEmail')?.value || '').trim(),
        department: (document.getElementById('inputDepartment')?.value || '').trim(),
        employeeId: (document.getElementById('inputEmployeeId')?.value || '').trim(),
        phone: (document.getElementById('inputPhone')?.value || '').trim()
    };

    saveData('tinkerlab_teacher_profile', updated);

    // Keep currentUser session in sync if role is teacher
    const user = getData('currentUser');
    if (user && user.role === 'teacher') {
        user.fullName = updated.fullName;
        user.id = updated.employeeId;
        user.email = updated.email;
        saveData('currentUser', user);
    }

    cancelEditMode();
    loadProfile();
    showToast('Profile updated successfully!');
}

/**
 * Displays a toast notification.
 * @param {string} message - Message text.
 */
function showToast(message) {
    const toast = document.getElementById('toastNotice');
    const msgEl = document.getElementById('toastMessage');
    if (!toast || !msgEl) return;
    msgEl.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Attach event listeners upon DOM load
document.addEventListener('DOMContentLoaded', () => {
    loadProfile();

    // Edit profile toggle button
    const editBtn = document.getElementById('btnEditProfile');
    if (editBtn) {
        editBtn.addEventListener('click', toggleEditMode);
    }

    // Cancel edit button
    const cancelBtn = document.querySelector('.btn-cancel-profile');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', cancelEditMode);
    }

    // Profile form submit
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', saveProfileChanges);
    }
});

// Export functions to window
window.toggleEditMode = toggleEditMode;
window.cancelEditMode = cancelEditMode;
window.saveProfileChanges = saveProfileChanges;
window.loadProfile = loadProfile;
