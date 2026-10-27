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

    // Helper: returns empty string (component icons removed)
    function getIconMarkup(iconType) {
        return '';
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

            const statusHtml = getStatusBadge(qty, minThreshold);
            const qtyHtml = getQtyHtml(qty, minThreshold);

            tr.innerHTML = `
                <td>
                    <div class="component-cell">
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
