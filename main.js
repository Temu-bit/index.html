let currentData = [];

function renderProducts(items) {
    const container = document.getElementById('product-grid');
    container.innerHTML = '';

    items.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';

        card.innerHTML = `
      <div class="product-info" style="text-align: center; padding: 2rem 1rem;">
        <h3 style="margin-bottom: 1rem;">${product.name}</h3>
        <p class="price" style="font-size: 1.5rem; color: var(--color-accent); margin-bottom: 2rem;">${product.price}</p>
        <a href="${product.link}" target="_blank" class="buy-btn" style="display: inline-block;">Zum Produkt</a>
      </div>
    `;
        container.appendChild(card);
    });
}

async function initApp() {
    const categoryContainer = document.getElementById('category-list');
    const binId = "69aa2160d0ea881f40f35ead"; // Fixed Bin ID for Santa Blanca Store
    const masterKey = "$2a$10$OoaK6RpNR.CKB8ZzH0Zd8e7o0R5sfAfP7d62uAlScO7Rw5ssCdhVu"; // Master Key for Public Fetch
    const sourceIndicator = document.getElementById('source-indicator');
    const sourceText = document.getElementById('source-text');

    categoryContainer.innerHTML = '';
    categories.forEach(cat => {
        const li = document.createElement('li');
        li.innerHTML = `<button onclick="filterProducts('${cat.id}')">${cat.icon} ${cat.name}</button>`;
        categoryContainer.appendChild(li);
    });

    currentData = [...products];

    try {
        const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest?nocache=${new Date().getTime()}`, {
            headers: {
                'X-Bin-Meta': 'false',
                'X-Master-Key': masterKey
            }
        });

        if (res.ok) {
            const cloudData = await res.json();
            if (cloudData.products) {
                currentData = cloudData.products;
                if (sourceIndicator) {
                    sourceIndicator.classList.add('live');
                    sourceText.textContent = "Quelle: Cloud-Sync (Live)";
                }
            }
        } else {
            throw new Error("Fetch not OK");
        }
    } catch (e) {
        console.warn("Cloud Fetch failed, using local/stock data", e);
        const localProducts = JSON.parse(localStorage.getItem('custom_products')) || [];
        if (localProducts.length > 0) {
            currentData = [...products, ...localProducts];
        }

        if (sourceIndicator) {
            sourceIndicator.classList.add('local');
            sourceText.textContent = "Quelle: Lokal (Standard)";
        }
    }

    renderProducts(currentData);
}

function filterProducts(categoryId) {
    const filtered = currentData.filter(p => p.category === categoryId);
    renderProducts(filtered);
}

document.addEventListener('DOMContentLoaded', initApp);
