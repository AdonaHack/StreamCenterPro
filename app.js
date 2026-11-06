const API_URL = 'https://streamcenterpro.shop';
const WHATSAPP_NUMERO = "51922096440"; 

const authSection = document.getElementById('auth-section');
const clientDashboard = document.getElementById('client-dashboard');
const adminDashboard = document.getElementById('admin-dashboard');
const marketingDashboard = document.getElementById('marketing-dashboard'); 

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const btnShowLogin = document.getElementById('btn-show-login');
const btnShowRegister = document.getElementById('btn-show-register');

const btnCatalogo = document.getElementById('btn-catalogo');
const btnMisServicios = document.getElementById('btn-mis-servicios');
const btnPerfil = document.getElementById('btn-perfil');
const catalogoSection = document.getElementById('catalogo-section');
const misServiciosSection = document.getElementById('mis-servicios-section');
const miPerfilSection = document.getElementById('mi-perfil-section');
const dashboardTitle = document.getElementById('dashboard-title');

const avatarUpload = document.getElementById('avatar-upload');
const profileImgPreview = document.getElementById('profile-img-preview');
const formCambioPassword = document.getElementById('form-cambio-password');

const filtroMesInput = document.getElementById('filtro-mes');
const filtroTextoInput = document.getElementById('filtro-texto');
const btnMesAnt = document.getElementById('btn-mes-ant');
const btnMesSig = document.getElementById('btn-mes-sig');

const btnCarrito = document.getElementById('btn-carrito');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const closeCartBtn = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartBadge = document.getElementById('cart-badge');
const cartTotalPrice = document.getElementById('cart-total-price');
const btnPagar = document.getElementById('btn-pagar');

const modalVenta = document.getElementById('modal-venta');
const btnAbrirVenta = document.getElementById('btn-abrir-venta-manual');
const btnCerrarVenta = document.getElementById('cerrar-modal-venta');
const formVenta = document.getElementById('form-venta-manual');

let usuarioActual = {};
let carrito = [];
window.monitorData = []; 

const Toast = Swal.mixin({
    toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
    timerProgressBar: true, background: '#161821', color: '#fff'
});

btnShowLogin.addEventListener('click', () => {
    loginForm.classList.remove('hidden'); registerForm.classList.add('hidden');
    btnShowLogin.classList.add('active'); btnShowRegister.classList.remove('active');
});

btnShowRegister.addEventListener('click', () => {
    registerForm.classList.remove('hidden'); loginForm.classList.add('hidden');
    btnShowRegister.classList.add('active'); btnShowLogin.classList.remove('active');
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usuario = document.getElementById('reg-username').value;
    const numero = document.getElementById('reg-phone').value;
    const correo = document.getElementById('reg-email').value;
    const contrasena = document.getElementById('reg-password').value;

    try {
        const response = await fetch(`${API_URL}/registro`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, numero, correo, contrasena })
        });
        if (response.ok) {
            Swal.fire({ icon: 'success', title: '¡Bienvenido a Pro!', text: 'Tu cuenta ha sido creada exitosamente.', confirmButtonText: 'Iniciar Sesión' })
            .then(() => { btnShowLogin.click(); });
        } else { Toast.fire({ icon: 'error', title: 'Error al registrar la cuenta' }); }
    } catch (error) { console.error("Error:", error); }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const correo = document.getElementById('login-email').value;
    const contrasena = document.getElementById('login-password').value;
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Conectando...';
    submitBtn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, contrasena })
        });
        const data = await response.json();
        
        if (response.ok) {
            usuarioActual = data;
            authSection.classList.add('hidden');
            
            if (data.rol === 'ADMIN') {
                adminDashboard.classList.remove('hidden');
                clientDashboard.classList.add('hidden');
                if(marketingDashboard) marketingDashboard.classList.add('hidden');
                cargarBodegaAdmin();
                cargarMonitorCuentas();
                Toast.fire({ icon: 'success', title: `Bienvenido Administrador` });
            } 
            else if (data.rol === 'MARKETING') {
                if(marketingDashboard) marketingDashboard.classList.remove('hidden');
                adminDashboard.classList.add('hidden');
                clientDashboard.classList.add('hidden');
                cargarHistorialMarketing();
                Toast.fire({ icon: 'success', title: `Bienvenido Equipo Marketing` });
            }
            else {
                clientDashboard.classList.remove('hidden');
                adminDashboard.classList.add('hidden');
                if(marketingDashboard) marketingDashboard.classList.add('hidden');
                document.getElementById('profile-username').innerText = data.usuario || 'Usuario';
                document.getElementById('profile-email').value = data.correo || correo;
                document.getElementById('profile-phone').value = data.numero || 'Sin número';
                
                const fotoGuardada = localStorage.getItem(`avatar_${data.correo}`);
                if (fotoGuardada) profileImgPreview.src = fotoGuardada;
                else profileImgPreview.src = `https://ui-avatars.com/api/?name=${data.usuario}&background=161821&color=fff`;
                
                volverCatalogo();
                Toast.fire({ icon: 'success', title: `Hola de nuevo, ${data.usuario}` });
            }
        } else { Swal.fire({ icon: 'error', title: 'Acceso Denegado', text: 'El correo o la contraseña son incorrectos.' }); }
    } catch (error) { Toast.fire({ icon: 'error', title: 'Error de conexión con el servidor' });
    } finally { submitBtn.innerHTML = originalText; submitBtn.disabled = false; }
});

document.querySelectorAll('.logout-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        Swal.fire({
            title: '¿Cerrar sesión?', icon: 'question', showCancelButton: true,
            confirmButtonText: 'Sí, salir', cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                authSection.classList.remove('hidden'); 
                clientDashboard.classList.add('hidden');
                adminDashboard.classList.add('hidden'); 
                if(marketingDashboard) marketingDashboard.classList.add('hidden');
                loginForm.reset(); usuarioActual = {}; carrito = []; actualizarCarritoUI();
            }
        });
    });
});

// ===============================================
// LÓGICA DE MARKETING (CON IMAGEN)
// ===============================================
const formMarketing = document.getElementById('form-marketing');
if(formMarketing) {
    formMarketing.addEventListener('submit', async (e) => {
        e.preventDefault();
        const numOriginal = document.getElementById('mkt-numero').value;
        const mensaje = document.getElementById('mkt-mensaje').value;
        const urlImagen = document.getElementById('mkt-imagen').value.trim();
        
        const submitBtn = formMarketing.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        let numLimpio = numOriginal.replace(/\D/g,'');
        if(numLimpio.length === 9) numLimpio = "51" + numLimpio;

        // Anexar la imagen al final del mensaje si se proporcionó una
        let mensajeFinal = mensaje;
        if(urlImagen !== "") {
            mensajeFinal += `\n\nMira nuestras promociones aquí 👇:\n${urlImagen}`;
        }

        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Registrando...';
        submitBtn.disabled = true;

        try {
            const response = await fetch(`${API_URL}/marketing_enviar`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ numero: numLimpio, mensaje: mensajeFinal })
            });
            
            if(response.ok) {
                Toast.fire({ icon: 'success', title: 'Registrado en historial' });
                document.getElementById('mkt-numero').value = '';
                cargarHistorialMarketing();
                
                const waUrl = `https://wa.me/${numLimpio}?text=${encodeURIComponent(mensajeFinal)}`;
                window.open(waUrl, '_blank');
            } else { Toast.fire({ icon: 'error', title: 'Error al registrar' }); }
        } catch(err) {
            Toast.fire({ icon: 'error', title: 'Error de conexión' });
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

async function cargarHistorialMarketing() {
    const tableBody = document.getElementById('mkt-table-body');
    if(!tableBody) return;
    tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;"><i class="fa-solid fa-spinner fa-spin"></i> Cargando historial...</td></tr>';
    
    try {
        const response = await fetch(`${API_URL}/marketing_historial`);
        const data = await response.json();
        tableBody.innerHTML = '';
        
        if(data.length > 0) {
            data.forEach(item => {
                let msgCorto = item.mensaje.length > 40 ? item.mensaje.substring(0,40) + "..." : item.mensaje;
                let colorEst = "#9ba0b5";
                if(item.estado === "EXITOSA") colorEst = "#1DB954";
                if(item.estado === "SIN RESPUESTA") colorEst = "#f5a623";
                if(item.estado === "NO EXISTE") colorEst = "#e50914";

                tableBody.innerHTML += `
                    <tr>
                        <td style="font-size:12px; color:var(--text-muted);">${item.fecha}</td>
                        <td style="font-family:monospace; font-weight:bold; color:white;">${item.numero}</td>
                        <td style="font-size:12px; color:var(--text-muted);" title="${item.mensaje}">${msgCorto}</td>
                        <td style="color:${colorEst}; font-weight:bold; font-size:12px;">${item.estado}</td>
                        <td>
                            <select class="input-form" style="width:140px; padding:5px; font-size:11px;" onchange="actualizarEstadoMkt('${item.id}', this.value)">
                                <option value="">Actualizar...</option>
                                <option value="EXITOSA">✅ Exitosa</option>
                                <option value="SIN RESPUESTA">⏳ Sin Respuesta</option>
                                <option value="NO EXISTE">❌ No Existe</option>
                            </select>
                        </td>
                    </tr>
                `;
            });
        } else { tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#9ba0b5;">Aún no se han enviado mensajes.</td></tr>'; }
    } catch(e) { tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#e50914;">Error cargando historial</td></tr>'; }
}

window.actualizarEstadoMkt = async function(id, nuevoEstado) {
    if(!nuevoEstado) return;
    try {
        const response = await fetch(`${API_URL}/marketing_estado`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, estado: nuevoEstado })
        });
        if(response.ok) { Toast.fire({ icon: 'success', title: 'Estado actualizado' }); cargarHistorialMarketing(); } 
        else { Toast.fire({ icon: 'error', title: 'Error al actualizar' }); }
    } catch(err) { Toast.fire({ icon: 'error', title: 'Error de red' }); }
}

// ===============================================
// VENTA MANUAL EXTERNA (ADMIN)
// ===============================================
if(btnAbrirVenta) btnAbrirVenta.addEventListener('click', () => modalVenta.classList.add('show'));
if(btnCerrarVenta) btnCerrarVenta.addEventListener('click', () => modalVenta.classList.remove('show'));

if(formVenta) {
    formVenta.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = formVenta.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';
        submitBtn.disabled = true;
        
        const payload = {
            cliente: document.getElementById('vm-cliente').value,
            servicio: document.getElementById('vm-servicio').value,
            precio: document.getElementById('vm-precio').value,
            correo_matriz: document.getElementById('vm-correo-asig').value,
            perfil: document.getElementById('vm-perfil-asig').value,
            fecha_inicio: document.getElementById('vm-inicio').value,
            fecha_fin: document.getElementById('vm-fin').value
        };
        
        try {
            const response = await fetch(`${API_URL}/venta_manual`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if(response.ok) {
                Toast.fire({ icon: 'success', title: 'Venta externa guardada' });
                modalVenta.classList.remove('show');
                formVenta.reset();
                cargarMonitorCuentas(); 
                cargarBodegaAdmin(); 
            } else {
                Toast.fire({ icon: 'error', title: 'Error al guardar en el servidor' });
            }
        } catch(err) {
            Toast.fire({ icon: 'error', title: 'Error de conexión' });
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ===============================================
// LÓGICA DE STOCK DINÁMICO (CATÁLOGO CLIENTE)
// ===============================================
async function actualizarStockCatalogo() {
    try {
        const response = await fetch(`${API_URL}/stock_publico`);
        const data = await response.json();
        const btnCustom = document.getElementById('btn-netflix-custom');
        
        if (btnCustom && data.netflix_custom !== undefined) {
            if (data.netflix_custom <= 0) {
                btnCustom.innerHTML = 'Agotado';
                btnCustom.disabled = true;
                btnCustom.style.background = 'rgba(255,255,255,0.1)';
                btnCustom.style.cursor = 'not-allowed';
                btnCustom.style.color = '#9ba0b5';
                btnCustom.closest('.plan-item').style.opacity = '0.7';
            } else {
                btnCustom.innerHTML = 'Adquirir';
                btnCustom.disabled = false;
                btnCustom.style.background = '';
                btnCustom.style.cursor = 'pointer';
                btnCustom.style.color = 'white';
                btnCustom.closest('.plan-item').style.opacity = '1';
            }
        }
    } catch (error) {
        console.error("Error verificando stock de catálogo:", error);
    }
}

// ===============================================
// LÓGICA DEL PANEL ADMIN (BODEGA Y MONITOR)
// ===============================================
async function cargarBodegaAdmin() {
    const tableBody = document.getElementById('admin-table-body');
    const labelInversion = document.getElementById('admin-inversion');
    tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;"><i class="fa-solid fa-spinner fa-spin"></i> Cargando bodega...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/bodega_admin`);
        const data = await response.json();
        tableBody.innerHTML = '';
        
        if(data.inventario && data.inventario.length > 0) {
            data.inventario.forEach(item => {
                let badgeClass = 'dias-ok';
                let textDias = `${item.dias_restantes} días`;
                
                if (item.dias_restantes <= 0) { badgeClass = 'dias-warning'; textDias = 'Renovar YA'; } 
                else if (item.dias_restantes <= 5) { badgeClass = 'dias-warning'; textDias = `¡${item.dias_restantes} días!`; }

                const colorLibres = item.perfiles_libres > 0 ? '#1DB954' : '#e50914';

                tableBody.innerHTML += `
                    <tr>
                        <td style="font-weight: bold;">${item.plataforma}</td>
                        <td style="font-family:monospace; color:#3b82f6;">${item.correo_matriz}</td>
                        <td class="text-red">S/ ${item.costo.toFixed(2)}</td>
                        <td>${item.perfiles_totales}</td>
                        <td style="color:${colorLibres}; font-weight:bold; text-align:center;">${item.perfiles_libres}</td>
                        <td>${item.vence_display}</td>
                        <td><span class="badge-dias ${badgeClass}">${textDias}</span></td>
                    </tr>
                `;
            });
            labelInversion.innerText = `S/ ${data.total_inversion.toFixed(2)}`;
        } else { tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#9ba0b5;">Bodega vacía. Añade correos en Excel.</td></tr>'; }
    } catch (error) { tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#e50914;">Error al cargar la bodega.</td></tr>'; }
}

async function cargarMonitorCuentas() {
    const tableBody = document.getElementById('admin-monitor-body');
    tableBody.innerHTML = '<tr><td colspan="10" style="text-align:center;"><i class="fa-solid fa-spinner fa-spin"></i> Cargando monitor...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/monitor_admin`);
        window.monitorData = await response.json();
        
        const hoy = new Date();
        const mesActual = hoy.getFullYear() + "-" + String(hoy.getMonth() + 1).padStart(2, '0');
        if(filtroMesInput && !filtroMesInput.value) filtroMesInput.value = mesActual;
        
        renderMonitorTable();
    } catch (error) {
        tableBody.innerHTML = '<tr><td colspan="10" style="text-align:center; color:#e50914;">Error al cargar el monitor.</td></tr>';
    }
}

function cambiarMesFiltro(offset) {
    if(!filtroMesInput.value) return;
    if(filtroTextoInput) filtroTextoInput.value = ""; 
    
    let [year, month] = filtroMesInput.value.split('-');
    let d = new Date(year, parseInt(month) - 1 + offset, 1);
    let newYear = d.getFullYear();
    let newMonth = String(d.getMonth() + 1).padStart(2, '0');
    filtroMesInput.value = `${newYear}-${newMonth}`;
    renderMonitorTable();
}

if(btnMesAnt) btnMesAnt.addEventListener('click', () => cambiarMesFiltro(-1));
if(btnMesSig) btnMesSig.addEventListener('click', () => cambiarMesFiltro(1));
if(filtroMesInput) filtroMesInput.addEventListener('input', () => { if(filtroTextoInput) filtroTextoInput.value = ""; renderMonitorTable(); });

if(filtroTextoInput) {
    filtroTextoInput.addEventListener('input', () => {
        if(filtroTextoInput.value.length > 0 && filtroMesInput) {
            filtroMesInput.value = ""; 
        }
        renderMonitorTable();
    });
}

function renderMonitorTable() {
    const tableBody = document.getElementById('admin-monitor-body');
    const filtroMes = filtroMesInput ? filtroMesInput.value : ""; 
    const filtroTexto = filtroTextoInput ? filtroTextoInput.value.toLowerCase() : "";
    
    let ingresosTotales = 0;
    let costosTotales = 0;
    let gananciaTotal = 0;
    
    if(!tableBody) return;
    tableBody.innerHTML = '';
    
    const datosFiltrados = window.monitorData.filter(item => {
        if (filtroTexto) {
            const matchesUsuario = item.usuario.toLowerCase().includes(filtroTexto);
            const matchesCorreo = item.correo_asignado.toLowerCase().includes(filtroTexto);
            return matchesUsuario || matchesCorreo;
        }
        if (!filtroMes) return true; 
        if (!item.fecha_compra_filtro) return false;
        return item.fecha_compra_filtro.startsWith(filtroMes);
    });

    if(datosFiltrados.length > 0) {
        datosFiltrados.forEach(item => {
            let badgeClass = 'dias-ok';
            let textDias = `${item.dias_restantes} días`;
            
            if (item.estado !== 'ACTIVO') { badgeClass = ''; textDias = 'Pendiente'; } 
            else if (item.dias_restantes <= 0) { badgeClass = 'dias-warning'; textDias = 'Cortar'; } 
            else if (item.dias_restantes <= 3) { badgeClass = 'dias-warning'; textDias = `¡${item.dias_restantes} días!`; }

            ingresosTotales += item.ingreso;
            costosTotales += item.costo_perfil;
            gananciaTotal += item.ganancia;

            const fechaC = item.fecha_compra_display || '---';

            tableBody.innerHTML += `
                <tr>
                    <td><strong style="color:white;">${item.usuario}</strong></td>
                    <td style="color:var(--text-muted); font-size:12px;">${item.servicio}</td>
                    <td style="font-size:12px;">${fechaC}</td>
                    <td style="font-family:monospace; color:#3b82f6;">${item.correo_asignado}</td>
                    <td style="color:#f5a623; font-weight:bold; text-align:center;">${item.perfil}</td>
                    <td style="color:#3b82f6;">S/ ${item.ingreso.toFixed(2)}</td>
                    <td class="text-red">S/ ${item.costo_perfil.toFixed(2)}</td>
                    <td class="text-green" style="font-weight:bold;">S/ ${item.ganancia.toFixed(2)}</td>
                    <td>${item.vencimiento}</td>
                    <td><span class="badge-dias ${badgeClass}">${textDias}</span></td>
                </tr>
            `;
        });
    } else { tableBody.innerHTML = '<tr><td colspan="10" style="text-align:center; color:#9ba0b5;">No se encontraron resultados.</td></tr>'; }
    
    if(document.getElementById('monitor-ingresos')) document.getElementById('monitor-ingresos').innerText = `S/ ${ingresosTotales.toFixed(2)}`;
    if(document.getElementById('monitor-costos')) document.getElementById('monitor-costos').innerText = `S/ ${costosTotales.toFixed(2)}`;
    if(document.getElementById('monitor-ganancia')) document.getElementById('monitor-ganancia').innerText = `S/ ${gananciaTotal.toFixed(2)}`;
}

// ===============================================
// NAVEGACIÓN Y LÓGICA DEL CLIENTE
// ===============================================
if(btnPerfil) btnPerfil.addEventListener('click', () => {
    catalogoSection.classList.add('hidden'); misServiciosSection.classList.add('hidden'); miPerfilSection.classList.remove('hidden');
    dashboardTitle.innerText = 'Mi Perfil'; btnPerfil.classList.add('hidden'); btnMisServicios.classList.remove('hidden'); btnCatalogo.classList.remove('hidden');
});
if(btnMisServicios) btnMisServicios.addEventListener('click', () => {
    catalogoSection.classList.add('hidden'); miPerfilSection.classList.add('hidden'); misServiciosSection.classList.remove('hidden');
    dashboardTitle.innerText = 'Mis Servicios'; btnMisServicios.classList.add('hidden'); btnPerfil.classList.remove('hidden'); btnCatalogo.classList.remove('hidden');
    cargarMisServicios();
});
if(btnCatalogo) btnCatalogo.addEventListener('click', volverCatalogo);

function volverCatalogo() {
    miPerfilSection.classList.add('hidden'); misServiciosSection.classList.add('hidden'); catalogoSection.classList.remove('hidden');
    dashboardTitle.innerText = 'Catálogo Stream Center Pro'; btnCatalogo.classList.add('hidden'); btnPerfil.classList.remove('hidden'); btnMisServicios.classList.remove('hidden');
    actualizarStockCatalogo(); 
}

if(avatarUpload) {
    avatarUpload.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const base64Image = e.target.result; profileImgPreview.src = base64Image;
                localStorage.setItem(`avatar_${usuarioActual.correo}`, base64Image); Toast.fire({ icon: 'success', title: 'Foto de perfil actualizada' });
            }
            reader.readAsDataURL(file);
        }
    });
}

if(formCambioPassword) {
    formCambioPassword.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nuevaContrasena = document.getElementById('new-password').value;
        const submitBtn = formCambioPassword.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Actualizando...'; submitBtn.disabled = true;

        try {
            const response = await fetch(`${API_URL}/actualizar_password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ correo: usuarioActual.correo, nueva_contrasena: nuevaContrasena }) });
            const data = await response.json();
            if (response.ok) { Swal.fire({ icon: 'success', title: '¡Éxito!', text: 'Tu contraseña ha sido actualizada.' }); document.getElementById('new-password').value = ''; } 
            else { Swal.fire({ icon: 'error', title: 'Error', text: data.error }); }
        } catch (error) { console.error(error); } finally { submitBtn.innerHTML = 'Actualizar Contraseña'; submitBtn.disabled = false; }
    });
}

async function cargarMisServicios() {
    const grid = document.getElementById('servicios-grid');
    if(!grid) return;
    grid.innerHTML = '<div style="text-align:center; width:100%; color:#9ba0b5; padding: 40px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 30px;"></i><p>Sincronizando con el servidor...</p></div>';
    try {
        const response = await fetch(`${API_URL}/mis_servicios`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ correo: usuarioActual.correo }) });
        const data = await response.json(); grid.innerHTML = ''; let serviciosActivos = 0;
        if(data.length > 0) {
            data.forEach(item => {
                if (item.dias_restantes > 0) {
                    serviciosActivos++;
                    const badgeClass = item.dias_restantes <= 1 ? 'dias-warning' : 'dias-ok';
                    const badgeText = item.dias_restantes === 1 ? '¡1 día restante!' : `${item.dias_restantes} días`;
                    const estadoColor = item.estado === 'ACTIVO' ? '#1DB954' : '#f5a623';
                    const nombreCorto = item.detalle.split(' (')[0]; 
                    const esPerfil = item.detalle.toLowerCase().includes("perfil");

                    grid.innerHTML += `
                        <div class="platform-card glass-panel servicio-card" ${item.dias_restantes <= 1 ? 'style="border-color: rgba(229, 9, 20, 0.5);"' : ''}>
                            <div class="servicio-header"><span class="servicio-title">${nombreCorto}</span><span class="badge-dias ${badgeClass}">${badgeText}</span></div>
                            <div style="margin-bottom: 15px;"><span style="font-size:12px; color:var(--text-muted);">${item.detalle}</span><br><span style="font-size:12px; color:${estadoColor}; font-weight:bold;">Estado: ${item.estado}</span><br><span style="font-size:12px; color:var(--text-muted);">Vence el: <strong style="color:white;">${item.fecha_fin}</strong></span></div>
                            <div class="credencial-box"><div><span class="cred-label">Correo</span><span class="cred-value" id="email-${item.id}">${item.correo_cuenta}</span></div><button class="copy-btn" onclick="copiarTexto('email-${item.id}')" title="Copiar"><i class="fa-regular fa-copy"></i></button></div>
                            <div class="credencial-box"><div><span class="cred-label">Contraseña</span><span class="cred-value" id="pass-${item.id}">${item.pass_cuenta}</span></div><button class="copy-btn" onclick="copiarTexto('pass-${item.id}')" title="Copiar"><i class="fa-regular fa-copy"></i></button></div>
                            <div class="credencial-box" style="margin-bottom: 15px;"><div><span class="cred-label">Perfil Asignado</span><span class="cred-value" style="color: #f5a623; font-weight: bold;">${item.perfil_cuenta}</span></div></div>
                            ${esPerfil ? `<div style="background: rgba(229, 9, 20, 0.1); border-left: 3px solid #e50914; padding: 10px; border-radius: 4px; margin-bottom: 15px;"><span style="font-size: 10px; font-weight: bold; color: #e50914; text-transform: uppercase;">⚠️ Reglas de Uso Estricto</span><ul style="margin: 5px 0 0 0; padding-left: 15px; font-size: 11px; color: var(--text-muted);"><li>Uso exclusivo para <strong>1 solo dispositivo</strong>.</li><li>Prohibido cambiar la contraseña o crear perfiles nuevos.</li><li>Prohibido entrar a otros perfiles que no sean el asignado.</li><li style="color: white;">El incumplimiento anulará la garantía sin derecho a reembolso.</li></ul></div>` : ''}
                            ${item.dias_restantes <= 1 ? `<button class="red-btn w-100" style="margin-top:10px; padding:12px; font-size:13px;" onclick="window.open('https://wa.me/${WHATSAPP_NUMERO}?text=Hola,%20deseo%20renovar%20mi%20cuenta%20de%20${nombreCorto}', '_blank')"><i class="fa-brands fa-whatsapp"></i> Renovar Suscripción</button>` : ''}
                        </div>`;
                }
            });
        } 
        if (serviciosActivos === 0) { grid.innerHTML = `<div style="text-align:center; width:100%; color:#9ba0b5; padding: 60px 20px;"><i class="fa-solid fa-ghost" style="font-size: 50px; margin-bottom: 15px; opacity: 0.5;"></i><p style="font-size: 16px; margin:0;">No tienes cuentas activas en este momento.</p><p style="font-size: 12px; opacity: 0.7; margin-top: 5px;">Las cuentas vencidas se eliminan de este panel por seguridad.</p></div>`; }
    } catch (error) { grid.innerHTML = '<div style="text-align:center; color:#e50914; width:100%; padding: 40px;">Error de conexión con el servidor.</div>'; }
}

window.copiarTexto = function(elementId) {
    const texto = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(texto).then(() => { Toast.fire({ icon: 'success', title: 'Copiado al portapapeles' }); });
}

if(btnCarrito) btnCarrito.addEventListener('click', () => { cartSidebar.classList.add('open'); cartOverlay.classList.add('show'); });
function cerrarCarrito() { cartSidebar.classList.remove('open'); cartOverlay.classList.remove('show'); }
if(closeCartBtn) closeCartBtn.addEventListener('click', cerrarCarrito); 
if(cartOverlay) cartOverlay.addEventListener('click', cerrarCarrito);

document.querySelectorAll('.buy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        if(e.target.id === 'btn-netflix-custom' && e.target.innerHTML === 'Agotado') return;
        
        const planItem = e.target.closest('.plan-item'); const card = e.target.closest('.platform-card');
        const plataforma = card.getAttribute('data-plataforma'); const plan = planItem.getAttribute('data-plan'); const precio = parseFloat(planItem.getAttribute('data-precio'));
        carrito.push({ plataforma, plan, precio }); actualizarCarritoUI();
        const originalText = e.target.innerHTML; e.target.innerHTML = '<i class="fa-solid fa-check"></i> ¡Añadido!'; e.target.style.background = "linear-gradient(135deg, #1DB954, #14833b)";
        Toast.fire({ icon: 'success', title: `${plataforma} añadido al carrito` });
        setTimeout(() => { e.target.innerHTML = originalText; e.target.style.background = ""; }, 1500);
    });
});

window.eliminarItem = function(index) { carrito.splice(index, 1); actualizarCarritoUI(); }
function actualizarCarritoUI() {
    if(!cartBadge || !cartItemsContainer) return;
    cartBadge.innerText = carrito.length; cartItemsContainer.innerHTML = ''; let total = 0;
    if(carrito.length === 0) { cartItemsContainer.innerHTML = `<div style="text-align:center; padding-top:40px; color: #9ba0b5;"><i class="fa-solid fa-cart-arrow-down" style="font-size:40px; margin-bottom:15px; opacity:0.5;"></i><p>Tu carrito está vacío</p></div>`; } 
    else { carrito.forEach((item, index) => { total += item.precio; cartItemsContainer.innerHTML += `<div class="cart-item"><div class="cart-item-details"><span class="cart-item-title">${item.plataforma}</span><span style="font-size:12px; color:#9ba0b5;">${item.plan}</span><span class="cart-item-price">S/ ${item.precio.toFixed(2)}</span></div><button class="cart-item-remove" onclick="eliminarItem(${index})"><i class="fa-solid fa-trash"></i></button></div>`; }); }
    if(cartTotalPrice) cartTotalPrice.innerText = `S/ ${total.toFixed(2)}`;
}

if(btnPagar) {
    btnPagar.addEventListener('click', async () => {
        if(carrito.length === 0) { Swal.fire({ icon: 'warning', title: 'Carrito vacío', text: 'Agrega al menos un servicio para continuar.' }); return; }
        const originalText = btnPagar.innerHTML; btnPagar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Procesando tu orden...'; btnPagar.disabled = true;
        const detallesCarrito = carrito.map(item => `${item.plataforma} (${item.plan})`).join(" | "); const totalStr = cartTotalPrice.innerText;
        try {
            const response = await fetch(`${API_URL}/procesar_whatsapp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ correo: usuarioActual.correo, usuario: usuarioActual.usuario, carrito_texto: detallesCarrito, total: totalStr }) });
            const data = await response.json();
            if (response.ok) {
                let mensajeText = `¡Hola! Vengo de Stream Center Pro y quiero completar mi pedido:%0A%0A`;
                carrito.forEach(item => { mensajeText += `📌 *${item.plataforma}* - ${item.plan} (S/ ${item.precio.toFixed(2)})%0A`; });
                mensajeText += `%0A💰 *Total a pagar:* ${totalStr}%0A🆔 *ID del Pedido:* ${data.pedido_id}%0A👤 *Usuario:* ${usuarioActual.usuario} (${usuarioActual.correo})`;
                carrito = []; actualizarCarritoUI(); cerrarCarrito();
                Swal.fire({ icon: 'success', title: '¡Pedido Generado!', text: 'Te redirigiremos a WhatsApp para completar el pago.', timer: 2500, showConfirmButton: false }).then(() => { window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=${mensajeText}`, '_blank'); });
            } else { Swal.fire({ icon: 'error', title: 'Ups...', text: data.error || "Hubo un error al generar el pedido" }); }
        } catch (error) { Swal.fire({ icon: 'error', title: 'Error de Red', text: 'Revisa tu conexión a internet e intenta de nuevo.' }); } 
        finally { btnPagar.innerHTML = originalText; btnPagar.disabled = false; }
    });
}
