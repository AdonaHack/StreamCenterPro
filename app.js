const API_URL = '';

let currentUser = JSON.parse(localStorage.getItem('scpro_user')) || null;
let carrito = JSON.parse(localStorage.getItem('scpro_cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    initUI();
    if (currentUser) {
        enrutarUsuario(currentUser.rol);
    }
});

function initUI() {
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

    if(loginForm) loginForm.addEventListener('submit', handleLogin);
    if(regForm) regForm.addEventListener('submit', handleRegister);

    document.querySelectorAll('.logout-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            localStorage.removeItem('scpro_user');
            currentUser = null;
            window.location.reload();
        });
    });

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

    const btnAbrirModal = document.getElementById('btn-abrir-venta-manual');
    const btnCerrarModal = document.getElementById('cerrar-modal-venta');
    const modalVenta = document.getElementById('modal-venta');
    const formVenta = document.getElementById('form-venta-manual');

    if(btnAbrirModal) btnAbrirModal.addEventListener('click', () => modalVenta.style.display = 'block');
    if(btnCerrarModal) btnCerrarModal.addEventListener('click', () => modalVenta.style.display = 'none');
    if(formVenta) formVenta.addEventListener('submit', handleVentaManual);

    const formMkt = document.getElementById('form-marketing');
    if(formMkt) formMkt.addEventListener('submit', handleMarketing);

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
        document.getElementById('btn-catalogo').classList.remove('hidden');
        document.getElementById('btn-mis-servicios').classList.add('hidden');
        title.innerHTML = 'Mis Servicios Activos';
    } else if (section === 'perfil') {
        document.getElementById('mi-perfil-section').classList.remove('hidden');
        document.getElementById('btn-catalogo').classList.remove('hidden');
        title.innerHTML = 'Mi Perfil';
    }
}

function agregarAlCarrito(plataforma, plan, precio) {
    carrito.push({ id: Date.now(), plataforma, plan, precio });
    guardarCarrito();
    Swal.fire({
        title: 'Agregado al carrito',
        text: `${plataforma} - ${plan}`,
        icon: 'success',
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 2000
    });
}

function guardarCarrito() {
    localStorage.setItem('scpro_cart', JSON.stringify(carrito));
    actualizarBadge();
    renderizarCarrito();
}

function actualizarBadge() {
    const badge = document.getElementById('cart-badge');
    if (badge) badge.textContent = carrito.length;
}

function renderizarCarrito() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total-price');
    if (!container || !totalEl) return;

    container.innerHTML = '';
    let total = 0;

    if (carrito.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:20px; color:gray;">Tu carrito está vacío</p>';
    } else {
        carrito.forEach((item, index) => {
            total += item.precio;
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <div>
                    <strong>${item.plataforma}</strong><br>
                    <small>${item.plan}</small>
                </div>
                <div style="text-align:right;">
                    <div style="color:#1DB954; font-weight:bold;">S/ ${item.precio.toFixed(2)}</div>
                    <i class="fa-solid fa-trash text-red" style="cursor:pointer; margin-top:5px;" onclick="eliminarDelCarrito(${index})"></i>
                </div>
            `;
            container.appendChild(div);
        });
    }
    totalEl.textContent = `S/ ${total.toFixed(2)}`;
}

window.eliminarDelCarrito = function(index) {
    carrito.splice(index, 1);
    guardarCarrito();
};

async function procesarPago() {
    if (carrito.length === 0) return Swal.fire('Carrito Vacío', 'Agrega algún plan primero', 'warning');
    if (!currentUser) return Swal.fire('Error', 'Debes iniciar sesión', 'error');

    let total = 0;
    let detalles = carrito.map(c => {
        total += c.precio;
        return `${c.plataforma} (${c.plan}) - S/ ${c.precio.toFixed(2)}`;
    }).join('\n');

    Swal.fire({ title: 'Generando pedido...', didOpen: () => Swal.showLoading() });

    try {
        const res = await fetch(`${API_URL}/procesar_whatsapp`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                correo: currentUser.correo,
                usuario: currentUser.usuario,
                carrito_texto: detalles,
                total: total.toFixed(2)
            })
        });
        const data = await res.json();

        if (res.ok) {
            carrito = [];
            guardarCarrito();
            document.getElementById('close-cart').click();
            Swal.close();
            
            let numAdmin = "51922096440";
            let msg = `*NUEVO PEDIDO SC-PRO* 🎬\n\n*Cliente:* ${currentUser.usuario}\n*Correo:* ${currentUser.correo}\n\n*Servicios:*\n${detalles}\n\n*Total a pagar:* S/ ${total.toFixed(2)}\n*Código:* ${data.pedido_id}\n\n_Deseo realizar el pago mediante Yape/Plin_`;
            window.open(`https://wa.me/${numAdmin}?text=${encodeURIComponent(msg)}`, '_blank');
            
            setTimeout(() => {
                document.getElementById('btn-mis-servicios').click();
            }, 1000);
        } else {
            Swal.fire('Error', 'No se pudo procesar el pedido', 'error');
        }
    } catch (err) {
        Swal.fire('Error', 'Problema de conexión', 'error');
    }
}

async function cargarMisServicios() {
    const grid = document.getElementById('servicios-grid');
    grid.innerHTML = '<p style="text-align:center; width:100%; color:gray;">Cargando servicios...</p>';
    
    try {
        const res = await fetch(`${API_URL}/mis_servicios`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo: currentUser.correo })
        });
        const data = await res.json();
        
        grid.innerHTML = '';
        if (data.length === 0) {
            grid.innerHTML = '<p style="text-align:center; width:100%; color:gray;">No tienes servicios activos o pendientes.</p>';
            return;
        }

        data.forEach(srv => {
            const isActivo = srv.estado.toUpperCase() === 'ACTIVO';
            let colorClase = isActivo ? 'text-green' : 'text-red';
            
            grid.innerHTML += `
                <div class="glass-panel" style="padding:20px; border-radius:15px; position:relative; overflow:hidden;">
                    <div style="position:absolute; top:0; right:0; background:${isActivo ? '#1DB954' : '#e50914'}; color:white; padding:5px 15px; font-size:11px; border-bottom-left-radius:10px; font-weight:bold;">
                        ${srv.estado.toUpperCase()}
                    </div>
                    <h4 style="margin-top:10px; margin-bottom:15px; color:white; border-bottom:1px solid #333; padding-bottom:10px;">${srv.detalle.replace(/\n/g, '<br>')}</h4>
                    
                    <div style="display:grid; grid-template-columns: 1fr; gap:10px; font-size:13px; color:#aaa;">
                        <div style="background:rgba(0,0,0,0.3); padding:10px; border-radius:8px;">
                            <span style="display:block; font-size:11px; color:#666;">CORREO DE INGRESO</span>
                            <span style="color:white;">${srv.correo_cuenta}</span>
                        </div>
                        <div style="background:rgba(0,0,0,0.3); padding:10px; border-radius:8px;">
                            <span style="display:block; font-size:11px; color:#666;">CONTRASEÑA</span>
                            <span style="color:white;">${srv.pass_cuenta}</span>
                        </div>
                        <div style="display:flex; gap:10px;">
                            <div style="background:rgba(0,0,0,0.3); padding:10px; border-radius:8px; flex:1;">
                                <span style="display:block; font-size:11px; color:#666;">PERFIL/PIN</span>
                                <span style="color:#3b82f6; font-weight:bold;">${srv.perfil_cuenta}</span>
                            </div>
                            <div style="background:rgba(0,0,0,0.3); padding:10px; border-radius:8px; flex:1;">
                                <span style="display:block; font-size:11px; color:#666;">VENCIMIENTO</span>
                                <span class="${colorClase}" style="font-weight:bold;">${srv.fecha_fin}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (err) {
        grid.innerHTML = '<p style="text-align:center; width:100%; color:red;">Error al cargar servicios.</p>';
    }
}

function cargarDatosPerfil() {
    if(!currentUser) return;
    document.getElementById('profile-username').textContent = currentUser.usuario;
    document.getElementById('profile-email').value = currentUser.correo;
    document.getElementById('profile-phone').value = currentUser.numero || 'Sin número';
}

async function handleUpdatePassword(e) {
    e.preventDefault();
    const nueva_contrasena = document.getElementById('new-password').value;
    
    try {
        Swal.fire({ title: 'Actualizando...', didOpen: () => Swal.showLoading() });
        const res = await fetch(`${API_URL}/actualizar_password`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo: currentUser.correo, nueva_contrasena })
        });
        if(res.ok) {
            Swal.fire('¡Éxito!', 'Contraseña actualizada. Vuelve a iniciar sesión.', 'success');
            document.querySelectorAll('.logout-btn')[0].click();
        } else {
            Swal.fire('Error', 'No se pudo actualizar', 'error');
        }
    } catch (err) {
        Swal.fire('Error', 'Problema de conexión', 'error');
    }
}

async function cargarAdminBodega() {
    const tbody = document.getElementById('admin-table-body');
    const invEl = document.getElementById('admin-inversion');
    if(!tbody) return;
    tbody.innerHTML = '<tr><td colspan="7">Cargando datos...</td></tr>';
    
    try {
        const res = await fetch(`${API_URL}/bodega_admin`);
        const data = await res.json();
        
        tbody.innerHTML = '';
        if(data.inventario && data.inventario.length > 0) {
            data.inventario.forEach(item => {
                let badgeClase = item.perfiles_libres > 0 ? 'badge-verde' : 'badge-rojo';
                let alertaClase = item.dias_restantes <= 3 ? 'text-red font-bold' : '';
                
                tbody.innerHTML += `
                    <tr>
                        <td><strong>${item.plataforma}</strong></td>
                        <td>${item.correo_matriz}</td>
                        <td>S/ ${item.costo.toFixed(2)}</td>
                        <td>${item.perfiles_ocupados} / ${item.perfiles_totales} ocupados</td>
                        <td><span class="${badgeClase}">${item.perfiles_libres} Libres</span></td>
                        <td>${item.vence_display}</td>
                        <td class="${alertaClase}">${item.dias_restantes} días</td>
                    </tr>
                `;
            });
            invEl.textContent = `S/ ${data.total_inversion.toFixed(2)}`;
        } else {
            tbody.innerHTML = '<tr><td colspan="7">No hay datos en Bodega</td></tr>';
        }
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-red">Error al cargar datos</td></tr>';
    }
}

async function cargarAdminMonitor() {
    const tbody = document.getElementById('admin-monitor-body');
    if(!tbody) return;
    tbody.innerHTML = '<tr><td colspan="10">Cargando monitor...</td></tr>';
    
    try {
        const res = await fetch(`${API_URL}/monitor_admin`);
        const data = await res.json();
        
        tbody.innerHTML = '';
        let tIngresos = 0, tCostos = 0, tGanancia = 0;
        
        if(data.length > 0) {
            data.forEach(item => {
                tIngresos += item.ingreso;
                tCostos += item.costo_perfil;
                tGanancia += item.ganancia;
                
                let estClase = item.estado.toUpperCase() === 'ACTIVO' ? 'text-green' : 'text-red';
                let btnAccion = item.estado.toUpperCase() !== 'ACTIVO' ? `<button class="red-btn" style="padding:5px 10px; font-size:10px; margin-top:5px;"><i class="fa-brands fa-whatsapp"></i> Renovar</button>` : '';

                tbody.innerHTML += `
                    <tr>
                        <td>${item.usuario}</td>
                        <td><small>${item.servicio}</small></td>
                        <td>${item.fecha_compra_display}</td>
                        <td><small>${item.correo_asignado}</small></td>
                        <td><strong>${item.perfil}</strong></td>
                        <td style="color:#3b82f6;">S/ ${item.ingreso.toFixed(2)}</td>
                        <td class="text-red">S/ ${item.costo_perfil.toFixed(2)}</td>
                        <td class="text-green font-bold">S/ ${item.ganancia.toFixed(2)}</td>
                        <td>${item.vencimiento} <br><small class="${item.dias_restantes <= 2 ? 'text-red' : ''}">(${item.dias_restantes} d)</small></td>
                        <td class="${estClase} font-bold">${item.estado}<br>${btnAccion}</td>
                    </tr>
                `;
            });
            document.getElementById('monitor-ingresos').textContent = `S/ ${tIngresos.toFixed(2)}`;
            document.getElementById('monitor-costos').textContent = `S/ ${tCostos.toFixed(2)}`;
            document.getElementById('monitor-ganancia').textContent = `S/ ${tGanancia.toFixed(2)}`;
        } else {
            tbody.innerHTML = '<tr><td colspan="10">No hay ventas registradas</td></tr>';
        }
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="10" class="text-red">Error al cargar monitor</td></tr>';
    }
}

async function handleVentaManual(e) {
    e.preventDefault();
    const data = {
        cliente: document.getElementById('vm-cliente').value,
        servicio: document.getElementById('vm-servicio').value,
        precio: document.getElementById('vm-precio').value,
        correo_matriz: document.getElementById('vm-correo-asig').value,
        perfil: document.getElementById('vm-perfil-asig').value || '---',
        fecha_inicio: document.getElementById('vm-inicio').value,
        fecha_fin: document.getElementById('vm-fin').value
    };

    try {
        Swal.fire({ title: 'Guardando...', didOpen: () => Swal.showLoading() });
        const res = await fetch(`${API_URL}/venta_manual`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (res.ok) {
            Swal.fire('Venta Registrada', '', 'success');
            document.getElementById('form-venta-manual').reset();
            document.getElementById('modal-venta').style.display = 'none';
            cargarAdminMonitor();
            cargarAdminBodega();
        } else {
            Swal.fire('Error', 'No se pudo guardar la venta', 'error');
        }
    } catch (err) {
        Swal.fire('Error', 'Problema de conexión', 'error');
    }
}

// === MARKETING MEJORADO (Emojis Inyectados vía JS) ===
async function handleMarketing(e) {
    e.preventDefault();
    const numero = document.getElementById('mkt-numero').value;
    let mensajeBase = document.getElementById('mkt-mensaje').value;
    
    // Inyectamos los emojis explícitos de claqueta y TV justo después de 'SCenterPro'
    let mensajeConEmojis = mensajeBase.replace('Somos SCenterPro.', 'Somos SCenterPro 🎬📺.');
    
    try {
        await fetch(`${API_URL}/marketing_enviar`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ numero, mensaje: mensajeConEmojis })
        });
        
        cargarHistorialMarketing();
        document.getElementById('mkt-numero').value = '';
        
        // encodeURIComponent se encarga de empaquetar el emoji en un formato que WhatsApp no pueda romper
        window.open(`https://wa.me/51${numero}?text=${encodeURIComponent(mensajeConEmojis)}`, '_blank');
        
    } catch(err) {
        Swal.fire('Error', 'Problema al guardar historial', 'error');
    }
}

async function cargarHistorialMarketing() {
    const tbody = document.getElementById('mkt-table-body');
    if(!tbody) return;
    
    try {
        const res = await fetch(`${API_URL}/marketing_historial`);
        const data = await res.json();
        
        tbody.innerHTML = '';
        if(data.length > 0) {
            data.forEach(item => {
                let color = item.estado === 'ENVIADO' ? 'text-green' : 'text-red';
                tbody.innerHTML += `
                    <tr>
                        <td><small>${item.fecha}</small></td>
                        <td><strong>${item.numero}</strong></td>
                        <td><small>${item.mensaje.substring(0, 30)}...</small></td>
                        <td class="${color}"><strong>${item.estado}</strong></td>
                        <td>
                            <select onchange="updateMktStatus('${item.id}', this.value)" style="background:#222; color:white; border:1px solid #444; border-radius:5px; padding:3px;">
                                <option value="ENVIADO" ${item.estado==='ENVIADO'?'selected':''}>Enviado</option>
                                <option value="RESPONDIO" ${item.estado==='RESPONDIO'?'selected':''}>Respondió</option>
                                <option value="NO INTERESA" ${item.estado==='NO INTERESA'?'selected':''}>No Interesa</option>
                                <option value="SIN WHATSAPP" ${item.estado==='SIN WHATSAPP'?'selected':''}>Sin WhatsApp</option>
                            </select>
                        </td>
                    </tr>
                `;
            });
        }
    } catch(err) {}
}

window.updateMktStatus = async function(id, estado) {
    try {
        await fetch(`${API_URL}/marketing_estado`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, estado })
        });
        Swal.fire({ title: 'Estado actualizado', icon: 'success', toast: true, position: 'bottom-end', showConfirmButton: false, timer: 1500 });
        cargarHistorialMarketing();
    } catch(err) {}
};
