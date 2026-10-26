/**
 * cart.js - Request Cart & Checkout Controller
 * 
 * Handles cart item rendering, quantity adjustments, item removal,
 * cart clearing, checkout submission with validation, and persistence.
 */

// Item catalog metadata mapping item IDs to details
const CATALOG = {
    'arduino': { name: 'Arduino Uno R3', category: 'Microcontrollers', stock: 18 },
    'raspberry': { name: 'Raspberry Pi 4 Model B', category: 'Microcontrollers', stock: 6 },
    'esp32': { name: 'ESP32 Dev Board', category: 'Microcontrollers', stock: 24 },
    'sensor': { name: 'HC-SR04 Ultrasonic Sensor', category: 'Sensors', stock: 35 },
    'dht11': { name: 'DHT11 Temp & Humidity', category: 'Sensors', stock: 3 }
};

/**
 * Retrieves the current cart object from localStorage.
 * @returns {Object} Key-value pairs of itemId: quantity.
 */
function getCart() {
    return getData('tinkerlab_cart', {});
}

/**
 * Saves the cart object into localStorage and re-renders the cart UI.
 * @param {Object} cart - Updated cart data.
 */
function saveCart(cart) {
    saveData('tinkerlab_cart', cart);
    renderCart();
}

/**
 * Initializes return date picker and request reason input validation listeners.
 */
function initReasonControls() {
    const dateInput = document.getElementById('cartReturnDate');
    if (dateInput && !dateInput.value) {
        const now = new Date();
        dateInput.min = now.toISOString().split('T')[0];
        const future = new Date();
        future.setDate(future.getDate() + 7);
        const yyyy = future.getFullYear();
        const mm = String(future.getMonth() + 1).padStart(2, '0');
        const dd = String(future.getDate()).padStart(2, '0');
        dateInput.value = `${yyyy}-${mm}-${dd}`;
    }

    const reasonInput = document.getElementById('requestReasonInput');
    const reasonError = document.getElementById('reasonError');
    if (reasonInput) {
        reasonInput.addEventListener('input', () => {
            if (reasonInput.value.trim().length > 0) {
                reasonInput.classList.remove('input-invalid');
                if (reasonError) reasonError.style.display = 'none';
            }
        });
    }
}

/**
 * Renders cart items or shows the empty cart state.
 */
function renderCart() {
    const cart = getCart();
    const itemKeys = Object.keys(cart).filter(key => cart[key] > 0);
    const emptyState = document.getElementById('cartEmptyState');
    const activeState = document.getElementById('cartActiveState');
    const itemsList = document.getElementById('cartItemsList');
    const itemsCountText = document.getElementById('cartItemsCountText');
    const totalQtyText = document.getElementById('cartTotalQty');

    if (!emptyState || !activeState || !itemsList) return;

    if (itemKeys.length === 0) {
        emptyState.style.display = 'flex';
        activeState.style.display = 'none';
        return;
    }

    emptyState.style.display = 'none';
    activeState.style.display = 'block';

    let totalQty = 0;
    itemsList.innerHTML = '';

    itemKeys.forEach(id => {
        const qty = cart[id];
        totalQty += qty;
        const meta = CATALOG[id] || { name: id, category: 'Components', stock: 10 };

        const itemRow = document.createElement('div');
        itemRow.className = 'cart-item-row';
        itemRow.innerHTML = `
            <div class="cart-item-info">
                <span class="cart-item-name">${meta.name}</span>
                <span class="cart-item-meta">${meta.category} &bull; ${meta.stock} in stock</span>
            </div>
            <div class="cart-item-controls">
                <div class="qty-control">
                    <button class="qty-btn" data-action="decrease-qty" data-id="${id}" title="Decrease quantity">&minus;</button>
                    <span class="qty-val">${qty}</span>
                    <button class="qty-btn" data-action="increase-qty" data-id="${id}" title="Increase quantity">&plus;</button>
                </div>
                <button class="btn-remove-item" data-action="remove-item" data-id="${id}" title="Remove item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `;
        itemsList.appendChild(itemRow);
    });

    if (itemsCountText) itemsCountText.textContent = `Selected Items (${itemKeys.length})`;
    if (totalQtyText) totalQtyText.textContent = totalQty;

    // Tailor reason title depending on whether 1 or multiple items are selected
    const reasonTitle = document.getElementById('reasonTitleLabel');
    if (reasonTitle) {
        if (itemKeys.length === 1) {
            const singleMeta = CATALOG[itemKeys[0]];
            const singleName = singleMeta ? singleMeta.name : 'Component';
            reasonTitle.innerHTML = `<span>Reason for Requesting ${singleName}</span> <span class="required-star">*</span>`;
        } else {
            reasonTitle.innerHTML = `<span>Reason for Requesting Components</span> <span class="required-star">*</span>`;
        }
    }

    initReasonControls();
}

/**
 * Updates item quantity in the cart.
 * @param {string} id - Component identifier.
 * @param {number} delta - Change in quantity (+1 or -1).
 */
function updateQty(id, delta) {
    const cart = getCart();
    const current = cart[id] || 0;
    const updated = current + delta;
    if (updated <= 0) {
        delete cart[id];
    } else {
        cart[id] = updated;
    }
    saveCart(cart);
}

/**
 * Removes an item completely from the cart.
 * @param {string} id - Component identifier.
 */
function removeItem(id) {
    const cart = getCart();
    delete cart[id];
    saveCart(cart);
}

/**
 * Clears all items in the cart and resets reason form.
 */
function clearCart() {
    removeData('tinkerlab_cart');
    const reasonInput = document.getElementById('requestReasonInput');
    if (reasonInput) reasonInput.value = '';
    renderCart();
    showToast('Cart cleared');
}

/**
 * Validates and submits the cart items as a new borrowing request.
 */
function submitCartRequest() {
    const cart = getCart();
    const itemKeys = Object.keys(cart).filter(key => cart[key] > 0);
    if (itemKeys.length === 0) return;

    const reasonInput = document.getElementById('requestReasonInput');
    const reasonError = document.getElementById('reasonError');
    const reason = reasonInput ? reasonInput.value.trim() : '';

    // Validation: Reason is mandatory before submitting
    if (!reason) {
        if (reasonInput) {
            reasonInput.classList.add('input-invalid');
            reasonInput.focus();
        }
        if (reasonError) {
            reasonError.style.display = 'flex';
        }
        showToast('Please provide a reason for requesting the component(s) before submitting.');
        return;
    }

    // Clear any error state
    if (reasonInput) reasonInput.classList.remove('input-invalid');
    if (reasonError) reasonError.style.display = 'none';

    // Gather component items
    const items = [];
    const itemTitles = [];
    let totalQty = 0;

    itemKeys.forEach(id => {
        const qty = cart[id];
        totalQty += qty;
        const meta = CATALOG[id] || { name: id, category: 'Components' };
        itemTitles.push(`${meta.name}${qty > 1 ? ` ×${qty}` : ''}`);
        items.push({
            name: meta.name,
            qty: qty,
            category: meta.category,
            serial: 'INV-PENDING'
        });
    });

    // Format dates
    const returnDateInput = document.getElementById('cartReturnDate');
    let dueDateStr = '—';
    if (returnDateInput && returnDateInput.value) {
        const d = new Date(returnDateInput.value);
        if (!isNaN(d.getTime())) {
            const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            dueDateStr = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
        } else {
            dueDateStr = returnDateInput.value;
        }
    } else {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        dueDateStr = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }

    const now = new Date();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const submittedDateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

    // Generate next request ID
    let maxNum = 8;
    const existingRequests = getData('tinkerlab_custom_requests', []);
    existingRequests.forEach(r => {
        const m = r.id && r.id.match(/^req(\d+)$/i);
        if (m) {
            const n = parseInt(m[1], 10);
            if (n > maxNum) maxNum = n;
        }
    });

    const newId = 'req' + String(maxNum + 1).padStart(3, '0');

    // Retrieve active student profile
    const studentProfile = getData('tinkerlab_profile', {
        fullName: 'Arjun Sharma',
        rollNumber: 'CS21B001',
        department: 'Computer Science'
    });

    const newRequest = {
        id: newId,
        status: 'Pending',
        statusClass: 'badge-pending',
        submitted: submittedDateStr,
        due: dueDateStr,
        purpose: reason,
        componentName: itemTitles.join(', '),
        quantity: totalQty,
        studentName: studentProfile.fullName || 'Arjun Sharma',
        studentRoll: studentProfile.rollNumber || 'CS21B001',
        studentDept: studentProfile.department || 'Computer Science',
        items: items
    };

    // Save to shared request repository in localStorage
    existingRequests.unshift(newRequest);
    saveData('tinkerlab_custom_requests', existingRequests);

    // Clear cart & input
    removeData('tinkerlab_cart');
    if (reasonInput) reasonInput.value = '';
    renderCart();

    showToast(`Request ${newId} submitted for review! <a href="requests.html" style="color:#93c5fd; text-decoration:underline; font-weight:600; margin-left:6px;">View in My Requests &rarr;</a>`);
}

/**
 * Displays a toast notification on the cart page.
 * @param {string} message - Message HTML/text.
 */
function showToast(message) {
    const toast = document.getElementById('toastNotice');
    const msgEl = document.getElementById('toastMessage');
    if (!toast || !msgEl) return;
    msgEl.innerHTML = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// Attach event listeners upon DOM load
document.addEventListener('DOMContentLoaded', () => {
    renderCart();

    // Clear cart button listener (replaces inline onclick)
    const clearBtn = document.querySelector('.btn-clear-cart');
    if (clearBtn) {
        clearBtn.addEventListener('click', (e) => {
            e.preventDefault();
            clearCart();
        });
    }

    // Submit cart request button listener (replaces inline onclick)
    const submitBtn = document.querySelector('.btn-submit-request');
    if (submitBtn) {
        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            submitCartRequest();
        });
    }

    // Event delegation on items list for quantity changes and item removal
    const itemsList = document.getElementById('cartItemsList');
    if (itemsList) {
        itemsList.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-action]');
            if (!btn) return;
            const action = btn.getAttribute('data-action');
            const id = btn.getAttribute('data-id');

            if (action === 'increase-qty') {
                updateQty(id, 1);
            } else if (action === 'decrease-qty') {
                updateQty(id, -1);
            } else if (action === 'remove-item') {
                removeItem(id);
            }
        });
    }
});

// Export helper functions to window for convenience
window.updateQty = updateQty;
window.removeItem = removeItem;
window.clearCart = clearCart;
window.submitCartRequest = submitCartRequest;
window.renderCart = renderCart;
