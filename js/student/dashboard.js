/**
 * student-dashboard.js - Student Dashboard Controller
 * 
 * Manages item quick-add to cart, smooth scrolling for inventory section,
 * navigation active tab highlighting, and toast alerts.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Component ID to display name mapping
    const ITEM_NAMES = {
        'arduino': 'Arduino Uno R3',
        'raspberry': 'Raspberry Pi 4 Model B',
        'esp32': 'ESP32 Dev Board',
        'sensor': 'HC-SR04 Ultrasonic Sensor',
        'dht11': 'DHT11 Temp & Humidity'
    };

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

    // Attach click listeners to "+1" Add to Cart buttons
    const addButtons = document.querySelectorAll('.btn-add-cart');
    addButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const itemId = button.getAttribute('data-item');
            if (!itemId) return;

            // Retrieve existing cart data using storage.js helper
            const cart = getData('tinkerlab_cart', {});
            cart[itemId] = (cart[itemId] || 0) + 1;

            // Save updated cart data
            saveData('tinkerlab_cart', cart);

            const name = ITEM_NAMES[itemId] || 'Component';
            showToast(`${name} added! <a href="cart.html">View Cart &rarr;</a>`);
        });
    });

    // Navigation active highlighting logic for Dashboard vs Inventory
    const navDashboard = document.getElementById('nav-dashboard');
    const navInventory = document.getElementById('nav-inventory');
    const inventorySection = document.getElementById('inventory');
    let isManualClick = false;

    /**
     * Updates navigation highlight state between Dashboard and Inventory
     * @param {string} item - 'dashboard' or 'inventory'
     */
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

    // Scroll spy: auto-update highlight as user scrolls
    window.addEventListener('scroll', () => {
        if (isManualClick || !inventorySection) return;
        const rect = inventorySection.getBoundingClientRect();
        if (rect.top <= 200) {
            setActiveNav('inventory');
        } else {
            setActiveNav('dashboard');
        }
    }, { passive: true });

    // Handle hash on initial page load
    if (window.location.hash === '#inventory') {
        setActiveNav('inventory');
        if (inventorySection) {
            setTimeout(() => {
                inventorySection.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }

    window.addEventListener('hashchange', () => {
        if (window.location.hash === '#inventory') {
            setActiveNav('inventory');
        } else {
            setActiveNav('dashboard');
        }
    });
});
