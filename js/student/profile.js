/**
 * student-profile.js - Student Profile Controller
 * 
 * Manages loading, editing, validating, and persisting student account details.
 * Integrates with storage.js and common.js to keep the sidebar in sync.
 */

const DEFAULT_PROFILE = {
    fullName: 'Arjun Sharma',
    rollNumber: 'CS21B001',
    email: 'cs21b001@nitk.edu.in',
    department: 'Computer Science',
    phone: '+91 98765 43210'
};

let isEditing = false;

/**
 * Retrieves the current student profile from localStorage.
 * @returns {Object} Student profile data.
 */
function getProfile() {
    return getData('tinkerlab_profile', DEFAULT_PROFILE);
}

/**
 * Extracts uppercase initials from full name (e.g. "Arjun Sharma" -> "AS").
 * @param {string} name - Student full name.
 * @returns {string} 2-letter initials.
 */
function getInitials(name) {
    if (!name) return 'AS';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

/**
 * Populates form inputs and display labels with saved profile data.
 */
function loadProfile() {
    const p = getProfile();

    const inputName = document.getElementById('inputFullName');
    const inputRoll = document.getElementById('inputRollNumber');
    const inputEmail = document.getElementById('inputEmail');
    const inputDept = document.getElementById('inputDepartment');
    const inputPhone = document.getElementById('inputPhone');

    if (inputName) inputName.value = p.fullName;
    if (inputRoll) inputRoll.value = p.rollNumber;
    if (inputEmail) inputEmail.value = p.email;
    if (inputDept) inputDept.value = p.department;
    if (inputPhone) inputPhone.value = p.phone;

    const displayName = document.getElementById('displayProfileName');
    const displayDept = document.getElementById('displayProfileDept');
    const avatar = document.getElementById('avatarInitials');

    if (displayName) displayName.textContent = p.fullName;
    if (displayDept) displayDept.innerHTML = `${p.rollNumber} &bull; B.Tech ${p.department}`;
    if (avatar) avatar.textContent = getInitials(p.fullName);

    // Sync sidebar info as well
    if (window.fillSidebarUserInfo) {
        window.fillSidebarUserInfo();
    }
}

/**
 * Toggles edit mode, enabling input editing and showing Save/Cancel buttons.
 */
function toggleEditMode() {
    isEditing = !isEditing;
    const inputs = [
        document.getElementById('inputFullName'),
        document.getElementById('inputRollNumber'),
        document.getElementById('inputEmail'),
        document.getElementById('inputDepartment'),
        document.getElementById('inputPhone')
    ];

    inputs.forEach(input => {
        if (!input) return;
        input.readOnly = !isEditing;
        if (isEditing) {
            input.classList.add('editable');
        } else {
            input.classList.remove('editable');
        }
    });

    const editActions = document.getElementById('editActions');
    const btnEdit = document.getElementById('btnEditProfile');
    if (editActions) editActions.style.display = isEditing ? 'flex' : 'none';
    if (btnEdit) btnEdit.style.display = isEditing ? 'none' : 'inline-flex';

    if (isEditing) {
        const firstInput = document.getElementById('inputFullName');
        if (firstInput) firstInput.focus();
    }
}

/**
 * Cancels editing mode and restores original saved profile data.
 */
function cancelEditMode() {
    isEditing = false;
    loadProfile();
    const inputs = document.querySelectorAll('.profile-input');
    inputs.forEach(input => {
        input.readOnly = true;
        input.classList.remove('editable');
    });
    const editActions = document.getElementById('editActions');
    const btnEdit = document.getElementById('btnEditProfile');
    if (editActions) editActions.style.display = 'none';
    if (btnEdit) btnEdit.style.display = 'inline-flex';
}

/**
 * Handles saving modified profile values to localStorage.
 * @param {Event} e - Form submission event.
 */
function saveProfileChanges(e) {
    if (e) e.preventDefault();
    const updated = {
        fullName: (document.getElementById('inputFullName')?.value || '').trim(),
        rollNumber: (document.getElementById('inputRollNumber')?.value || '').trim(),
        email: (document.getElementById('inputEmail')?.value || '').trim(),
        department: (document.getElementById('inputDepartment')?.value || '').trim(),
        phone: (document.getElementById('inputPhone')?.value || '').trim()
    };

    saveData('tinkerlab_profile', updated);

    // Also keep currentUser session updated if active
    const user = getData('currentUser');
    if (user && user.role === 'student') {
        user.fullName = updated.fullName;
        user.id = updated.rollNumber;
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
