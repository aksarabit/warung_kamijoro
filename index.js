let cart = [];

// Load data menu dari localStorage (sinkron dengan admin)
function loadMenus() {
    const savedMenus = localStorage.getItem('warungKamijoroMenus');
    if (savedMenus) {
        return JSON.parse(savedMenus);
    } else {
        // Data default jika belum ada
        const defaultMenus = [
            { id: 1, name: 'Nasi Goreng Spesial', category: 'makanan', price: 20000, stock: 50, desc: 'Nasi goreng dengan telur, ayam, dan sayuran segar', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', popular: true },
            { id: 2, name: 'Ayam Bakar Madu', category: 'makanan', price: 30000, stock: 40, desc: 'Ayam bakar dengan bumbu madu spesial', image: 'https://images.unsplash.com/photo-1596797038530-2c39fa81b487?w=400', popular: false },
            { id: 3, name: 'Sate Ayam', category: 'makanan', price: 25000, stock: 30, desc: '10 tusuk sate ayam dengan bumbu kacang', image: 'https://images.unsplash.com/photo-1563379091339-03b21a4a5a47?w=400', popular: true, isNew: true },
            { id: 4, name: 'Mie Goreng', category: 'makanan', price: 18000, stock: 45, desc: 'Mie goreng dengan sayuran dan telur', image: 'https://images.unsplash.com/photo-1548940740-204726a19be3?w=400', popular: false },
            { id: 5, name: 'Es Teh Manis', category: 'minuman', price: 5000, stock: 100, desc: 'Teh manis segar dengan es batu', image: 'https://images.unsplash.com/photo-1563257012-2a8b9e4bc39a?w=400', popular: false },
            { id: 6, name: 'Jus Jeruk', category: 'minuman', price: 8000, stock: 80, desc: 'Jus jeruk segar tanpa pengawet', image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400', popular: false },
            { id: 7, name: 'Es Kelapa Muda', category: 'minuman', price: 10000, stock: 60, desc: 'Kelapa muda segar dengan sirup', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', popular: false },
            { id: 8, name: 'Pisang Goreng', category: 'snack', price: 12000, stock: 70, desc: 'Pisang goreng crispy dengan topping keju', image: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=400', popular: false },
            { id: 9, name: 'Tahu Isi', category: 'snack', price: 8000, stock: 90, desc: 'Tahu goreng isi sayuran (5 pcs)', image: 'https://images.unsplash.com/photo-1587415184623-b93a5c1e823a?w=400', popular: false }
        ];
        localStorage.setItem('warungKamijoroMenus', JSON.stringify(defaultMenus));
        return defaultMenus;
    }
}

// Render menu ke halaman customer
function renderCustomerMenus() {
    const menus = loadMenus();
    const menuContainer = document.querySelector('.menu-container');
    if (!menuContainer) return;
    
    menuContainer.innerHTML = '';
    
    menus.forEach(menu => {
        // Cek stok
        const isOutOfStock = menu.stock <= 0;
        
        const menuCard = document.createElement('div');
        menuCard.className = 'menu-card';
        menuCard.setAttribute('data-category', menu.category);
        menuCard.setAttribute('data-id', menu.id);
        menuCard.innerHTML = `
            ${menu.popular ? '<div class="menu-badge">Populer</div>' : ''}
            ${menu.isNew ? '<div class="menu-badge" style="background: #27ae60;">New</div>' : ''}
            <img src="${menu.image}" alt="${menu.name}" loading="lazy">
            <h3>${escapeHtml(menu.name)}</h3>
            <p class="menu-desc">${escapeHtml(menu.desc)}</p>
            <p class="menu-price">Rp ${menu.price.toLocaleString('id-ID')}</p>
            <div class="stock-info ${isOutOfStock ? 'out-stock' : ''}">
                ${isOutOfStock ? '<span class="stock-badge">Stok Habis</span>' : `<span class="stock-available">Stok: ${menu.stock}</span>`}
            </div>
            <button onclick="addToCart(${menu.id})" ${isOutOfStock ? 'disabled' : ''}>
                <i class="fas fa-shopping-cart"></i> ${isOutOfStock ? 'Stok Habis' : 'Tambah'}
            </button>
        `;
        menuContainer.appendChild(menuCard);
    });
    
    // Jalankan filter kategori setelah render
    applyCategoryFilter();
}

// Fungsi addToCart dengan pengecekan stok
function addToCart(menuId) {
    const menus = loadMenus();
    const menu = menus.find(m => m.id === menuId);
    
    if (!menu) {
        showNotification('Menu tidak ditemukan!', 'error');
        return;
    }
    
    if (menu.stock <= 0) {
        showNotification('Maaf, stok ' + menu.name + ' habis!', 'error');
        return;
    }
    
    // Cek apakah produk sudah ada di keranjang
    const existingItem = cart.find(item => item.id === menuId);
    
    // Hitung total yang akan dipesan
    const currentQty = existingItem ? existingItem.quantity : 0;
    
    if (currentQty + 1 > menu.stock) {
        showNotification(`Stok ${menu.name} hanya tersisa ${menu.stock}!`, 'error');
        return;
    }
    
    if (existingItem) {
        existingItem.quantity += 1;
        showNotification(`✓ ${menu.name} +1 (${existingItem.quantity}x)`);
    } else {
        cart.push({ 
            id: menu.id,
            name: menu.name, 
            price: menu.price, 
            quantity: 1
        });
        showNotification(`✓ ${menu.name} ditambahkan ke keranjang`);
    }
    
    saveCart();
    renderCart();
}

// Update quantity dengan cek stok
function updateQuantity(menuId, change) {
    const menus = loadMenus();
    const menu = menus.find(m => m.id === menuId);
    
    const itemIndex = cart.findIndex(item => item.id === menuId);
    
    if (itemIndex > -1) {
        const newQuantity = cart[itemIndex].quantity + change;
        
        if (newQuantity <= 0) {
            if (confirm(`Hapus ${cart[itemIndex].name} dari keranjang?`)) {
                cart.splice(itemIndex, 1);
                showNotification(`✗ ${cart[itemIndex]?.name || 'Item'} dihapus dari keranjang`);
            }
        } else if (menu && newQuantity > menu.stock) {
            showNotification(`Stok ${menu.name} hanya tersisa ${menu.stock}!`, 'error');
            return;
        } else {
            cart[itemIndex].quantity = newQuantity;
            showNotification(`${change > 0 ? '✓' : '○'} ${cart[itemIndex].name} ${change > 0 ? 'ditambah' : 'dikurangi'} (${newQuantity}x)`);
        }
        
        saveCart();
        renderCart();
    }
}

// Render cart dengan cek stok realtime
function renderCart() {
    const cartItemsElement = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');
    const totalItemsElement = document.getElementById('total-items');
    const menus = loadMenus(); // Ambil data menu terbaru
    
    if (!cartItemsElement || !totalPriceElement) return;
    
    cartItemsElement.innerHTML = "";
    let total = 0;
    let totalItems = 0;
    
    // Filter item yang masih valid (menu masih ada dan stok cukup)
    cart = cart.filter(item => {
        const menu = menus.find(m => m.id === item.id);
        if (!menu || menu.stock <= 0) {
            showNotification(`${item.name} telah dihapus karena stok habis!`, 'error');
            return false;
        }
        return true;
    });
    
    if (cart.length === 0) {
        cartItemsElement.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-basket"></i>
                <p class="empty-msg">Keranjang masih kosong</p>
                <p class="empty-sub">Yuk pilih menu favoritmu!</p>
            </div>
        `;
        totalPriceElement.innerText = "Rp 0";
        if (totalItemsElement) totalItemsElement.innerText = "0";
        saveCart();
        return;
    }
    
    cart.forEach((item) => {
        const menu = menus.find(m => m.id === item.id);
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        totalItems += item.quantity;
        
        // Validasi quantity tidak melebihi stok
        if (menu && item.quantity > menu.stock) {
            item.quantity = menu.stock;
            if (menu.stock === 0) {
                cart = cart.filter(i => i.id !== item.id);
                renderCart();
                return;
            }
            showNotification(`Stok ${item.name} tersisa ${menu.stock}`, 'warning');
        }
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${escapeHtml(item.name)}</div>
                <div class="cart-item-price">Rp ${item.price.toLocaleString('id-ID')}</div>
            </div>
            <div class="qty-control">
                <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">−</button>
                <span class="qty-value">${item.quantity}</span>
                <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
            <div class="item-total">
                Rp ${itemTotal.toLocaleString('id-ID')}
            </div>
            <button class="remove-item" onclick="removeItem(${item.id})">✕</button>
        `;
        cartItemsElement.appendChild(cartItem);
    });
    
    totalPriceElement.innerText = "Rp " + total.toLocaleString('id-ID');
    if (totalItemsElement) totalItemsElement.innerText = totalItems;
    saveCart();
}

function removeItem(menuId) {
    const itemIndex = cart.findIndex(item => item.id === menuId);
    
    if (itemIndex > -1) {
        if (confirm(`Hapus ${cart[itemIndex].name} dari keranjang?`)) {
            cart.splice(itemIndex, 1);
            saveCart();
            renderCart();
            showNotification(`✗ Item dihapus dari keranjang`);
        }
    }
}

// Fungsi untuk paket promo (disesuaikan dengan ID menu)
function addPromoPackage() {
    const menus = loadMenus();
    const nasiGoreng = menus.find(m => m.name === 'Nasi Goreng Spesial');
    const esTeh = menus.find(m => m.name === 'Es Teh Manis');
    
    if (!nasiGoreng || !esTeh) {
        showNotification('Menu promo tidak tersedia!', 'error');
        return;
    }
    
    if (nasiGoreng.stock < 1 || esTeh.stock < 1) {
        showNotification('Maaf, salah satu menu promo sedang habis!', 'error');
        return;
    }
    
    // Cek apakah paket sudah ada
    const existingPackage = cart.find(item => item.name === 'Paket Hemat (Nasi Goreng + Es Teh)');
    
    if (existingPackage) {
        if (existingPackage.quantity + 1 > Math.min(nasiGoreng.stock, esTeh.stock)) {
            showNotification('Stok tidak mencukupi untuk paket ini!', 'error');
            return;
        }
        existingPackage.quantity += 1;
        showNotification(`✓ Paket Hemat +1 (${existingPackage.quantity}x) - Rp 22.000`);
    } else {
        cart.push({
            id: 'promo_package',
            name: 'Paket Hemat (Nasi Goreng + Es Teh)',
            price: 22000,
            quantity: 1,
            items: [nasiGoreng.id, esTeh.id]
        });
        showNotification('✓ Paket Hemat ditambahkan - Rp 22.000');
    }
    
    saveCart();
    renderCart();
}

// Checkout dengan update stok
function checkoutWhatsApp() {
    if (cart.length === 0) {
        showNotification('Keranjang masih kosong!', 'error');
        return;
    }
    
    // Ambil data customer
    const customerName = document.getElementById('customerName')?.value.trim();
    const customerPhone = document.getElementById('customerPhone')?.value.trim();
    const customerAddress = document.getElementById('customerAddress')?.value.trim();
    const customerNote = document.getElementById('customerNote')?.value.trim();
    
    // Ambil metode pembayaran
    const selectedPayment = document.querySelector('input[name="payment"]:checked');
    let paymentMethod = 'Bayar di Tempat';
    
    if (selectedPayment) {
        const paymentValue = selectedPayment.value;
        switch(paymentValue) {
            case 'cash': paymentMethod = 'Bayar di Tempat (Cash)'; break;
            case 'transfer': paymentMethod = 'Transfer Bank'; break;
            case 'qris': paymentMethod = 'QRIS (Scan QRIS)'; break;
        }
    }
    
    if (!customerName) {
        showNotification('Mohon isi nama Anda!', 'error');
        return;
    }
    
    if (!customerPhone) {
        showNotification('Mohon isi nomor WhatsApp!', 'error');
        return;
    }
    
    // Cek stok sebelum checkout
    const menus = loadMenus();
    for (const item of cart) {
        if (item.id === 'promo_package') continue;
        const menu = menus.find(m => m.id === item.id);
        if (!menu || menu.stock < item.quantity) {
            showNotification(`Stok ${item.name} tidak mencukupi! Tersisa: ${menu?.stock || 0}`, 'error');
            return;
        }
    }
    
    // Update stok
    for (const item of cart) {
        if (item.id === 'promo_package') {
            // Update stok untuk item dalam paket
            const nasiGoreng = menus.find(m => m.name === 'Nasi Goreng Spesial');
            const esTeh = menus.find(m => m.name === 'Es Teh Manis');
            if (nasiGoreng) nasiGoreng.stock -= item.quantity;
            if (esTeh) esTeh.stock -= item.quantity;
        } else {
            const menu = menus.find(m => m.id === item.id);
            if (menu) menu.stock -= item.quantity;
        }
    }
    
    // Simpan stok terbaru
    localStorage.setItem('warungKamijoroMenus', JSON.stringify(menus));
    
    // Simpan pesanan
    const orders = JSON.parse(localStorage.getItem('warungKamijoroOrders') || '[]');
    const newOrder = {
        id: Date.now(),
        date: new Date().toISOString(),
        customerName,
        customerPhone,
        customerAddress,
        customerNote,
        paymentMethod,
        items: cart.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })),
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        status: 'pending'
    };
    orders.push(newOrder);
    localStorage.setItem('warungKamijoroOrders', JSON.stringify(orders));
    
    // Kirim WhatsApp
    const nomorWA = "6281903478051";
    let teks = "🍽️ *PESANAN WARUNG KAMIJORO* 🍽️\n\n";
    teks += `👤 *Nama:* ${customerName}\n`;
    teks += `📞 *No. WA:* ${customerPhone}\n`;
    if (customerAddress) teks += `📍 *Alamat:* ${customerAddress}\n`;
    teks += `💳 *Metode Bayar:* ${paymentMethod}\n`;
    teks += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    teks += "*Detail Pesanan:*\n\n";
    
    let grandTotal = 0;
    cart.forEach((item, index) => {
        const subtotal = item.price * item.quantity;
        teks += `${index + 1}. ${item.name}\n`;
        teks += `   ${item.quantity}x @ Rp ${item.price.toLocaleString('id-ID')}\n`;
        teks += `   = Rp ${subtotal.toLocaleString('id-ID')}\n\n`;
        grandTotal += subtotal;
    });
    
    teks += `━━━━━━━━━━━━━━━━━━━━\n`;
    teks += `💰 *TOTAL: Rp ${grandTotal.toLocaleString('id-ID')}*\n\n`;
    if (customerNote) teks += `📝 *Catatan:* ${customerNote}\n\n`;
    teks += `_Terima kasih! Pesanan akan segera diproses._ 🙏`;
    
    // Clear cart setelah checkout
    cart = [];
    saveCart();
    renderCart();
    renderCustomerMenus(); // Refresh tampilan menu
    
    const url = `https://wa.me/${nomorWA}?text=${encodeURIComponent(teks)}`;
    showNotification('Pesanan berhasil! Mengarahkan ke WhatsApp...', 'success');
    
    setTimeout(() => {
        window.open(url, '_blank');
    }, 500);
}

// Apply category filter
function applyCategoryFilter() {
    const activeCategory = document.querySelector('.category-btn.active')?.dataset.category || 'all';
    const menuCards = document.querySelectorAll('.menu-card');
    
    menuCards.forEach(card => {
        const category = card.dataset.category;
        if (activeCategory === 'all' || category === activeCategory) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Load cart dari localStorage
function loadCart() {
    const savedCart = localStorage.getItem('warungKamijoroCart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            renderCart();
        } catch (e) {
            console.error('Gagal memuat keranjang:', e);
            cart = [];
        }
    }
}

function saveCart() {
    localStorage.setItem('warungKamijoroCart', JSON.stringify(cart));
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function showNotification(message, type = 'success') {
    let notification = document.querySelector('.custom-notification');
    if (notification) notification.remove();
    
    notification = document.createElement('div');
    notification.innerHTML = `<span>${message}</span>`;
    notification.style.cssText = `
        position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
        background: ${type === 'error' ? '#ff6b6b' : type === 'warning' ? '#f39c12' : '#27ae60'};
        color: white; padding: 12px 24px; border-radius: 50px; font-size: 0.9rem;
        font-weight: 500; z-index: 1000; box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        max-width: 90%; text-align: center; font-family: 'Poppins', sans-serif;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 2000);
}

function updateCartBadge() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartLink = document.querySelector('.nav-links a[href="#cart-section"]');
    if (cartLink) {
        if (totalItems > 0) {
            let badge = cartLink.querySelector('.cart-badge');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'cart-badge';
                badge.style.cssText = `background: #e67e22; color: white; border-radius: 50%; padding: 2px 6px; font-size: 0.7rem; margin-left: 5px;`;
                cartLink.appendChild(badge);
            }
            badge.textContent = totalItems;
        } else {
            const badge = cartLink.querySelector('.cart-badge');
            if (badge) badge.remove();
        }
    }
}

// Inisialisasi
document.addEventListener('DOMContentLoaded', () => {
    renderCustomerMenus();
    loadCart();
    
    // Update badge
    const originalRender = renderCart;
    window.renderCart = function() {
        originalRender();
        updateCartBadge();
    };
    renderCart();
    
    // Category filter event
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyCategoryFilter();
        });
    });
    
    // Payment method toggle
    const paymentRadios = document.querySelectorAll('input[name="payment"]');
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', togglePaymentDetails);
    });
    
    // Mobile menu
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => navLinks.classList.toggle('active'));
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => navLinks.classList.remove('active'));
        });
    }
    
    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});

function togglePaymentDetails() {
    const selectedPayment = document.querySelector('input[name="payment"]:checked')?.value;
    const transferInfo = document.getElementById('transfer-info');
    const qrisInfo = document.getElementById('qris-info');
    
    if (selectedPayment === 'transfer') {
        if (transferInfo) transferInfo.style.display = 'block';
        if (qrisInfo) qrisInfo.style.display = 'none';
    } else if (selectedPayment === 'qris') {
        if (transferInfo) transferInfo.style.display = 'none';
        if (qrisInfo) qrisInfo.style.display = 'block';
    } else {
        if (transferInfo) transferInfo.style.display = 'none';
        if (qrisInfo) qrisInfo.style.display = 'none';
    }
}
