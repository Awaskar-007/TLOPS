const express = require('express');
const router = express.Router();

/**
 * External API Integration Route
 * 1. Demonstrates fetching data from a real external public API
 * 2. Formats and enhances the data for lab makerspace usage
 * 3. Handles network timeouts, fallback data, and error states gracefully
 */

// GET /api/external/hardware-catalog
// Fetches tech/gadget components from DummyJSON public API and adapts to lab inventory structure
router.get('/hardware-catalog', async (req, res) => {
    try {
        const query = req.query.q || 'electronics';
        // Using public DummyJSON API
        const externalUrl = `https://dummyjson.com/products/search?q=${encodeURIComponent(query)}&limit=8`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(externalUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`External API responded with status ${response.status}`);
        }

        const data = await response.json();

        // Transform into TLOPS maker catalog format
        const adaptedItems = (data.products || []).map((prod) => ({
            externalId: prod.id,
            title: prod.title,
            category: prod.category || 'Hardware & Accessories',
            priceUsd: prod.price,
            rating: prod.rating,
            stock: prod.stock,
            brand: prod.brand || 'Generic Maker',
            thumbnail: prod.thumbnail,
            description: prod.description,
            compatibleWith: ['Arduino Uno', 'ESP32', 'Raspberry Pi 4']
        }));

        res.json({
            source: 'External Public API (DummyJSON)',
            query,
            totalFetched: adaptedItems.length,
            timestamp: new Date().toISOString(),
            items: adaptedItems
        });
    } catch (err) {
        console.error('[External API Error]:', err.message);
        // Fallback response so frontend never breaks
        res.status(200).json({
            source: 'External API Fallback (Cached Specs)',
            isFallback: true,
            error: err.message,
            totalFetched: 3,
            items: [
                {
                    externalId: 'ext_fallback_01',
                    title: 'OLED Display Module 0.96 inch I2C 128x64',
                    category: 'Display & Modules',
                    priceUsd: 4.5,
                    rating: 4.8,
                    stock: 45,
                    brand: 'MakerBazaar',
                    thumbnail: 'https://via.placeholder.com/150?text=OLED+Module',
                    description: 'High contrast monochrome OLED display with SSD1306 driver for Arduino & ESP32.',
                    compatibleWith: ['Arduino Uno', 'ESP32', 'Raspberry Pi 4']
                },
                {
                    externalId: 'ext_fallback_02',
                    title: 'Logic Level Converter 4-Channel Bi-Directional',
                    category: 'Power & Logic',
                    priceUsd: 2.2,
                    rating: 4.6,
                    stock: 60,
                    brand: 'SparkMaker',
                    thumbnail: 'https://via.placeholder.com/150?text=Logic+Converter',
                    description: 'Step-up 3.3V to 5V and step-down 5V to 3.3V safely for mixed voltage microcontrollers.',
                    compatibleWith: ['ESP32', 'Raspberry Pi 4']
                },
                {
                    externalId: 'ext_fallback_03',
                    title: 'Active Buzzer Module 5V',
                    category: 'Audio & Indicators',
                    priceUsd: 1.5,
                    rating: 4.5,
                    stock: 80,
                    brand: 'ElecLab',
                    thumbnail: 'https://via.placeholder.com/150?text=Buzzer+Module',
                    description: 'Piezoelectric audio transducer module with internal oscillation frequency.',
                    compatibleWith: ['Arduino Uno', 'ESP32']
                }
            ]
        });
    }
});

module.exports = router;
