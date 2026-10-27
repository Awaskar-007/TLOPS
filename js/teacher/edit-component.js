/**
 * edit-component.js - Edit Laboratory Component Details Controller
 * 
 * Handles modifying component specifications, quantities, and rack assignments.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Icon selection toggle
    const iconButtons = document.querySelectorAll('.icon-btn');
    iconButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            iconButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });

    const saveBtn = document.querySelector('.btn-save-comp');
    if (saveBtn) {
        saveBtn.addEventListener('click', (e) => {
            const nameInput = document.getElementById('compName');
            if (nameInput && !nameInput.value.trim()) {
                e.preventDefault();
                alert('Component name cannot be empty.');
                nameInput.focus();
                return;
            }
            console.log('[edit-component.js] Saving component modifications.');
        });
    }

    const deleteBtn = document.querySelector('.btn-delete-comp');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
            if (!confirm('Are you sure you want to remove this component from lab inventory?')) {
                e.preventDefault();
            }
        });
    }
});