/**
 * add-component.js - Add New Laboratory Component Controller
 * 
 * Handles new component form validation, icon selection, and persistence
 * into the shared localStorage inventory dataset.
 */

document.addEventListener('DOMContentLoaded', () => {
    let selectedIconType = 'diamond';

    // Map title/index to iconType
    const iconButtons = document.querySelectorAll('.icon-btn');
    iconButtons.forEach((btn, idx) => {
        btn.addEventListener('click', () => {
            iconButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');

            const title = (btn.getAttribute('title') || '').toLowerCase();
            if (title.includes('microcontroller')) selectedIconType = 'diamond';
            else if (title.includes('sbc')) selectedIconType = 'square-red';
            else if (title.includes('dev board')) selectedIconType = 'triangle-orange';
            else if (title.includes('temperature') || title.includes('temp')) selectedIconType = 'temp-amber';
            else if (title.includes('gyro')) selectedIconType = 'gyro-purple';
            else if (title.includes('servo') || title.includes('motor')) selectedIconType = 'gear-slate';
            else selectedIconType = 'sensor-grey';
        });
    });

    const saveBtn = document.querySelector('.btn-save-comp');
    if (saveBtn) {
        saveBtn.addEventListener('click', (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('compName');
            const categorySelect = document.getElementById('compCategory');
            const descInput = document.getElementById('compDesc');
            const initQtyInput = document.getElementById('initQty');
            const minThresholdInput = document.getElementById('minThreshold');
            const rackLocInput = document.getElementById('rackLoc');

            const nameVal = nameInput ? nameInput.value.trim() : '';
            if (!nameVal) {
                alert('Please enter a component name before adding.');
                if (nameInput) nameInput.focus();
                return;
            }

            const rawCat = categorySelect ? categorySelect.value : 'microcontrollers';
            // Format category name neatly
            const catMap = {
                'microcontrollers': 'Microcontrollers',
                'sensors': 'Sensors',
                'actuators': 'Actuators',
                'displays': 'Displays',
                'power': 'Power Supplies',
                'cables': 'Cables & Accessories'
            };
            const categoryVal = catMap[rawCat] || 'Microcontrollers';

            const qtyVal = parseInt(initQtyInput?.value, 10) || 0;
            const minVal = parseInt(minThresholdInput?.value, 10) || 0;
            const locVal = rackLocInput?.value.trim() || 'Rack A-1';
            const descVal = descInput?.value.trim() || '';

            // Compute status
            let status = 'Available';
            if (qtyVal <= 0) status = 'Out of Stock';
            else if (qtyVal <= minVal) status = 'Low Stock';

            // Generate clean ID
            const cleanId = 'comp_' + nameVal.toLowerCase().replace(/[^a-z0-9]+/g, '_') + '_' + Date.now();

            const newComponent = {
                id: cleanId,
                name: nameVal,
                category: categoryVal,
                description: descVal,
                qty: qtyVal,
                minThreshold: minVal,
                location: locVal,
                iconType: selectedIconType,
                status: status
            };

            // Retrieve current inventory, append, and save
            const inventory = (typeof getInventory === 'function') ? getInventory() : [];
            inventory.push(newComponent);
            if (typeof saveInventory === 'function') {
                saveInventory(inventory);
            }

            // Redirect back to inventory page
            window.location.href = 'inventory.html';
        });
    }
});
