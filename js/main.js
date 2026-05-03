// 1. تعريف مصفوفة السلة وتحميلها من الذاكرة المحلية (LocalStorage)
let cart = JSON.parse(localStorage.getItem('TITAN_CART')) || [];

// 2. دالة جلب المنتجات من السيرفر وعرضها في الصفحة
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        
        const grid = document.getElementById('product-grid');
        if (!grid) return; // تأكد أن العنصر موجود في الصفحة الحالية

        grid.innerHTML = products.map(p => `
            <div class="group">
                <div class="relative overflow-hidden bg-zinc-900 aspect-[3/4]">
                    <img src="${p.image}" class="w-full h-full object-cover transition duration-700 group-hover:scale-110">
                    <!-- زر الإضافة للسلة مربوط بالدالة البرمجية -->
                    <button onclick="addToCart('${p._id}', '${p.name}', ${p.price}, '${p.image}')" 
                            class="absolute bottom-0 w-full bg-white text-black py-4 font-black uppercase translate-y-full group-hover:translate-y-0 transition-all duration-300">
                        إضافة للسلة +
                    </button>
                </div>
                <div class="mt-4">
                    <h3 class="font-bold uppercase tracking-wider">${p.name}</h3>
                    <p class="text-zinc-400 font-light">${p.price} ج.م</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error("خطأ في تحميل المنتجات:", error);
    }
}

// 3. دالة إضافة منتج للسلة
function addToCart(productId, name, price, image) {
    const exists = cart.find(item => item.productId === productId);
    
    if (exists) {
        exists.quantity++;
    } else {
        cart.push({ productId, name, price, image, quantity: 1 });
    }
    
    saveCart();
    updateCartUI();
    
    // فتح السلة تلقائياً عند الإضافة لتجربة مستخدم أفضل
    if (typeof toggleCart === "function") {
        const cartSidebar = document.getElementById('cartSidebar');
        if (cartSidebar && cartSidebar.classList.contains('translate-x-full')) {
            toggleCart();
        }
    }
}

// 4. دالة حذف منتج من السلة
function removeFromCart(productId) {
    cart = cart.filter(item => item.productId !== productId);
    saveCart();
    updateCartUI();
}

// 5. حفظ بيانات السلة في المتصفح
function saveCart() {
    localStorage.setItem('TITAN_CART', JSON.stringify(cart));
}

// 6. تحديث واجهة السلة (الجانبية) والعداد
function updateCartUI() {
    const cartContainer = document.getElementById('cartItems');
    const totalContainer = document.getElementById('cartTotal');
    const cartCount = document.getElementById('cartCount');

    // تحديث عداد السلة في الـ Nav
    if (cartCount) {
        cartCount.innerText = cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    if (!cartContainer) return;

    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center h-64 text-zinc-500 italic">
                <span class="text-4xl mb-2">🛒</span>
                <p>السلة فارغة حالياً</p>
            </div>`;
        if (totalContainer) totalContainer.innerText = '0 ج.م';
        return;
    }

    // عرض عناصر السلة
    cartContainer.innerHTML = cart.map(item => `
        <div class="flex items-center gap-4 mb-6 border-b border-white/5 pb-4 group">
            <img src="${item.image}" class="w-20 h-24 object-cover bg-zinc-900">
            <div class="flex-1">
                <h4 class="font-bold text-sm uppercase">${item.name}</h4>
                <p class="text-zinc-500 text-xs">${item.price} ج.م</p>
                <div class="flex items-center gap-3 mt-2">
                    <span class="text-xs text-zinc-400">الكمية: ${item.quantity}</span>
                </div>
            </div>
            <button onclick="removeFromCart('${item.productId}')" class="text-zinc-600 hover:text-red-500 transition">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        </div>
    `).join('');

    // حساب الإجمالي
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (totalContainer) totalContainer.innerText = `${total.toLocaleString()} ج.م`;
}

// 7. تشغيل الدوال عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateCartUI();
});
