/**
 * add-component.js - Add New Laboratory Component Controller
 * 
 * Handles new component form validation, icon selection, and persistence.
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
            const initQtyInput = document.getElementById('initQty');
            const minThresholdInput = document.getElementById('minThreshold');
            const rackLocInput = document.getElementById('rackLoc');

            if (nameInput && !nameInput.value.trim()) {
                e.preventDefault();
                alert('Please enter a component name before adding.');
                nameInput.focus();
                return;
            }

            // Save component into localStorage if helper is available
            try {
                if (typeof getData === 'function' && typeof saveData === 'function') {
                    const inventory = getData('tinkerlab_inventory', []);
                    const newComp = {
                        name: nameInput.value.trim(),
                        category: document.getElementById('compCategory')?.value || 'Microcontrollers',
                        description: document.getElementById('compDesc')?.value.trim() || '',
                        qty: parseInt(initQtyInput?.value, 10) || 0,
                        minThreshold: parseInt(minThresholdInput?.value, 10) || 0,
                        location: rackLocInput?.value.trim() || 'Rack A-1',
                        addedAt: new Date().toISOString()
                    };
                    inventory.push(newComp);
                    saveData('tinkerlab_inventory', inventory);
                }
            } catch (err) {
                console.warn('[add-component.js] Error storing component:', err);
            }
        });
    }
});