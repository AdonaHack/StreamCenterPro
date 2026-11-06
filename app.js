const API_URL = 'https://streamcenterpro.onrender.com';

let currentUser = JSON.parse(localStorage.getItem('scpro_user')) || null;
let carrito = JSON.parse(localStorage.getItem('scpro_cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    initUI();
    if (currentUser) {
        enrutarUsuario(currentUser.rol);
    }
});

function initUI() {
    // Toggles Auth
    const btnShowLogin = document.getElementById('btn-show-login');
    const btnShowReg = document.getElementById('btn-show-register');
    const loginForm = document.getElementById('login-form');
    const regForm = document.getElementById('register-form');

    if(btnShowLogin && btnShowReg) {
        btnShowLogin.addEventListener('click', () => {
            loginForm.classList.remove('hidden');
            regForm.classList.add('hidden');
            btnShowLogin.classList.add('active');
            btnShowReg.classList.remove('active');
        });
        btnShowReg.addEventListener('click', () => {
            regForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
            btnShowReg.classList.add('active');
            btnShowLogin.classList.remove('active');
        });
    }

    // Forms Auth
    if(loginForm) loginForm.addEventListener('submit', handleLogin);
    if(regForm) regForm.addEventListener('submit', handleRegister);

    // Logout
    document.querySelectorAll('.logout-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            localStorage.removeItem('scpro_user');
            currentUser = null;
            window.location.reload();
        });
    });

    // Menú Cliente
    const btnCatalogo = document.getElementById('btn-catalogo');
    const btnMisServicios = document.getElementById('btn-mis-servicios');
    const btnPerfil = document.getElementById('btn-perfil');
    
    if(btnCatalogo) btnCatalogo.addEventListener('click', () => showClientSection('catalogo'));
    if(btnMisServicios) btnMisServicios.addEventListener('click', () => {
        showClientSection('servicios');
        cargarMisServicios();
    });
    if(btnPerfil) btnPerfil.addEventListener('click', () => {
        showClientSection('perfil');
        cargarDatosPerfil();
    });

    // Carrito
    const btnCarrito = document.getElementById('btn-carrito');
    const closeCart = document.getElementById('close-cart');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const btnPagar = document.getElementById('btn-pagar');

    if(btnCarrito) btnCarrito.addEventListener('click', () => {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
        renderizarCarrito();
    });
    const cerrarCarrito = () => {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
    };
    if(closeCart) closeCart.addEventListener('click', cerrarCarrito);
    if(cartOverlay) cartOverlay.addEventListener('click', cerrarCarrito);
    if(btnPagar) btnPagar.addEventListener('click', procesarPago);

    // Botones Comprar
    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.platform-card');
            const item = e.target.closest('.plan-item');
            const plataforma = card.dataset.plataforma;
            const plan = item.dataset.plan;
            const precio = parseFloat(item.dataset.precio);
            agregarAlCarrito(plataforma, plan, precio);
        });
    });

    // Admin - Modal Venta Manual
    const btnAbrirModal = document.getElementById('btn-abrir-venta-manual');
    const btnCerrarModal = document.getElementById('cerrar-modal-venta');
    const modalVenta = document.getElementById('modal-venta');
    const formVenta = document.getElementById('form-venta-manual');

    if(btnAbrirModal) btnAbrirModal.addEventListener('click', () => modalVenta.style.display = 'block');
    if(btnCerrarModal) btnCerrarModal.addEventListener('click', () => modalVenta.style.display = 'none');
    if(formVenta) formVenta.addEventListener('submit', handleVentaManual);

    // Marketing Form
    const formMkt = document.getElementById('form-marketing');
    if(formMkt) formMkt.addEventListener('submit', handleMarketing);

    // Update Password
    const formPass = document.getElementById('form-cambio-password');
    if(formPass) formPass.addEventListener('submit', handleUpdatePassword);

    actualizarBadge();
    if(modalVenta) modalVenta.style.display = 'none';
}

function enrutarUsuario(rol) {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
    document.getElementById('marketing-dashboard').classList.add('hidden');
    document.getElementById('client-dashboard').classList.add('hidden');

    if (rol === 'ADMIN') {
        document.getElementById('admin-dashboard').classList.remove('hidden');
        cargarAdminBodega();
        cargarAdminMonitor();
    } else if (rol === 'MARKETING') {
        document.getElementById('marketing-dashboard').classList.remove('hidden');
        cargarHistorialMarketing();
    } else {
        document.getElementById('client-dashboard').classList.remove('hidden');
        showClientSection('catalogo');
    }
}

// === AUTH ===
async function handleLogin(e) {
    e.preventDefault();
    const correo = document.getElementById('login-email').value;
    const contrasena = document.getElementById('login-password').value;

    try {
        Swal.fire({ title: 'Verificando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, contrasena })
        });
        const data = await res.json();
        
        if (res.ok) {
            currentUser = data;
            localStorage.setItem('scpro_user', JSON.stringify(data));
            Swal.close();
            enrutarUsuario(data.rol);
        } else {
            Swal.fire('Error', data.error || 'Credenciales incorrectas', 'error');
        }
    } catch (err) {
        Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const usuario = document.getElementById('reg-username').value;
    const numero = document.getElementById('reg-phone').value;
    const correo = document.getElementById('reg-email').value;
    const contrasena = document.getElementById('reg-password').value;

    try {
        Swal.fire({ title: 'Registrando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        const res = await fetch(`${API_URL}/registro`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, correo, numero, contrasena })
        });
        
        if (res.ok) {
            Swal.fire('¡Éxito!', 'Cuenta creada correctamente. Ahora inicia sesión.', 'success');
            document.getElementById('btn-show-login').click();
        } else {
            const data = await res.json();
            Swal.fire('Error', data.error || 'No se pudo registrar', 'error');
        }
    } catch (err) {
        Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
    }
}

// === CLIENTE ===
function showClientSection(section) {
    document.getElementById('catalogo-section').classList.add('hidden');
    document.getElementById('mis-servicios-section').classList.add('hidden');
    document.getElementById('mi-perfil-section').classList.add('hidden');
    
    document.getElementById('btn-catalogo').classList.add('hidden');
    document.getElementById('btn-mis-servicios').classList.remove('hidden');
    
    const title = document.getElementById('dashboard-title');

    if (section === 'catalogo') {
        document.getElementById('catalogo-section').classList.remove('hidden');
        title.innerHTML = 'Catálogo Stream Center Pro';
    } else if (section === 'servicios') {
        document.getElementById('mis-servicios-section').classList.remove('hidden');
        document.getElementById('btn-
