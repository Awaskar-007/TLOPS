/**
 * inventory.js - Lab Inventory Catalog Controller
 * 
 * Manages inventory table actions, category filtering, and stock adjustments.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Inventory table search and filters can be initialized here
    const searchInput = document.querySelector('.search-input');
    const tableRows = document.querySelectorAll('.inventory-table tbody tr');

    if (searchInput && tableRows.length > 0) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            tableRows.forEach(row => {
                row.style.display = row.textContent.toLowerCase().includes(query) ? '' : 'none';
            });
        });
    }
});
