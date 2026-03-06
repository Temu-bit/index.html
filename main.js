let currentData = [];

function renderProducts(items) {
    const container = document.getElementById('product-grid');
    container.innerHTML = '';

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
    const binId = "69aa2160d0ea881f40f35ead"; // Fixed Bin ID for Santa Blanca Store

    categoryContainer.innerHTML = '';
    categories.forEach(cat => {
        const li = document.createElement('li');
        li.innerHTML = `<button onclick="filterProducts('${cat.id}')">${cat.icon} ${cat.name}</button>`;
        categoryContainer.appendChild(li);
    });

    currentData = [...products];

    try {
        const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
            headers: { 'X-Bin-Meta': 'false' }
        });
        if (res.ok) {
            const cloudData = await res.json();
            if (cloudData.products) currentData = cloudData.products;
        }
    } catch (e) {
        console.warn("Cloud Fetch failed, using local/stock data");
        const localProducts = JSON.parse(localStorage.getItem('custom_products')) || [];
        if (localProducts.length > 0) currentData = [...products, ...localProducts];
    }

    renderProducts(currentData);
}

function filterProducts(categoryId) {
    const filtered = currentData.filter(p => p.category === categoryId);
    renderProducts(filtered);
}

document.addEventListener('DOMContentLoaded', initApp);
