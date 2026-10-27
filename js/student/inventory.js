/**
 * inventory.js - Student Lab Inventory Controller
 * 
 * Provides dynamic full-width inventory rendering, live search filtering,
 * category tab filtering, "In Stock Only" toggle, real-time cart additions,
 * and live synchronization with localStorage.
 */

document.addEventListener('DOMContentLoaded', () => {
    let toastTimer = null;
    let currentCategory = 'all';
    let inStockOnly = false;
    let searchQuery = '';

    const gridContainer = document.getElementById('studentInventoryGrid');
    const searchInput = document.getElementById('inventorySearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const categoryTabs = document.querySelectorAll('.category-tab');
    const inStockCheckbox = document.getElementById('inStockOnlyCheckbox');
    const emptyState = document.getElementById('inventoryEmptyState');
    const emptyStateMsg = document.getElementById('emptyStateMsg');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    const cartPillCount = document.getElementById('cartPillCount');
    const toastNotice = document.getElementById('toastNotice');
    const toastMessage = document.getElementById('toastMessage');

    /**
     * Safely escapes HTML characters to prevent XSS.
     */
    function safeHtml(str) {
        if (typeof escapeHtml === 'function') {
            return escapeHtml(str);
        }
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /**
     * Shows a temporary toast notice message.
     */
    function showToast(msg) {
        if (!toastNotice || !toastMessage) return;
        toastMessage.innerHTML = msg;
        toastNotice.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toastNotice.classList.remove('show');
        }, 3200);
    }

    /**
     * Retrieves cart from localStorage.
     */
    function getStudentCart() {
        return (typeof getData === 'function') ? getData('tinkerlab_cart', {}) : {};
    }

    /**
     * Updates the header cart count badge.
     */
    function updateCartPill() {
        const cart = getStudentCart();
        let totalCount = 0;
        Object.keys(cart).forEach(key => {
            const val = parseInt(cart[key], 10) || 0;
            if (val > 0) totalCount += val;
        });

        if (cartPillCount) {
            cartPillCount.textContent = totalCount;
        }
    }

    /**
     * Returns an SVG icon and theme class for a given component item.
     */
    function getComponentIconInfo(item) {
        const cat = (item.category || '').toLowerCase();
        if (cat.includes('micro') || cat.includes('board') || cat.includes('sbc')) {
            return {
                boxClass: 'icon-blue',
                svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>`
            };
        } else if (cat.includes('sensor')) {
            return {
                boxClass: 'icon-purple',
                svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="6"/></svg>`
            };
        } else if (cat.includes('actuator') || cat.includes('motor')) {
            return {
                boxClass: 'icon-orange',
                svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`
            };
        }
        return {
            boxClass: 'icon-amber',
            svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`
        };
    }

    /**
     * Returns category badge CSS class and label.
     */
    function getCategoryInfo(category) {
        const cat = (category || '').toLowerCase();
        if (cat.includes('micro')) return { cls: 'microcontrollers', label: 'Microcontrollers' };
        if (cat.includes('sensor')) return { cls: 'sensors', label: 'Sensors' };
        if (cat.includes('actuator') || cat.includes('motor')) return { cls: 'actuators', label: 'Actuators' };
        return { cls: 'general', label: category || 'General' };
    }

    /**
     * Updates category count numbers on filter tabs.
     */
    function updateCategoryCounts(inventory) {
        const total = inventory.length;
        const microCount = inventory.filter(i => (i.category || '').toLowerCase().includes('micro')).length;
        const sensorsCount = inventory.filter(i => (i.category || '').toLowerCase().includes('sensor')).length;
        const actuatorsCount = inventory.filter(i => (i.category || '').toLowerCase().includes('actuator') || (i.category || '').toLowerCase().includes('motor')).length;

        const countAllEl = document.getElementById('countAll');
        const countMicroEl = document.getElementById('countMicro');
        const countSensorsEl = document.getElementById('countSensors');
        const countActuatorsEl = document.getElementById('countActuators');

        if (countAllEl) countAllEl.textContent = total;
        if (countMicroEl) countMicroEl.textContent = microCount;
        if (countSensorsEl) countSensorsEl.textContent = sensorsCount;
        if (countActuatorsEl) countActuatorsEl.textContent = actuatorsCount;
    }

    /**
     * Renders inventory cards according to active search, category, and in-stock filters.
     */
    function renderInventory() {
        if (!gridContainer) return;

        const inventory = (typeof getInventory === 'function') ? getInventory() : [];
        updateCategoryCounts(inventory);

        const cart = getStudentCart();
        const q = searchQuery.toLowerCase().trim();

        const filtered = inventory.filter(item => {
            const name = (item.name || '').toLowerCase();
            const desc = (item.description || '').toLowerCase();
            const cat = (item.category || '').toLowerCase();
            const loc = (item.location || '').toLowerCase();
            const qty = (typeof item.qty === 'number') ? item.qty : parseInt(item.qty, 10) || 0;

            // Search filter
            const matchesSearch = !q || name.includes(q) || desc.includes(q) || cat.includes(q) || loc.includes(q);

            // Category filter
            let matchesCategory = true;
            if (currentCategory === 'microcontrollers') {
                matchesCategory = cat.includes('micro');
            } else if (currentCategory === 'sensors') {
                matchesCategory = cat.includes('sensor');
            } else if (currentCategory === 'actuators') {
                matchesCategory = cat.includes('actuator') || cat.includes('motor');
            }

            // In Stock Only filter
            let matchesStock = true;
            if (inStockOnly) {
                matchesStock = qty > 0;
            }

            return matchesSearch && matchesCategory && matchesStock;
        });

        gridContainer.innerHTML = '';

        if (filtered.length === 0) {
            if (emptyState) {
                emptyState.style.display = 'block';
                if (emptyStateMsg) {
                    if (q) {
                        emptyStateMsg.textContent = `No components match "${q}". Try a different keyword or reset filters.`;
                    } else {
                        emptyStateMsg.textContent = 'No components found for the selected category filter.';
                    }
                }
            }
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        filtered.forEach(item => {
            const qty = (typeof item.qty === 'number') ? item.qty : parseInt(item.qty, 10) || 0;
            const minThreshold = (typeof item.minThreshold === 'number') ? item.minThreshold : parseInt(item.minThreshold, 10) || 0;
            const isOutOfStock = qty <= 0;
            const isLowStock = !isOutOfStock && qty <= minThreshold;

            let stockCls = 'available';
            let stockLabel = `Available (${qty} in stock)`;
            if (isOutOfStock) {
                stockCls = 'out';
                stockLabel = 'Out of Stock';
            } else if (isLowStock) {
                stockCls = 'low';
                stockLabel = `Low Stock (${qty} left)`;
            }

            const catInfo = getCategoryInfo(item.category);
            const iconInfo = getComponentIconInfo(item);
            const inCartQty = cart[item.name] || (item.id && cart[item.id]) || 0;

            const card = document.createElement('div');
            card.className = 'inventory-card';

            card.innerHTML = `
                <div>
                    <div class="card-top-row">
                        <span class="category-badge ${catInfo.cls}">${safeHtml(catInfo.label)}</span>
                        <span class="stock-status-badge ${stockCls}">${safeHtml(stockLabel)}</span>
                    </div>

                    <div class="card-item-header">
                        <div class="card-icon-box ${iconInfo.boxClass}">
                            ${iconInfo.svg}
                        </div>
                        <div>
                            <h3 class="item-name-heading">${safeHtml(item.name)}</h3>
                        </div>
                    </div>

                    <p class="item-description">${safeHtml(item.description || 'Standard academic lab component for prototyping.')}</p>
                </div>

                <div>
                    <div class="card-meta-row">
                        <span class="card-location">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            ${safeHtml(item.location || 'Lab Rack')}
                        </span>
                        <span class="card-stock-qty">${qty} Units</span>
                    </div>

                    <div class="card-footer-action">
                        <span class="in-cart-indicator ${inCartQty > 0 ? '' : 'hidden'}" data-item-name="${safeHtml(item.name)}">
                            In Cart: <strong>${inCartQty}</strong>
                        </span>

                        <button type="button" class="btn-add-to-cart" ${isOutOfStock ? 'disabled' : ''} data-item="${safeHtml(item.name)}">
                            ${isOutOfStock ? 'Out of Stock' : '+ Add to Cart'}
                        </button>
                    </div>
                </div>
            `;

            // Button click listener to add to cart
            const addBtn = card.querySelector('.btn-add-to-cart');
            if (addBtn && !isOutOfStock) {
                addBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const activeCart = getStudentCart();
                    const currentVal = activeCart[item.name] || 0;
                    activeCart[item.name] = currentVal + 1;

                    if (typeof saveData === 'function') {
                        saveData('tinkerlab_cart', activeCart);
                    }

                    // Update in-cart indicator on card
                    const indicator = card.querySelector('.in-cart-indicator');
                    if (indicator) {
                        indicator.innerHTML = `In Cart: <strong>${activeCart[item.name]}</strong>`;
                        indicator.classList.remove('hidden');
                    }

                    // Update header cart badge
                    updateCartPill();

                    // Show toast notice
                    showToast(`<strong>${safeHtml(item.name)}</strong> added to cart! <a href="cart.html" style="color:#93c5fd; text-decoration:underline; font-weight:600; margin-left:6px;">View Cart &rarr;</a>`);
                });
            }

            gridContainer.appendChild(card);
        });
    }

    // Live search input handler
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            searchQuery = searchInput.value;
            if (clearSearchBtn) {
                clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
            }
            renderInventory();
        });
    }

    // Clear search button
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            searchQuery = '';
            clearSearchBtn.style.display = 'none';
            renderInventory();
            if (searchInput) searchInput.focus();
        });
    }

    // Category filter tabs
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            categoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.getAttribute('data-category') || 'all';
            renderInventory();
        });
    });

    // In Stock Only checkbox
    if (inStockCheckbox) {
        inStockCheckbox.addEventListener('change', () => {
            inStockOnly = inStockCheckbox.checked;
            renderInventory();
        });
    }

    // Reset filters button
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            searchQuery = '';
            currentCategory = 'all';
            inStockOnly = false;
            if (searchInput) searchInput.value = '';
            if (clearSearchBtn) clearSearchBtn.style.display = 'none';
            if (inStockCheckbox) inStockCheckbox.checked = false;
            categoryTabs.forEach(tab => {
                if (tab.getAttribute('data-category') === 'all') {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });
            renderInventory();
        });
    }

    // Initial render and cart badge sync
    renderInventory();
    updateCartPill();
});
