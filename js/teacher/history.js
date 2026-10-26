/**
 * teacher-history.js - Request History & Audit Log Controller
 * 
 * Manages status filter pills and live search filtering across historical checkout records.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Filter Pills handling
    const pills = document.querySelectorAll('.filter-pill');
    const rows = document.querySelectorAll('.history-table tbody tr');

    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            const filter = pill.textContent.trim();
            rows.forEach(row => {
                const badge = row.querySelector('.badge');
                const match = filter === 'All' || (badge && badge.textContent.trim() === filter);
                row.style.display = match ? '' : 'none';
            });
        });
    });

    // Real-time Search Input filtering
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase().trim();
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(query) ? '' : 'none';
            });
            if (query.length > 0) {
                pills.forEach(p => p.classList.remove('active'));
                const firstPill = document.querySelector('.filter-pill');
                if (firstPill) firstPill.classList.add('active');
            }
        });
    }
});
