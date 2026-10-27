/**
 * cart.js - Request Cart & Checkout Controller
 * 
 * Handles cart item rendering from stored inventory, quantity adjustments, item removal,
 * cart clearing, checkout submission with validation, and saving requests to localStorage.
 */

// Mapping of component keys / names to detailed inventory specs
const COMPONENT_DETAILS = {
    'arduino': {
        name: 'Arduino Uno R3',
        desc: 'ATmega328P based microcontroller board',
        badge: 'Microcontroller',
        badgeClass: 'badge-micro'
    },
    'raspberry': {
        name: 'Raspberry Pi 4 Model B',
        desc: '4GB RAM, Quad-Core Cortex-A72',
        badge: 'SBC',
        badgeClass: 'badge-sbc'
    },
    'esp32': {
        name: 'ESP32 Dev Board',
        desc: 'Wi-Fi & Bluetooth Dual-Core SoC',
        badge: 'Dev Board',
        badgeClass: 'badge-dev'
    },
    'sensor': {
        name: 'HC-SR04 Ultrasonic Sensor',
        desc: 'Precision ultrasonic distance sensor (2cm - 400cm)',
        badge: 'Sensor',
        badgeClass: 'badge-sensor'
    },
    'dht11': {
        name: 'DHT11 Temp & Humidity',
        desc: 'Basic ultra low-cost digital temperature & humidity sensor',
        badge: 'Sensor',
        badgeClass: 'badge-sensor'
    }
};

/**
 * Retrieves the current cart object from localStorage.
 * @returns {Object} Cart object with { componentId: quantity }.
 */
function getCart() {
    return (typeof getData === 'function') ? getData('tinkerlab_cart', {}) : {};
}

/**
 * Saves the cart object into localStorage and re-renders cart views.
 * @param {Object} cart - Updated cart data.
 */
function saveCart(cart) {
    if (typeof saveData === 'function') {
        saveData('tinkerlab_cart', cart);
    }
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
 * Updates quantity for a specific item in the cart.
 * @param {string} id - Component identifier.
 * @param {number} delta - Amount to increment or decrement.
 */
function updateQty(id, delta) {
    const cart = getCart();
    if (!cart[id]) return;

    cart[id] += delta;
    if (cart[id] <= 0) {
        delete cart[id];
    }
    saveCart(cart);
}

/**
 * Removes an entire component line from the cart.
 * @param {string} id - Component identifier.
 */
function removeItem(id) {
    const cart = getCart();
    if (cart[id]) {
        delete cart[id];
        saveCart(cart);
    }
}

/**
 * Clears all items from the current cart.
 */
function clearCart() {
    saveCart({});
}

/**
 * Generates an SVG icon element markup according to component type.
 * @param {string} badgeClass - CSS class identifier.
 * @returns {string} SVG HTML markup.
 */
function getCartIconSvg(badgeClass) {
    if (badgeClass === 'badge-sbc') {
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`;
    } else if (badgeClass === 'badge-dev') {
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/></svg>`;
    } else if (badgeClass === 'badge-sensor') {
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20"/></svg>`;
    }
    return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>`;
}

/**
 * Renders the cart UI based on contents in localStorage.
 */
function renderCart() {
    const cart = getCart();
    const emptyState = document.getElementById('cartEmptyState');
    const activeState = document.getElementById('cartActiveState');
    const itemsList = document.getElementById('cartItemsList');
    const countText = document.getElementById('cartItemsCountText');
    const totalQty = document.getElementById('cartTotalQty');
    const reasonTitle = document.getElementById('reasonTitleLabel');

    if (!emptyState || !activeState || !itemsList) return;

    const itemKeys = Object.keys(cart).filter(key => cart[key] > 0);

    // If cart is empty, show empty state
    if (itemKeys.length === 0) {
        emptyState.style.display = 'flex';
        activeState.style.display = 'none';
        return;
    }

    emptyState.style.display = 'none';
    activeState.style.display = 'block';
    itemsList.innerHTML = '';

    let totalItemCount = 0;

    // Check inventory from data.js
    const inventory = (typeof getInventory === 'function') ? getInventory() : [];

    itemKeys.forEach(id => {
        const qty = cart[id];
        totalItemCount += qty;

        // Match against inventory array first, fallback to COMPONENT_DETAILS
        const invItem = inventory.find(c => c.name.toLowerCase() === id.toLowerCase() || (c.id && c.id.toLowerCase() === id.toLowerCase()));
        const staticDetails = COMPONENT_DETAILS[id] || {};

        const name = invItem ? invItem.name : (staticDetails.name || id);
        const desc = invItem ? invItem.description : (staticDetails.desc || 'Lab component');
        const badge = invItem ? invItem.category : (staticDetails.badge || 'Component');
        const badgeClass = staticDetails.badgeClass || 'badge-dev';

        const safeId = escapeHtml(id);
        const safeName = escapeHtml(name);
        const safeDesc = escapeHtml(desc);
        const safeBadge = escapeHtml(badge);

        const card = document.createElement('div');
        card.className = 'cart-item-card';
        card.innerHTML = `
            <div class="cart-item-left">
                <div class="cart-item-icon ${badgeClass}">
                    ${getCartIconSvg(badgeClass)}
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-header">
                        <h4>${safeName}</h4>
                        <span class="badge ${badgeClass}">${safeBadge}</span>
                    </div>
                    <p class="cart-item-desc">${safeDesc}</p>
                </div>
            </div>
            <div class="cart-item-right">
                <div class="qty-control">
                    <button class="btn-qty" data-action="decrease-qty" data-id="${safeId}" aria-label="Decrease quantity">&minus;</button>
                    <span class="qty-display">${qty}</span>
                    <button class="btn-qty" data-action="increase-qty" data-id="${safeId}" aria-label="Increase quantity">&plus;</button>
                </div>
                <button class="btn-remove-item" data-action="remove-item" data-id="${safeId}" aria-label="Remove item" title="Remove item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        `;

        itemsList.appendChild(card);
    });

    if (countText) countText.textContent = `Selected Items (${itemKeys.length})`;
    if (totalQty) totalQty.textContent = totalItemCount;
    if (reasonTitle) reasonTitle.textContent = `Request Details (${totalItemCount} ${totalItemCount === 1 ? 'item' : 'items'})`;
}

/**
 * Validates and submits the cart items as a new borrowing request,
 * saving with: id, studentName, studentEmail, items, status "Pending", submittedDate, dueDate.
 */
function submitCartRequest() {
    const cart = getCart();
    const itemKeys = Object.keys(cart).filter(key => cart[key] > 0);
    if (itemKeys.length === 0) return;

    const reasonInput = document.getElementById('requestReasonInput');
    const reasonError = document.getElementById('reasonError');
    const reason = reasonInput ? reasonInput.value.trim() : '';

    // Reason validation
    if (!reason) {
        if (reasonInput) {
            reasonInput.classList.add('input-invalid');
            reasonInput.focus();
        }
        if (reasonError) reasonError.style.display = 'flex';
        showToast('Please provide a reason for requesting the component(s) before submitting.');
        return;
    }

    const inventory = (typeof getInventory === 'function') ? getInventory() : [];
    const existingRequests = (typeof getRequests === 'function') ? getRequests() : [];

    // Generate sequential request ID (e.g. req009)
    let maxNum = 8;
    existingRequests.forEach(r => {
        const m = r.id && r.id.match(/^req(\d+)$/i);
        if (m) {
            const n = parseInt(m[1], 10);
            if (n > maxNum) maxNum = n;
        }
    });
    const newId = 'req' + String(maxNum + 1).padStart(3, '0');

    // Retrieve active student profile
    const studentProfile = (typeof getData === 'function') ? getData('tinkerlab_profile', {
        fullName: 'Arjun Sharma',
        rollNumber: 'CS21B001',
        department: 'Computer Science',
        email: 'cse001@bmu.edu.in'
    }) : {
        fullName: 'Arjun Sharma',
        rollNumber: 'CS21B001',
        department: 'Computer Science',
        email: 'cse001@bmu.edu.in'
    };

    // Construct item entries with availability metadata
    const requestedItems = itemKeys.map(key => {
        const invItem = inventory.find(c => c.name.toLowerCase() === key.toLowerCase() || (c.id && c.id.toLowerCase() === key.toLowerCase()));
        const staticDetails = COMPONENT_DETAILS[key] || {};
        const itemName = invItem ? invItem.name : (staticDetails.name || key);
        const available = invItem ? (invItem.qty || 0) : 10;
        const rack = invItem ? (invItem.location || 'Rack A-1') : 'Rack A-1';

        return {
            name: itemName,
            qty: cart[key],
            available: available,
            rack: rack,
            status: available > 0 ? 'Available' : 'Out of Stock'
        };
    });

    const now = new Date();
    const dateFormatted = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(now);
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    // Format dueDate
    let dueDateFormatted = '20 Aug 2026';
    const dateInput = document.getElementById('cartReturnDate');
    if (dateInput && dateInput.value) {
        const parts = dateInput.value.split('-');
        if (parts.length === 3) {
            const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            dueDateFormatted = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
        }
    }

    // Required fields: id, studentName, studentEmail, items, status "Pending", submittedDate, dueDate
    const newRequest = {
        id: newId,
        studentName: studentProfile.fullName || 'Arjun Sharma',
        studentRoll: studentProfile.rollNumber || 'CS21B001',
        studentEmail: studentProfile.email || 'cse001@bmu.edu.in',
        department: studentProfile.department || 'Computer Science',
        items: requestedItems,
        status: 'Pending',
        submittedDate: dateFormatted,
        submittedTime: timeFormatted,
        dueDate: dueDateFormatted,
        purpose: reason,
        comment: ''
    };

    // Save into shared storage
    existingRequests.unshift(newRequest);
    if (typeof saveRequests === 'function') {
        saveRequests(existingRequests);
    }

    // Clear cart & input
    if (typeof removeData === 'function') {
        removeData('tinkerlab_cart');
    }
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
    initReasonControls();
    renderCart();

    const clearBtn = document.querySelector('.btn-clear-cart');
    if (clearBtn) {
        clearBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to clear all items from your cart?')) {
                clearCart();
            }
        });
    }

    const submitBtn = document.querySelector('.btn-submit-request');
    if (submitBtn) {
        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            submitCartRequest();
        });
    }

    // Event delegation on items list
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

// Export functions to window
window.updateQty = updateQty;
window.removeItem = removeItem;
window.clearCart = clearCart;
window.submitCartRequest = submitCartRequest;
window.renderCart = renderCart;
