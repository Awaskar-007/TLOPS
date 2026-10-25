/**
 * login.js - Sign-in & Role Selection Controller
 * 
 * Handles role tab toggling (Student vs Teacher) and form submission.
 * Saves authenticated user credentials into localStorage using storage.js.
 */

document.addEventListener('DOMContentLoaded', () => {
    let currentRole = 'student';

    const studentRoleBtn = document.getElementById('studentRoleBtn');
    const teacherRoleBtn = document.getElementById('teacherRoleBtn');
    const signInForm = document.getElementById('signInForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    if (!signInForm) return;

    /**
     * Updates active role tab and adjusts email placeholder and destination
     * @param {string} role - 'student' or 'teacher'
     */
    function setRole(role) {
        currentRole = role;
        if (role === 'teacher') {
            studentRoleBtn.classList.remove('active');
            teacherRoleBtn.classList.add('active');
            emailInput.placeholder = 'teacher_name.surname@bmu.edu.in';
            signInForm.action = 'teacher/dashboard.html';
        } else {
            teacherRoleBtn.classList.remove('active');
            studentRoleBtn.classList.add('active');
            emailInput.placeholder = 'cse001@bmu.edu.in';
            signInForm.action = 'student/dashboard.html';
        }
    }

    // Role toggle click listeners
    if (studentRoleBtn) {
        studentRoleBtn.addEventListener('click', () => setRole('student'));
    }
    if (teacherRoleBtn) {
        teacherRoleBtn.addEventListener('click', () => setRole('teacher'));
    }

    // Handle form submit
    signInForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const emailVal = emailInput ? emailInput.value.trim() : '';

        // Save authenticated session info using storage.js
        if (currentRole === 'teacher') {
            const defaultTeacher = getData('tinkerlab_teacher_profile', {
                fullName: 'Dr. Meera Krishnan',
                employeeId: 'ECE-FAC-012'
            });
            saveData('currentUser', {
                role: 'teacher',
                fullName: defaultTeacher.fullName || 'Dr. Meera Krishnan',
                id: defaultTeacher.employeeId || 'ECE-FAC-012',
                email: emailVal || 'meera.k@bmu.edu.in'
            });
            saveData('tinkerlab_role', 'teacher');
            window.location.href = 'teacher/dashboard.html';
        } else {
            const defaultStudent = getData('tinkerlab_profile', {
                fullName: 'Arjun Sharma',
                rollNumber: 'CS21B001'
            });
            saveData('currentUser', {
                role: 'student',
                fullName: defaultStudent.fullName || 'Arjun Sharma',
                id: defaultStudent.rollNumber || 'CS21B001',
                email: emailVal || 'cse001@bmu.edu.in'
            });
            saveData('tinkerlab_role', 'student');
            window.location.href = 'student/dashboard.html';
        }
    });
});
