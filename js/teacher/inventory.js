/**
 * inventory.js - Lab Inventory Catalog Controller
 * 
 * Dynamically renders inventory items from localStorage (JSON),
 * supports category filtering, real-time search, and editing/deleting components
 * with live toast notifications.
 */

document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.querySelector('.inventory-table tbody');
    const searchInput = document.querySelector('.search-input');
    const categorySelect = document.querySelector('.category-select');
    const subtitleEl = document.querySelector('.page-subtitle');

    // Helper: returns SVG icon markup based on iconType
    function getIconMarkup(iconType) {
        switch (iconType) {
            case 'diamond':
                return `<div class="comp-icon icon-blue-diamond"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="3" transform="rotate(45 12 12)"/></svg></div>`;
            case 'square-red':
                return `<div class="comp-icon icon-red-square"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="4"/></svg></div>`;
            case 'triangle-orange':
                return `<div class="comp-icon icon-orange-triangle"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 22,12 12,22 2,12"/></svg></div>`;
            case 'temp-amber':
                return `<div class="comp-icon icon-amber-temp"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg></div>`;
            case 'gyro-purple':
                return `<div class="comp-icon icon-purple-gyro"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/></svg></div>`;
            case 'gear-slate':
                return `<div class="comp-icon icon-slate-gear"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></div>`;
            case 'sensor-grey':
            default:
                return `<div class="comp-icon icon-grey-sensor"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="7" cy="12" r="4"/><circle cx="17" cy="12" r="4"/><line x1="11" y1="12" x2="13" y2="12"/></svg></div>`;
        }
    }

    // Helper: returns status badge markup based on stock qty and minThreshold
    function getStatusBadge(qty, minThreshold) {
        if (qty <= 0) {
            return `<span class="badge badge-out-stock">Out of Stock</span>`;
        } else if (qty <= minThreshold) {
            return `<span class="badge badge-low-stock">Low Stock</span>`;
        } else {
            return `<span class="badge badge-available">Available</span>`;
        }
    }

    // Helper: returns formatted quantity HTML
    function getQtyHtml(qty, minThreshold) {
        let qtyClass = '';
        if (qty <= 0) qtyClass = 'qty-out';
        else if (qty <= minThreshold) qtyClass = 'qty-low';

        return `<span class="qty-value"><strong class="${qtyClass}">${qty}</strong> <span class="min-qty">/ min ${minThreshold}</span></span>`;
    }

    // Toast Notification helper
    let toastTimer = null;
    function showToast(msg) {
        const toast = document.getElementById('toastNotice');
        const msgEl = document.getElementById('toastMessage');
        if (!toast || !msgEl) return;
        msgEl.innerHTML = msg;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toast.classList.remove('show');
        }, 3500);
    }

    // Renders the table from stored inventory
    function renderInventoryTable() {
        if (!tbody) return;
        const inventory = (typeof getInventory === 'function') ? getInventory() : [];

        // Update component counter
        if (subtitleEl) {
            subtitleEl.textContent = `${inventory.length} components tracked`;
        }

        tbody.innerHTML = '';

        if (inventory.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 32px; color: #64748b;">No components found in inventory.</td></tr>`;
            return;
        }

        inventory.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', item.id || `comp_${index}`);
            tr.setAttribute('data-category', (item.category || '').toLowerCase());

            const safeName = escapeHtml(item.name || 'Unnamed Component');
            const safeDesc = escapeHtml(item.description || '');
            const safeCategory = escapeHtml(item.category || 'General');
            const safeLocation = escapeHtml(item.location || 'Rack A-1');
            const qty = typeof item.qty === 'number' ? item.qty : parseInt(item.qty, 10) || 0;
            const minThreshold = typeof item.minThreshold === 'number' ? item.minThreshold : parseInt(item.minThreshold, 10) || 0;

            const iconHtml = getIconMarkup(item.iconType);
            const statusHtml = getStatusBadge(qty, minThreshold);
            const qtyHtml = getQtyHtml(qty, minThreshold);

            tr.innerHTML = `
                <td>
                    <div class="component-cell">
                        ${iconHtml}
                        <div class="comp-text">
                            <span class="comp-name">${safeName}</span>
                            <span class="comp-desc">${safeDesc}</span>
                        </div>
                    </div>
                </td>
                <td><span class="category-name">${safeCategory}</span></td>
                <td>${qtyHtml}</td>
                <td>${statusHtml}</td>
                <td><span class="location-name">${safeLocation}</span></td>
                <td>
                    <div class="action-links">
                        <a href="edit-component.html?id=${encodeURIComponent(item.id || item.name)}" class="action-edit">Edit</a>
                    </div>
                </td>
            `;

            tbody.appendChild(tr);
        });

        filterTable();
    }

    // Dual Search and Category filter
    function filterTable() {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const selectedCat = categorySelect ? categorySelect.value.toLowerCase().trim() : 'all';
        const rows = document.querySelectorAll('.inventory-table tbody tr');

        rows.forEach(row => {
            const rowText = row.textContent.toLowerCase();
            const categoryEl = row.querySelector('.category-name');
            const categoryText = categoryEl ? categoryEl.textContent.toLowerCase().trim() : '';

            const matchesSearch = !query || rowText.includes(query);
            const matchesCat = (selectedCat === 'all') || categoryText.includes(selectedCat);

            row.style.display = (matchesSearch && matchesCat) ? '' : 'none';
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterTable);
    }

    if (categorySelect) {
        categorySelect.addEventListener('change', filterTable);
    }

    // Initial render
    renderInventoryTable();

    // Check for flash toast messages
    if (typeof getData === 'function') {
        const flashMsg = getData('tlops_flash_toast');
        if (flashMsg) {
            showToast(flashMsg);
            if (typeof removeData === 'function') removeData('tlops_flash_toast');
        }
    }
});
