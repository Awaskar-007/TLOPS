/**
 * inventory.js - Lab Inventory Catalog Controller
 * 
 * Manages inventory table actions, category filtering, and real-time search.
 */

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.search-input');
    const categorySelect = document.querySelector('.category-select');
    const tableRows = document.querySelectorAll('.inventory-table tbody tr');

    function filterTable() {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const selectedCat = categorySelect ? categorySelect.value.toLowerCase().trim() : 'all';

        tableRows.forEach(row => {
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
});