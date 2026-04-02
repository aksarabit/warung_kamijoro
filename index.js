let cart = [];

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

// Save cart ke localStorage
function saveCart() {
    localStorage.setItem('warungKamijoroCart', JSON.stringify(cart));
}

// Fungsi addToCart
function addToCart(name, price) {
    // Cegah event bubbling
    if (event) {
        event.stopPropagation();
    }
    
    console.log('Menambahkan:', name, price);
    
    if (!name || !price) {
        showNotification('Gagal menambahkan produk', 'error');
        return;
    }
    
    const numericPrice = Number(price);
    
    if (isNaN(numericPrice) || numericPrice <= 0) {
        showNotification('Harga produk tidak valid', 'error');
        return;
    }
    
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
        showNotification(`✓ ${name} +1 (${existingItem.quantity}x)`);
    } else {
        cart.push({ 
            name: name, 
            price: numericPrice, 
            quantity: 1
        });
        showNotification(`✓ ${name} ditambahkan`);
    }
    
    saveCart();
    renderCart();
}

// Fungsi untuk paket promo
function addPromoPackage() {
    if (event) {
        event.stopPropagation();
    }
    
    const promoName = 'Paket Hemat (Nasi Goreng + Es Teh)';
    const promoPrice = 22000;
    
    const existingItem = cart.find(item => item.name === promoName);
    
    if (existingItem) {
        existingItem.quantity += 1;
        showNotification(`✓ Paket Hemat +1 (${existingItem.quantity}x) - Rp 22.000`);
    } else {
        cart.push({
            name: promoName,
            price: promoPrice,
            quantity: 1
        });
        showNotification('✓ Paket Hemat ditambahkan - Rp 22.000');
    }
    
    saveCart();
    renderCart();
}

function updateQuantity(name, change) {
    if (event) {
        event.stopPropagation();
    }
    
    const itemIndex = cart.findIndex(item => item.name === name);
    
    if (itemIndex > -1) {
        const newQuantity = cart[itemIndex].quantity + change;
        
        if (newQuantity <= 0) {
            if (confirm(`Hapus ${cart[itemIndex].name} dari keranjang?`)) {
                cart.splice(itemIndex, 1);
                showNotification(`✗ ${name} dihapus`);
            }
        } else {
            cart[itemIndex].quantity = newQuantity;
            showNotification(`${change > 0 ? '✓' : '○'} ${name} ${change > 0 ? '+' : '-'}1 (${newQuantity}x)`);
        }
        
        saveCart();
        renderCart();
    }
}

function removeItem(name) {
    if (event) {
        event.stopPropagation();
    }
    
    const itemIndex = cart.findIndex(item => item.name === name);
    
    if (itemIndex > -1) {
        if (confirm(`Hapus ${cart[itemIndex].name} dari keranjang?`)) {
            cart.splice(itemIndex, 1);
            saveCart();
            renderCart();
            showNotification(`✗ ${name} dihapus`);
        }
    }
}

function clearCart() {
    if (cart.length === 0) return;
    
    if (confirm('Yakin ingin mengosongkan keranjang?')) {
        cart = [];
        saveCart();
        renderCart();
        showNotification('Keranjang dikosongkan');
    }
}

function renderCart() {
    const cartItemsElement = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');
    const totalItemsElement = document.getElementById('total-items');
    
    if (!cartItemsElement || !totalPriceElement) return;
    
    cartItemsElement.innerHTML = "";
    let total = 0;
    let totalItems = 0;
    
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
        return;
    }
    
    cart.forEach((item) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        totalItems += item.quantity;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${escapeHtml(item.name)}</div>
                <div class="cart-item-price">Rp ${item.price.toLocaleString('id-ID')}</div>
            </div>
            <div class="qty-control">
                <button class="qty-btn" onclick="updateQuantity('${escapeHtml(item.name)}', -1, event)">−</button>
                <span class="qty-value">${item.quantity}</span>
                <button class="qty-btn" onclick="updateQuantity('${escapeHtml(item.name)}', 1, event)">+</button>
            </div>
            <div class="item-total">Rp ${itemTotal.toLocaleString('id-ID')}</div>
            <button class="remove-item" onclick="removeItem('${escapeHtml(item.name)}', event)">✕</button>
        `;
        cartItemsElement.appendChild(cartItem);
    });
    
    totalPriceElement.innerText = "Rp " + total.toLocaleString('id-ID');
    if (totalItemsElement) totalItemsElement.innerText = totalItems;
}

function checkoutWhatsApp() {
    if (cart.length === 0) {
        showNotification('Keranjang masih kosong!', 'error');
        return;
    }
    
    const nomorWA = "6287730414635";
    let teks = "🍽️ *PESANAN WARUNG KAMIJORO* 🍽️\n\n";
    teks += "_Berikut detail pesanan saya:_\n\n";
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
    teks += `📦 *Catatan:*\n`;
    teks += `_Mohon dikonfirmasi, terima kasih!_ 🙏`;
    
    const url = `https://wa.me/${nomorWA}?text=${encodeURIComponent(teks)}`;
    showNotification('Mengarahkan ke WhatsApp...', 'success');
    setTimeout(() => window.open(url, '_blank'), 300);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function showNotification(message, type = 'success') {
    let notification = document.querySelector('.custom-notification');
    if (notification) notification.remove();
    
    notification = document.createElement('div');
    notification.className = `custom-notification ${type}`;
    notification.innerHTML = `<span>${message}</span>`;
    notification.style.cssText = `
        position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
        background: ${type === 'error' ? '#ff6b6b' : '#27ae60'};
        color: white; padding: 12px 24px; border-radius: 50px;
        font-size: 0.9rem; font-weight: 500; z-index: 1000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        max-width: 90%; text-align: center;
        pointer-events: none; font-family: 'Poppins', sans-serif;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification) notification.remove();
    }, 2000);
}

function getCartTotalItems() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function updateCartBadge() {
    const totalItems = getCartTotalItems();
    const cartLink = document.querySelector('.nav-links a[href="#cart-section"]');
    if (cartLink) {
        if (totalItems > 0) {
            let badge = cartLink.querySelector('.cart-badge');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'cart-badge';
                badge.style.cssText = `background: #e67e22; color: white; border-radius: 50%; padding: 2px 6px; font-size: 0.7rem; margin-left: 5px; display: inline-block;`;
                cartLink.appendChild(badge);
            }
            badge.textContent = totalItems;
        } else {
            const badge = cartLink.querySelector('.cart-badge');
            if (badge) badge.remove();
        }
    }
}

// Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    
    // Tombol clear cart
    const cartFooter = document.querySelector('.cart-footer');
    if (cartFooter && !document.querySelector('.btn-clear-cart')) {
        const clearBtn = document.createElement('button');
        clearBtn.textContent = '🗑️ Kosongkan Keranjang';
        clearBtn.className = 'btn-clear-cart';
        clearBtn.style.cssText = `background: #e74c3c; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; margin-top: 10px; width: 100%; font-size: 0.9rem; font-weight: 600;`;
        clearBtn.onclick = () => clearCart();
        cartFooter.appendChild(clearBtn);
    }
    
    const originalRender = renderCart;
    window.renderCart = function() {
        originalRender();
        updateCartBadge();
    };
    renderCart();
    
    // Mobile Menu Toggle
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => navLinks.classList.remove('active'));
        });
    }
    
    // Category Filter
    const categoryBtns = document.querySelectorAll('.category-btn');
    const menuCards = document.querySelectorAll('.menu-card');
    if (categoryBtns.length) {
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const category = btn.dataset.category;
                menuCards.forEach(card => {
                    if (category === 'all' || card.dataset.category === category) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }
    
    // Smooth Scroll - TAPI JANGAN TAMBAHKAN CLICK HANDLER YANG MEMICU addToCart
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
    
    // Validasi nama dan nomor WA
    if (!customerName) {
        showNotification('Mohon isi nama Anda terlebih dahulu!', 'error');
        document.getElementById('customerName')?.focus();
        return;
    }
    
    if (!customerPhone) {
        showNotification('Mohon isi nomor WhatsApp Anda!', 'error');
        document.getElementById('customerPhone')?.focus();
        return;
    }
    
    // Validasi nomor WA (minimal 10 digit)
    const phoneNumber = customerPhone.replace(/\D/g, '');
    if (phoneNumber.length < 10) {
        showNotification('Nomor WhatsApp tidak valid!', 'error');
        return;
    }
    
    const nomorWA = "6287730414635";
    
    let teks = "🍽️ *PESANAN WARUNG KAMIJORO* 🍽️\n\n";
    teks += `👤 *Nama:* ${customerName}\n`;
    teks += `📞 *No. WA:* ${customerPhone}\n`;
    if (customerAddress) teks += `📍 *Alamat:* ${customerAddress}\n`;
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
    
    if (customerNote) {
        teks += `📝 *Catatan:*\n`;
        teks += `${customerNote}\n\n`;
    }
    
    teks += `_Terima kasih! Pesanan akan segera diproses._ 🙏`;
    
    const url = `https://wa.me/${nomorWA}?text=${encodeURIComponent(teks)}`;
    showNotification('Mengarahkan ke WhatsApp...', 'success');
    
    setTimeout(() => {
        window.open(url, '_blank');
    }, 300);
}

// Toggle payment method details
function togglePaymentDetails() {
    const selectedPayment = document.querySelector('input[name="payment"]:checked').value;
    const transferInfo = document.getElementById('transfer-info');
    const qrisInfo = document.getElementById('qris-info');
    
    if (selectedPayment === 'transfer') {
        transferInfo.style.display = 'block';
        qrisInfo.style.display = 'none';
    } else if (selectedPayment === 'qris') {
        transferInfo.style.display = 'none';
        qrisInfo.style.display = 'block';
    } else {
        transferInfo.style.display = 'none';
        qrisInfo.style.display = 'none';
    }
}

// Update checkoutWhatsApp function
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
    let paymentMethod = '';
    let paymentDetail = '';
    
    if (selectedPayment) {
        const paymentValue = selectedPayment.value;
        switch(paymentValue) {
            case 'cash':
                paymentMethod = '💰 Bayar di Tempat (Cash)';
                paymentDetail = 'Bayar saat pesanan tiba';
                break;
            case 'transfer':
                paymentMethod = '🏦 Transfer Bank';
                paymentDetail = 'Transfer ke rekening BCA/Mandiri/BRI';
                break;
            case 'qris':
                paymentMethod = '📱 QRIS (Scan QRIS)';
                paymentDetail = 'Scan QRIS menggunakan DANA/OVO/GoPay';
                break;
            default:
                paymentMethod = '💰 Bayar di Tempat';
        }
    }
    
    // Validasi nama dan nomor WA
    if (!customerName) {
        showNotification('Mohon isi nama Anda terlebih dahulu!', 'error');
        document.getElementById('customerName')?.focus();
        return;
    }
    
    if (!customerPhone) {
        showNotification('Mohon isi nomor WhatsApp Anda!', 'error');
        document.getElementById('customerPhone')?.focus();
        return;
    }
    
    const nomorWA = "6287730414635";
    
    let teks = "🍽️ *PESANAN WARUNG KAMIJORO* 🍽️\n\n";
    teks += `👤 *Nama:* ${customerName}\n`;
    teks += `📞 *No. WA:* ${customerPhone}\n`;
    if (customerAddress) teks += `📍 *Alamat:* ${customerAddress}\n`;
    teks += `💳 *Metode Bayar:* ${paymentMethod}\n`;
    if (paymentDetail) teks += `   _${paymentDetail}_\n`;
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
    
    if (customerNote) {
        teks += `📝 *Catatan:*\n`;
        teks += `${customerNote}\n\n`;
    }
    
    teks += `_Terima kasih! Pesanan akan segera diproses._ 🙏`;
    
    const url = `https://wa.me/${nomorWA}?text=${encodeURIComponent(teks)}`;
    showNotification('Mengarahkan ke WhatsApp...', 'success');
    
    setTimeout(() => {
        window.open(url, '_blank');
    }, 300);
}

// Add event listener for payment method change
document.addEventListener('DOMContentLoaded', () => {
    // ... existing code ...
    
    // Payment method toggle
    const paymentRadios = document.querySelectorAll('input[name="payment"]');
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', togglePaymentDetails);
    });
    
    // Initial toggle
    togglePaymentDetails();
});

function renderCart() {
    const cartItemsElement = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');
    const totalItemsElement = document.getElementById('total-items');
    const qrisTotalAmount = document.getElementById('qris-total-amount');
    const nominalDisplay = document.getElementById('nominal-display');
    
    if (!cartItemsElement || !totalPriceElement) return;
    
    cartItemsElement.innerHTML = "";
    let total = 0;
    let totalItems = 0;
    
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
        
        // Update QRIS total
        if (qrisTotalAmount) qrisTotalAmount.innerText = "Rp 0";
        if (nominalDisplay) nominalDisplay.innerText = "Rp 0";
        return;
    }
    
    cart.forEach((item) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        totalItems += item.quantity;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${escapeHtml(item.name)}</div>
                <div class="cart-item-price">Rp ${item.price.toLocaleString('id-ID')}</div>
            </div>
            <div class="qty-control">
                <button class="qty-btn" onclick="updateQuantity('${escapeHtml(item.name)}', -1)">−</button>
                <span class="qty-value">${item.quantity}</span>
                <button class="qty-btn" onclick="updateQuantity('${escapeHtml(item.name)}', 1)">+</button>
            </div>
            <div class="item-total">Rp ${itemTotal.toLocaleString('id-ID')}</div>
            <button class="remove-item" onclick="removeItem('${escapeHtml(item.name)}')">✕</button>
        `;
        cartItemsElement.appendChild(cartItem);
    });
    
    totalPriceElement.innerText = "Rp " + total.toLocaleString('id-ID');
    if (totalItemsElement) totalItemsElement.innerText = totalItems;
    
    // Update QRIS total
    if (qrisTotalAmount) qrisTotalAmount.innerText = "Rp " + total.toLocaleString('id-ID');
    if (nominalDisplay) nominalDisplay.innerText = "Rp " + total.toLocaleString('id-ID');
}

// Tambahkan style animasi
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from { opacity: 0; transform: translateX(-50%) translateY(20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    .nav-links a.active { color: #e67e22; font-weight: 600; }
`;
document.head.appendChild(style);