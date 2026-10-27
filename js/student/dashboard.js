/**
 * student-dashboard.js - Student Dashboard Controller
 * 
 * Dynamically displays available inventory from localStorage (JSON),
 * allows quick "+1" additions to the cart, calculates live KPI metrics,
 * and renders student's recent requests from shared storage.
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
     * Renders Quick Browse inventory items from stored array.
     */
    function renderInventoryItems() {
        const inventoryHeading = document.getElementById('inventory');
        if (!inventoryHeading) return;

        const inventory = (typeof getInventory === 'function') ? getInventory() : [];

        // Remove old dynamic or static items between #inventory and the next <hr>
        let nextEl = inventoryHeading.nextElementSibling;
        while (nextEl && nextEl.tagName !== 'HR' && !nextEl.classList.contains('toast-notice')) {
            const toRemove = nextEl;
            nextEl = nextEl.nextElementSibling;
            toRemove.remove();
        }

        if (inventory.length === 0) {
            const emptyP = document.createElement('p');
            emptyP.textContent = 'No components currently in inventory.';
            inventoryHeading.after(emptyP);
            return;
        }

        // Insert items right after the #inventory heading in reverse so they appear in correct order
        const frag = document.createDocumentFragment();

        inventory.forEach(item => {
            const safeName = escapeHtml(item.name);
            const qty = (typeof item.qty === 'number') ? item.qty : parseInt(item.qty, 10) || 0;
            const minThreshold = (typeof item.minThreshold === 'number') ? item.minThreshold : parseInt(item.minThreshold, 10) || 0;

            let statusText = 'Available';
            if (qty <= 0) statusText = 'Out of Stock';
            else if (qty <= minThreshold) statusText = 'Low Stock';

            const h3 = document.createElement('h3');
            h3.textContent = item.name;

            const p = document.createElement('p');
            p.textContent = `${qty} in stock - ${statusText}`;

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn-add-cart';
            btn.setAttribute('data-item', item.name);
            btn.textContent = '+1';

            if (qty <= 0) {
                btn.disabled = true;
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
            }

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const cart = (typeof getData === 'function') ? getData('tinkerlab_cart', {}) : {};
                cart[item.name] = (cart[item.name] || 0) + 1;
                if (typeof saveData === 'function') {
                    saveData('tinkerlab_cart', cart);
                }
                showToast(`${safeName} added! <a href="cart.html" style="color:#93c5fd; text-decoration:underline; font-weight:600; margin-left:6px;">View Cart &rarr;</a>`);
            });

            frag.appendChild(h3);
            frag.appendChild(p);
            frag.appendChild(btn);
        });

        inventoryHeading.after(frag);
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
            let nextEl = recentHeading.nextElementSibling;
            while (nextEl && nextEl.tagName !== 'HR') {
                const toRemove = nextEl;
                nextEl = nextEl.nextElementSibling;
                toRemove.remove();
            }

            const recentList = requests.slice(0, 3);
            if (recentList.length === 0) {
                const emptyP = document.createElement('p');
                emptyP.textContent = 'No requests submitted yet.';
                recentHeading.after(emptyP);
            } else {
                const frag = document.createDocumentFragment();
                recentList.forEach(req => {
                    const h3 = document.createElement('h3');
                    const compNames = (req.items || []).map(i => i.name).join(', ') || 'Custom Component';
                    h3.textContent = compNames;

                    const p1 = document.createElement('p');
                    const itemCount = (req.items || []).length;
                    p1.textContent = `${itemCount} items · ${req.submittedDate || 'Recent'}`;

                    const p2 = document.createElement('p');
                    p2.textContent = req.status || 'Pending';
                    p2.style.fontWeight = '600';

                    const a = document.createElement('a');
                    a.href = 'requests.html';
                    a.textContent = 'View Request';

                    frag.appendChild(h3);
                    frag.appendChild(p1);
                    frag.appendChild(p2);
                    frag.appendChild(a);
                });
                recentHeading.after(frag);
            }
        }
    }

    // Navigation active highlighting logic for Dashboard vs Inventory
    const navDashboard = document.getElementById('nav-dashboard');
    const navInventory = document.getElementById('nav-inventory');
    const inventorySection = document.getElementById('inventory');
    let isManualClick = false;

    function setActiveNav(item) {
        if (!navDashboard || !navInventory) return;
        if (item === 'inventory') {
            navInventory.classList.add('active');
            navDashboard.classList.remove('active');
        } else {
            navDashboard.classList.add('active');
            navInventory.classList.remove('active');
        }
    }

    if (navInventory) {
        navInventory.addEventListener('click', (e) => {
            e.preventDefault();
            isManualClick = true;
            setActiveNav('inventory');
            history.pushState(null, null, '#inventory');
            if (inventorySection) {
                inventorySection.scrollIntoView({ behavior: 'smooth' });
            }
            setTimeout(() => { isManualClick = false; }, 800);
        });
    }

    if (navDashboard) {
        navDashboard.addEventListener('click', (e) => {
            e.preventDefault();
            isManualClick = true;
            setActiveNav('dashboard');
            history.pushState(null, null, window.location.pathname);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => { isManualClick = false; }, 800);
        });
    }

    renderInventoryItems();
    renderRecentRequestsAndMetrics();
});
