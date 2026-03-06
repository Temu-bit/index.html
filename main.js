let currentData = [];

function renderProducts(items) {
    const container = document.getElementById('product-grid');
    if (!container) return;
    container.innerHTML = '';

    if (items.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; opacity: 0.5;">Keine Produkte gefunden.</p>';
        return;
    }

    items.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';

        card.innerHTML = `
      <div class="product-info">
        <h3>${product.name}</h3>
        <p class="price">${product.price}</p>
        <a href="${product.link}" target="_blank" class="buy-btn">Zum Produkt</a>
      </div>
    `;
        container.appendChild(card);
    });
}

async function initApp() {
    const categoryContainer = document.getElementById('category-list');

    // 0. Render Categories
    if (categoryContainer) {
        categoryContainer.innerHTML = '';
        categories.forEach(cat => {
            const li = document.createElement('li');
            li.innerHTML = `<button onclick="filterProducts('${cat.id}')">${cat.icon} ${cat.name}</button>`;
            categoryContainer.appendChild(li);
        });
    }

    // 1. Determine which Bin ID to use (URL -> Storage -> None)
    const urlParams = new URLSearchParams(window.location.search);
    const customBinId = urlParams.get('bin');
    const savedBinId = localStorage.getItem('santa_blanca_bin_id');
    const fetchBinId = customBinId || savedBinId;

    // 2. Start with stock products
    currentData = [...products];

    let syncSource = "Lokal (Standard)";
    const sharedData = urlParams.get('shared');

    if (sharedData) {
        // Snapshot Link: Data is encoded in URL
        try {
            const rawDecoded = atob(decodeURIComponent(sharedData));
            const decoded = JSON.parse(decodeURIComponent(escape(rawDecoded)));
            if (Array.isArray(decoded)) {
                console.log("Loaded snapshot from URL");
                const expanded = decoded.map(p => ({
                    id: p.i || p.id,
                    name: p.n || p.name,
                    price: p.p || p.price,
                    category: p.c || p.category,
                    link: p.l || p.link
                }));
                currentData = [...expanded];
                syncSource = "Snapshot-Link";
            }
        } catch (e) {
            console.error("Failed to parse snapshot", e);
        }
    } else if (fetchBinId) {
        // 3. Try to load products from Cloud (JSONBin)
        try {
            const res = await fetch(`https://api.jsonbin.io/v3/b/${fetchBinId}/latest`, {
                headers: { 'X-Bin-Meta': 'false' }
            });
            if (res.ok) {
                const cloudData = await res.json();
                if (cloudData.products && Array.isArray(cloudData.products)) {
                    console.log(`Loaded from Cloud: ${fetchBinId}`);
                    currentData = [...cloudData.products];
                    syncSource = `Cloud-Sync (Live)`;
                }
            } else {
                console.warn("Cloud Bin not accessible or private");
                syncSource = "Cloud-Speicher nicht erreichbar";
            }
        } catch (e) {
            console.warn("Network Error during Cloud Fetch");
            syncSource = "Netzwerk-Fehler";
        }
    }

    // Add Debug Indicator to Footer
    let debugBox = document.getElementById('debug-sync-status');
    if (!debugBox) {
        debugBox = document.createElement('div');
        debugBox.id = 'debug-sync-status';
        debugBox.style.cssText = "position:fixed; bottom:10px; right:10px; font-size:10px; background:rgba(0,0,0,0.7); color:#8f8; padding:5px 10px; border-radius:20px; z-index:9999; pointer-events:none;";
        document.body.appendChild(debugBox);
    }
    debugBox.textContent = "⚙️ Quelle: " + syncSource;

    // Remove duplicates by ID (Final safety check)
    const seen = new Set();
    currentData = currentData.filter(p => {
        if (!p.id) return true; // Keep items without ID (shouldn't happen)
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
    });

    renderProducts(currentData);
}

function filterProducts(categoryId) {
    const filtered = currentData.filter(p => p.category === categoryId);
    renderProducts(filtered);
}

document.addEventListener('DOMContentLoaded', initApp);
