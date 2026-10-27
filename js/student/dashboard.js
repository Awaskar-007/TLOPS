/**
 * dashboard.js - Student Dashboard Controller
 * 
 * Calculates live KPI metrics from shared storage,
 * and renders student's recent requests.
 * Component browsing has been moved to its own dedicated page (inventory.html).
 */

document.addEventListener('DOMContentLoaded', () => {
    let toastTimer = null;

    /**
     * Displays a temporary toast notification message.
     * @param {string} msg - Message HTML or text to display.
     */
    function showToast(msg) {
        const toast = document.getElementById('toastNotice');
        const msgEl = document.getElementById('toastMessage');
        if (!toast || !msgEl) return;

        msgEl.innerHTML = msg;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    /**
     * Renders recent student requests and metrics from shared storage.
     */
    function renderRecentRequestsAndMetrics() {
        const requests = (typeof getRequests === 'function') ? getRequests() : [];
        const inventory = (typeof getInventory === 'function') ? getInventory() : [];

        // Calculate available components
        const availableCount = inventory.filter(c => (c.qty || 0) > 0).length;
        const totalCount = inventory.length;

        // Count requests by status
        const pendingCount = requests.filter(r => (r.status || '').toLowerCase() === 'pending').length;
        const approvedCount = requests.filter(r => (r.status || '').toLowerCase() === 'approved').length;
        const activeCount = pendingCount + approvedCount;

        // Update KPI card text if elements exist
        const allH3 = document.querySelectorAll('h3');
        allH3.forEach(h3 => {
            const title = h3.textContent.trim().toLowerCase();
            const nextP = h3.nextElementSibling;
            if (!nextP || nextP.tagName !== 'P') return;

            if (title === 'available components') {
                nextP.innerHTML = `${availableCount}<br>of ${totalCount} total`;
            } else if (title === 'active requests') {
                nextP.innerHTML = `${activeCount}<br>in progress`;
            } else if (title === 'pending approval') {
                nextP.innerHTML = `${pendingCount}<br>awaiting review`;
            } else if (title === 'approved') {
                nextP.innerHTML = `${approvedCount}<br>ready to collect`;
            }
        });

        // Update My Recent Requests section
        const recentHeading = document.getElementById('requests');
        if (recentHeading) {
            recentHeading.style.cursor = 'pointer';
            recentHeading.title = 'View all requests';
            recentHeading.addEventListener('click', () => {
                window.location.href = 'requests.html';
            });

            let nextEl = recentHeading.nextElementSibling;
            while (nextEl && nextEl.tagName !== 'HR' && !nextEl.classList.contains('toast-notice')) {
                const toRemove = nextEl;
                nextEl = nextEl.nextElementSibling;
                toRemove.remove();
            }

            const recentList = requests.slice(0, 3);
            if (recentList.length === 0) {
                const emptyP = document.createElement('p');
                emptyP.textContent = 'No requests submitted yet.';
                emptyP.style.color = '#64748b';
                emptyP.style.gridColumn = '1 / -1';
                emptyP.style.padding = '16px 0';
                recentHeading.after(emptyP);
            } else {
                const frag = document.createDocumentFragment();
                recentList.forEach(req => {
                    const h3 = document.createElement('h3');
                    const compNames = (req.items || []).map(i => i.name).join(', ') || 'Custom Component';
                    h3.textContent = compNames;
                    h3.style.cursor = 'pointer';
                    h3.title = 'Click to view requests';
                    h3.addEventListener('click', () => {
                        window.location.href = 'requests.html';
                    });

                    const p1 = document.createElement('p');
                    const itemCount = (req.items || []).length;
                    p1.textContent = `${itemCount} items · ${req.submittedDate || 'Recent'}`;

                    const p2 = document.createElement('p');
                    p2.textContent = req.status || 'Pending';
                    p2.style.fontWeight = '600';

                    frag.appendChild(h3);
                    frag.appendChild(p1);
                    frag.appendChild(p2);
                    // View Request link removed per requirement
                });
                recentHeading.after(frag);
            }
        }
    }

    renderRecentRequestsAndMetrics();

    // Check for flash toast messages
    if (typeof getData === 'function') {
        const flashMsg = getData('tlops_flash_toast');
        if (flashMsg) {
            showToast(flashMsg);
            if (typeof removeData === 'function') removeData('tlops_flash_toast');
        }
    }
});
