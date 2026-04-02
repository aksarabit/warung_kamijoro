// Data Menu (sinkron dengan localStorage)
let menus = [];
let editingId = null;
let currentImageBase64 = null;

// ==================== INISIALISASI ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== ADMIN PANEL STARTED ===');
    loadData();
    initNavigation();
    initMobileMenu();
    initOrderFilter();
    initModalClickOutside();
});

// ==================== LOAD DATA ====================
function loadData() {
    try {
        const savedMenus = localStorage.getItem('warungKamijoroMenus');
        console.log('Loading data from localStorage:', savedMenus ? 'Data ditemukan' : 'Tidak ada data');
        
        if (savedMenus) {
            const parsedMenus = JSON.parse(savedMenus);
            if (Array.isArray(parsedMenus) && parsedMenus.length > 0) {
                menus = parsedMenus;
                console.log('Data loaded successfully:', menus.length, 'items');
            } else {
                console.log('Data kosong, menggunakan default');
                setDefaultMenus();
            }
        } else {
            console.log('No saved data, using defaults');
            setDefaultMenus();
        }
        
        renderMenuList();
        renderRecentMenu();
        updateDashboardStats();
        renderOrders();
        
    } catch (error) {
        console.error('Error in loadData:', error);
        setDefaultMenus();
    }
}

function setDefaultMenus() {
    menus = [
        { id: 1, name: 'Nasi Goreng Spesial', category: 'makanan', price: 20000, stock: 50, desc: 'Nasi goreng spesial', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', createdAt: Date.now() },
        { id: 2, name: 'Ayam Bakar Madu', category: 'makanan', price: 30000, stock: 40, desc: 'Ayam bakar madu', image: 'https://images.unsplash.com/photo-1596797038530-2c39fa81b487?w=400', createdAt: Date.now() },
        { id: 3, name: 'Sate Ayam', category: 'makanan', price: 25000, stock: 30, desc: 'Sate ayam', image: 'https://images.unsplash.com/photo-1563379091339-03b21a4a5a47?w=400', createdAt: Date.now() },
        { id: 4, name: 'Es Teh Manis', category: 'minuman', price: 5000, stock: 100, desc: 'Es teh manis', image: 'https://images.unsplash.com/photo-1563257012-2a8b9e4bc39a?w=400', createdAt: Date.now() }
    ];
    saveMenus();
}

function saveMenus() {
    try {
        if (!Array.isArray(menus)) {
            menus = [];
        }

    } catch (error) {
        console.error('Error saving menus:', error);
        return false;
    }
}

// ==================== FUNGSI GAMBAR ====================
function prependImage(input) {
    console.log('prependImage called');
    if (!input || !input.files || !input.files[0]) {
        console.log('No file selected');
        return;
    }
    
    const file = input.files[0];
    console.log('File selected:', file.name, file.size);
    
    if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran gambar terlalu besar! Maksimal 2MB.');
        input.value = '';
        return;
    }
    
    if (!file.type.match('image.*')) {
        alert('Hanya file gambar yang diperbolehkan!');
        input.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        currentImageBase64 = e.target.result;
        console.log('Image loaded to base64');
        
        const preview = document.getElementById('image-preview');
        const previewContainer = document.getElementById('image-preview-container');
        
        if (preview) preview.src = currentImageBase64;
        if (previewContainer) previewContainer.style.display = 'block';
        
        showNotification('Gambar siap digunakan!', 'success');
    };
    reader.onerror = function() {
        console.error('Error reading file');
        alert('Gagal membaca file gambar!');
    };
    reader.readAsDataURL(file);
}

function removeImage() {
    currentImageBase64 = null;
    const fileInput = document.getElementById('menu-image-file');
    const previewContainer = document.getElementById('image-preview-container');
    const preview = document.getElementById('image-preview');
    
    if (fileInput) fileInput.value = '';
    if (previewContainer) previewContainer.style.display = 'none';
    if (preview) preview.src = '';
    
    showNotification('Gambar dihapus', 'info');
}

// ==================== FUNGSI MODAL ====================
function openAddModal() {
    console.log('Open add modal');
    editingId = null;
    currentImageBase64 = null;
    
    // Reset semua form
    const elements = {
        'menu-name': '',
        'menu-category': 'makanan',
        'menu-price': '',
        'menu-stock': '99',
        'menu-desc': ''
    };
    
    for (const [id, value] of Object.entries(elements)) {
        const el = document.getElementById(id);
        if (el) el.value = value;
    }
    
    const previewContainer = document.getElementById('image-preview-container');
    const preview = document.getElementById('image-preview');
    const fileInput = document.getElementById('menu-image-file');
    const modal = document.getElementById('menuModal');
    const modalTitle = document.getElementById('modal-title');
    
    if (previewContainer) previewContainer.style.display = 'none';
    if (preview) preview.src = '';
    if (fileInput) fileInput.value = '';
    if (modalTitle) modalTitle.innerText = 'Tambah Menu';
    if (modal) modal.style.display = 'flex';
}

function editMenu(id) {
    console.log('Edit menu:', id);
    const menu = menus.find(m => m.id === id);
    if (!menu) {
        showNotification('Menu tidak ditemukan!', 'error');
        return;
    }
    
    editingId = id;
    currentImageBase64 = menu.image || null;
    
    // Isi form
    const nameInput = document.getElementById('menu-name');
    const categorySelect = document.getElementById('menu-category');
    const priceInput = document.getElementById('menu-price');
    const stockInput = document.getElementById('menu-stock');
    const descInput = document.getElementById('menu-desc');
    const modalTitle = document.getElementById('modal-title');
    const preview = document.getElementById('image-preview');
    const previewContainer = document.getElementById('image-preview-container');
    const modal = document.getElementById('menuModal');
    
    if (nameInput) nameInput.value = menu.name;
    if (categorySelect) categorySelect.value = menu.category;
    if (priceInput) priceInput.value = menu.price;
    if (stockInput) stockInput.value = menu.stock;
    if (descInput) descInput.value = menu.desc || '';
    if (modalTitle) modalTitle.innerText = 'Edit Menu';
    
    if (menu.image && preview) {
        preview.src = menu.image;
        if (previewContainer) previewContainer.style.display = 'block';
    } else {
        if (previewContainer) previewContainer.style.display = 'none';
    }
    
    if (modal) modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('menuModal');
    if (modal) modal.style.display = 'none';
}

// ==================== SAVE MENU - FIXED VERSION ====================
function saveMenu() {
    // Ambil nilai dari form
    const name = document.getElementById('menu-name').value;
    const category = document.getElementById('menu-category').value;
    const price = parseInt(document.getElementById('menu-price').value);
    const stock = parseInt(document.getElementById('menu-stock').value);
    const desc = document.getElementById('menu-desc').value;
    
    // Validasi
    if (!name) {
        alert('Nama menu harus diisi!');
        return;
    }
    
    if (!price) {
        alert('Harga harus diisi!');
        return;
    }
    
    // Siapkan gambar
    let image = currentImageBase64;
    if (!image) {
        image = 'https://via.placeholder.com/200x180?text=' + encodeURIComponent(name);
    }
    
    // Proses simpan
    if (editingId) {
        // Edit
        for (let i = 0; i < menus.length; i++) {
            if (menus[i].id === editingId) {
                menus[i].name = name;
                menus[i].category = category;
                menus[i].price = price;
                menus[i].stock = stock;
                menus[i].desc = desc;
                menus[i].image = image;
                break;
            }
        }
    } else {
        // Tambah baru
        menus.push({
            id: Date.now(),
            name: name,
            category: category,
            price: price,
            stock: stock,
            desc: desc,
            image: image
        });
    }
    
    // Simpan ke localStorage
    localStorage.setItem('warungKamijoroMenus', JSON.stringify(menus));
    
    // Refresh tampilan
    renderMenuList();
    renderRecentMenu();
    updateDashboardStats();
    
    // Tutup modal
    document.getElementById('menuModal').style.display = 'none';
    
    // Reset
    editingId = null;
    currentImageBase64 = null;
    
    // Notifikasi (hanya satu)
    showNotification('Menu berhasil disimpan!', 'success');
}

// ==================== DELETE MENU ====================
function deleteMenu(id) {
    console.log('Delete menu:', id);
    
    const menuToDelete = menus.find(m => m.id === id);
    if (!menuToDelete) {
        showNotification('Menu tidak ditemukan!', 'error');
        return;
    }
    
    if (confirm(`Yakin ingin menghapus "${menuToDelete.name}"?`)) {
        const beforeCount = menus.length;
        menus = menus.filter(m => m.id !== id);
        
        if (menus.length === beforeCount) {
            console.error('Delete failed!');
            showNotification('Gagal menghapus menu!', 'error');
            return;
        }
        
        saveMenus();
        renderMenuList();
        renderRecentMenu();
        updateDashboardStats();
        showNotification('Menu berhasil dihapus!', 'success');
        console.log('Delete successful, remaining:', menus.length);
    }
}

// ==================== RENDER FUNCTIONS ====================
function renderMenuList() {
    const tbody = document.getElementById('menu-list');
    if (!tbody) return;
    
    if (!menus || menus.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Belum ada menu</td></tr>';
        return;
    }
    
    tbody.innerHTML = menus.map((menu, index) => `
        <tr>
            <td>${index + 1}</td>
            <td><img src="${menu.image || 'https://via.placeholder.com/50'}" class="menu-image" onerror="this.src='https://via.placeholder.com/50'" style="width: 40px; height: 40px; object-fit: cover; border-radius: 5px;"></td>
            <td>${escapeHtml(menu.name)}</td>
            <td>${menu.category}</td>
            <td>Rp ${(menu.price || 0).toLocaleString('id-ID')}</td>
            <td>
                <span class="badge ${(menu.stock || 0) <= 0 ? 'badge-outstock' : (menu.stock || 0) < 10 ? 'badge-lowstock' : 'badge-stock'}">
                    ${(menu.stock || 0) <= 0 ? 'Habis' : (menu.stock || 0) + ' tersisa'}
                </span>
            </td>
            <td class="action-buttons">
                <button class="btn-edit" onclick="editMenu(${menu.id})">✏️ Edit</button>
                <button class="btn-delete" onclick="deleteMenu(${menu.id})">🗑️ Hapus</button>
            </td>
        </tr>
    `).join('');
}

function renderRecentMenu() {
    const tbody = document.getElementById('recent-menu-list');
    if (!tbody) return;
    
    if (!menus || menus.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Belum ada menu</td></tr>';
        return;
    }
    
    const recentMenus = [...menus].slice(-5).reverse();
    
    tbody.innerHTML = recentMenus.map(menu => `
        <tr>
            <td><img src="${menu.image || 'https://via.placeholder.com/50'}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 5px;"></td>
            <td>${escapeHtml(menu.name)}</td>
            <td>${menu.category}</td>
            <td>Rp ${(menu.price || 0).toLocaleString('id-ID')}</td>
            <td>${menu.stock || 0}</td>
            <td>
                <span class="badge ${(menu.stock || 0) <= 0 ? 'badge-outstock' : 'badge-stock'}">
                    ${(menu.stock || 0) <= 0 ? 'Habis' : 'Tersedia'}
                </span>
            </td>
        </tr>
    `).join('');
}

function updateDashboardStats() {
    const totalMenuEl = document.getElementById('total-menu');
    const outOfStockEl = document.getElementById('out-of-stock');
    
    if (totalMenuEl) totalMenuEl.innerText = menus.length || 0;
    if (outOfStockEl) outOfStockEl.innerText = menus.filter(m => (m.stock || 0) <= 0).length || 0;
    
    try {
        const orders = JSON.parse(localStorage.getItem('warungKamijoroOrders') || '[]');
        const today = new Date().toDateString();
        const todayOrders = Array.isArray(orders) ? orders.filter(o => new Date(o.date).toDateString() === today) : [];
        const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        
        const todayOrdersEl = document.getElementById('today-orders');
        const revenueEl = document.getElementById('revenue');
        
        if (todayOrdersEl) todayOrdersEl.innerText = todayOrders.length;
        if (revenueEl) revenueEl.innerText = 'Rp ' + todayRevenue.toLocaleString('id-ID');
    } catch (e) {
        console.error('Error updating stats:', e);
    }
}

function renderOrders() {
    const tbody = document.getElementById('orders-list');
    if (!tbody) return;
    
    try {
        let orders = JSON.parse(localStorage.getItem('warungKamijoroOrders') || '[]');
        if (!Array.isArray(orders)) orders = [];
        
        const filterSelect = document.getElementById('order-filter');
        const filter = filterSelect ? filterSelect.value : 'all';
        
        let filteredOrders = [...orders].reverse();
        if (filter !== 'all') {
            filteredOrders = filteredOrders.filter(o => o.status === filter);
        }
        
        if (filteredOrders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Belum ada pesanan</td></tr>';
            return;
        }
        
        tbody.innerHTML = filteredOrders.map((order, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${new Date(order.date).toLocaleString('id-ID')}</td>
                <td>${escapeHtml(order.customerName || 'Unknown')}</td>
                <td>${(order.items || []).map(i => `${i.name} x${i.quantity}`).join(', ')}</td>
                <td>Rp ${(order.total || 0).toLocaleString('id-ID')}</td>
                <td>
                    <span class="status-${order.status || 'pending'}">
                        ${order.status === 'done' ? 'Selesai' : order.status === 'process' ? 'Diproses' : 'Pending'}
                    </span>
                </td>
                <td>
                    <select onchange="updateOrderStatus(${order.id}, this.value)" class="filter-select">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="process" ${order.status === 'process' ? 'selected' : ''}>Diproses</option>
                        <option value="done" ${order.status === 'done' ? 'selected' : ''}>Selesai</option>
                    </select>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        console.error('Error rendering orders:', e);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Error loading orders</td></tr>';
    }
}

function updateOrderStatus(orderId, status) {
    try {
        let orders = JSON.parse(localStorage.getItem('warungKamijoroOrders') || '[]');
        if (!Array.isArray(orders)) orders = [];
        
        const orderIndex = orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
            orders[orderIndex].status = status;
            localStorage.setItem('warungKamijoroOrders', JSON.stringify(orders));
            renderOrders();
            updateDashboardStats();
            showNotification('Status pesanan diupdate!');
        }
    } catch (e) {
        console.error('Error updating order status:', e);
        showNotification('Gagal update status!', 'error');
    }
}

function saveSettings() {
    const storeName = document.getElementById('store-name');
    const whatsappNumber = document.getElementById('whatsapp-number');
    const storeAddress = document.getElementById('store-address');
    
    if (!storeName || !whatsappNumber || !storeAddress) return;
    
    const settings = { 
        storeName: storeName.value, 
        whatsappNumber: whatsappNumber.value, 
        storeAddress: storeAddress.value 
    };
    localStorage.setItem('warungKamijoroSettings', JSON.stringify(settings));
    showNotification('Pengaturan berhasil disimpan!');
}

function loadSettings() {
    try {
        const settings = JSON.parse(localStorage.getItem('warungKamijoroSettings') || '{}');
        const storeName = document.getElementById('store-name');
        const whatsappInput = document.getElementById('whatsapp-number');
        const addressInput = document.getElementById('store-address');
        
        if (storeName) storeName.value = settings.storeName || 'Warung Kamijoro';
        if (whatsappInput) whatsappInput.value = settings.whatsappNumber || '6281903478051';
        if (addressInput) addressInput.value = settings.storeAddress || 'Jl. Kamijoro No. 123, Yogyakarta';
    } catch (e) {
        console.error('Error loading settings:', e);
    }
}

function showNotification(message, type = 'success') {
    let notification = document.querySelector('.admin-notification');
    if (notification) notification.remove();
    
    notification = document.createElement('div');
    notification.className = 'admin-notification';
    notification.innerHTML = `<span>${message}</span>`;
    
    const colors = { success: '#27ae60', error: '#e74c3c', info: '#3498db' };
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${colors[type] || colors.success};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 1001;
        font-size: 0.9rem;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function initNavigation() {
    const menuItems = document.querySelectorAll('.sidebar-menu li');
    if (!menuItems.length) return;
    
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.getAttribute('data-page');
            if (!page) return;
            
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            const pages = ['dashboard', 'menu', 'orders', 'settings'];
            pages.forEach(p => {
                const pageElement = document.getElementById(`${p}-page`);
                if (pageElement) {
                    pageElement.style.display = p === page ? 'block' : 'none';
                }
            });
            
            const titles = { dashboard: 'Dashboard', menu: 'Kelola Menu', orders: 'Pesanan', settings: 'Pengaturan' };
            const pageTitle = document.getElementById('page-title');
            if (pageTitle) pageTitle.innerText = titles[page] || 'Dashboard';
            
            if (page === 'menu') renderMenuList();
            if (page === 'orders') renderOrders();
            if (page === 'settings') loadSettings();
            if (page === 'dashboard') updateDashboardStats();
        });
    });
}

function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }
}

function initOrderFilter() {
    const orderFilter = document.getElementById('order-filter');
    if (orderFilter) {
        orderFilter.addEventListener('change', renderOrders);
    }
}

function initModalClickOutside() {
    window.onclick = (e) => {
        const modal = document.getElementById('menuModal');
        if (e.target === modal) closeModal();
    };
}

// Debug function - ketik debugMenu() di console
function debugMenu() {
    console.log('=== DEBUG MENU ===');
    console.log('Total menus:', menus.length);
    console.log('Menus data:', menus);
    const saved = localStorage.getItem('warungKamijoroMenus');
    console.log('LocalStorage data:', saved);
    alert(`Total menu: ${menus.length} item\nCek console untuk detail`);
}