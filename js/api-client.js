/**
 * api-client.js - Unified API Client for TLOPS
 * 
 * Provides unified helper functions to interface with:
 * 1. External APIs (Live Electronics / Hardware Catalog)
 * 2. Local JSON file backend (/api/json/*)
 * 3. MongoDB CRUD backend (/api/components, /api/requests, /api/users)
 * 4. Fallback to localStorage if backend is offline
 */

const API_BASE = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
    ? window.location.origin
    : 'http://localhost:5000';

const TlopsApi = {
    // 0. Server Health Check
    async checkHealth() {
        try {
            const res = await fetch(`${API_BASE}/api/health`);
            return await res.json();
        } catch (err) {
            return { status: 'OFFLINE', error: err.message };
        }
    },

    // 1. External API (Requirement 1)
    external: {
        async fetchHardwareCatalog(query = 'electronics') {
            try {
                const res = await fetch(`${API_BASE}/api/external/hardware-catalog?q=${encodeURIComponent(query)}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return await res.json();
            } catch (err) {
                console.warn('[api-client] External route unavailable, calling DummyJSON directly...');
                const directRes = await fetch(`https://dummyjson.com/products/search?q=${encodeURIComponent(query)}&limit=6`);
                const directData = await directRes.json();
                return {
                    source: 'Direct DummyJSON API (Client Side)',
                    items: directData.products.map(p => ({
                        externalId: p.id,
                        title: p.title,
                        category: p.category,
                        priceUsd: p.price,
                        rating: p.rating,
                        stock: p.stock,
                        thumbnail: p.thumbnail,
                        description: p.description
                    }))
                };
            }
        }
    },

    // 2. Local JSON Files CRUD (Requirement 3)
    json: {
        async getInventory(params = {}) {
            const query = new URLSearchParams(params).toString();
            const res = await fetch(`${API_BASE}/api/json/inventory?${query}`);
            return await res.json();
        },
        async addComponent(data) {
            const res = await fetch(`${API_BASE}/api/json/inventory`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        },
        async updateComponent(id, data) {
            const res = await fetch(`${API_BASE}/api/json/inventory/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        },
        async deleteComponent(id) {
            const res = await fetch(`${API_BASE}/api/json/inventory/${id}`, {
                method: 'DELETE'
            });
            return await res.json();
        },
        async getRequests(params = {}) {
            const query = new URLSearchParams(params).toString();
            const res = await fetch(`${API_BASE}/api/json/requests?${query}`);
            return await res.json();
        },
        async createRequest(data) {
            const res = await fetch(`${API_BASE}/api/json/requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        }
    },

    // 3. MongoDB CRUD (Requirement 4)
    mongo: {
        async getComponents(params = {}) {
            const query = new URLSearchParams(params).toString();
            const res = await fetch(`${API_BASE}/api/components?${query}`);
            return await res.json();
        },
        async getComponentById(id) {
            const res = await fetch(`${API_BASE}/api/components/${id}`);
            return await res.json();
        },
        async createComponent(data) {
            const res = await fetch(`${API_BASE}/api/components`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        },
        async updateComponent(id, data) {
            const res = await fetch(`${API_BASE}/api/components/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        },
        async deleteComponent(id) {
            const res = await fetch(`${API_BASE}/api/components/${id}`, {
                method: 'DELETE'
            });
            return await res.json();
        },
        async getRequests(params = {}) {
            const query = new URLSearchParams(params).toString();
            const res = await fetch(`${API_BASE}/api/requests?${query}`);
            return await res.json();
        },
        async createRequest(data) {
            const res = await fetch(`${API_BASE}/api/requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        },
        async updateRequest(id, data) {
            const res = await fetch(`${API_BASE}/api/requests/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        }
    }
};

window.TlopsApi = TlopsApi;
