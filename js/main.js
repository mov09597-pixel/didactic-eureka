async function loadProducts() {
    const response = await fetch('/api/products');
    const products = await response.json();
    
    const grid = document.getElementById('product-grid');
    grid.innerHTML = products.map(p => `
        <div class="group">
            <div class="relative overflow-hidden">
                <img src="${p.image}" class="w-full h-[400px] object-cover transition duration-700 group-hover:scale-110">
                <button class="absolute bottom-0 w-full bg-white text-black py-3 translate-y-full group-hover:translate-y-0 transition">إضافة للسلة</button>
            </div>
            <h3 class="mt-4 font-bold uppercase">${p.name}</h3>
            <p class="text-zinc-400">${p.price} ج.م</p>
        </div>
    `).join('');
}

if(document.getElementById('product-grid')) loadProducts();
