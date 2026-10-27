/**
 * edit-component.js - Edit Laboratory Component Details Controller
 * 
 * Loads existing component data by URL param (?id=...), allows modifying
 * specifications and quantities, and handles deleting components with confirmation.
 */

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const compId = urlParams.get('id');

    const inventory = (typeof getInventory === 'function') ? getInventory() : [];
    let currentComp = null;

    if (compId) {
        currentComp = inventory.find(c => (c.id === compId || c.name === compId));
    }

    const nameInput = document.getElementById('compName');
    const categorySelect = document.getElementById('compCategory');
    const descInput = document.getElementById('compDesc');
    const qtyInput = document.getElementById('stockQty');
    const minThresholdInput = document.getElementById('minThreshold');
    const rackLocInput = document.getElementById('rackLoc');

    // Populate existing values if found
    if (currentComp) {
        if (nameInput) nameInput.value = currentComp.name || '';
        if (descInput) descInput.value = currentComp.description || '';
        if (qtyInput) qtyInput.value = (currentComp.qty !== undefined) ? currentComp.qty : 0;
        if (minThresholdInput) minThresholdInput.value = (currentComp.minThreshold !== undefined) ? currentComp.minThreshold : 0;
        if (rackLocInput) rackLocInput.value = currentComp.location || '';

        if (categorySelect && currentComp.category) {
            const catLower = currentComp.category.toLowerCase();
            for (let i = 0; i < categorySelect.options.length; i++) {
                if (categorySelect.options[i].text.toLowerCase().includes(catLower) || categorySelect.options[i].value.toLowerCase().includes(catLower)) {
                    categorySelect.selectedIndex = i;
                    break;
                }
            }
        }
    }

    // Icon button selection toggle
    let selectedIconType = currentComp ? currentComp.iconType : 'diamond';
    const iconButtons = document.querySelectorAll('.icon-btn');
    iconButtons.forEach(btn => {
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

    // Save Changes handler
    const saveBtn = document.querySelector('.btn-save-comp');
    if (saveBtn) {
        saveBtn.addEventListener('click', (e) => {
            e.preventDefault();

            const nameVal = nameInput ? nameInput.value.trim() : '';
            if (!nameVal) {
                alert('Component name cannot be empty.');
                if (nameInput) nameInput.focus();
                return;
            }

            const catText = categorySelect ? categorySelect.options[categorySelect.selectedIndex].text : 'Microcontrollers';
            const qtyVal = parseInt(qtyInput?.value, 10) || 0;
            const minVal = parseInt(minThresholdInput?.value, 10) || 0;
            const locVal = rackLocInput?.value.trim() || 'Rack A-1';
            const descVal = descInput?.value.trim() || '';

            let status = 'Available';
            if (qtyVal <= 0) status = 'Out of Stock';
            else if (qtyVal <= minVal) status = 'Low Stock';

            if (currentComp) {
                currentComp.name = nameVal;
                currentComp.category = catText;
                currentComp.description = descVal;
                currentComp.qty = qtyVal;
                currentComp.minThreshold = minVal;
                currentComp.location = locVal;
                if (selectedIconType) currentComp.iconType = selectedIconType;
                currentComp.status = status;
            } else {
                // If editing without query param, find by name or add
                const existingIdx = inventory.findIndex(c => c.name.toLowerCase() === nameVal.toLowerCase());
                if (existingIdx !== -1) {
                    inventory[existingIdx].qty = qtyVal;
                    inventory[existingIdx].minThreshold = minVal;
                    inventory[existingIdx].location = locVal;
                    inventory[existingIdx].description = descVal;
                    inventory[existingIdx].status = status;
                }
            }

            if (typeof saveInventory === 'function') {
                saveInventory(inventory);
            }

            window.location.href = 'inventory.html';
        });
    }

    // Delete Component handler with confirmation popup
    const deleteBtn = document.querySelector('.btn-delete-comp');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const compName = nameInput ? nameInput.value.trim() : (currentComp ? currentComp.name : 'this component');
            const confirmed = window.confirm(`Are you sure you want to delete "${compName}" from the laboratory inventory?`);

            if (confirmed) {
                let updated = inventory;
                if (currentComp) {
                    updated = inventory.filter(c => c !== currentComp && c.id !== currentComp.id);
                } else if (compName) {
                    updated = inventory.filter(c => c.name.toLowerCase() !== compName.toLowerCase());
                }

                if (typeof saveInventory === 'function') {
                    saveInventory(updated);
                }

                window.location.href = 'inventory.html';
            }
        });
    }
});
