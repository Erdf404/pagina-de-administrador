// script_usuarios.js - Gestión de usuarios (Agregar, Modificar, Eliminar)

// Variables globales
let usuariosGuardados = [];
let contadorUsuarios = 1;

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    cargarUsuarios();
    
    // Detectar en qué página estamos
    const rutaActual = window.location.pathname;
    
    // Si estamos en la página de agregar usuario
    if (document.getElementById('tipo-usuario')) {
        inicializarAgregarUsuario();
    }
    
    // Si estamos en la página de modificar usuario
    if (rutaActual.includes('Modificar-usuario') && document.querySelector('.table-main')) {
        cargarTablaModificar();
    }
    
    // Si estamos en la página de eliminar usuario
    if (rutaActual.includes('Eliminar-usuario') && document.querySelector('.guardias')) {
        cargarTablaEliminar();
        inicializarBusquedaEliminar();
    }
});

// ==================== FUNCIONES PARA AGREGAR USUARIO ====================
function inicializarAgregarUsuario() {
    const form = document.querySelector('form');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            agregarUsuario();
        });
    }
}

function agregarUsuario() {
    const tipoUsuario = document.getElementById('tipo-usuario').value;
    const tipoAdmin = document.getElementById('tipo-admin').value;
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Validaciones
    if (!tipoUsuario) {
        alert('⚠️ Por favor, selecciona el tipo de usuario.');
        return;
    }

    if (tipoUsuario === 'administrador' && !tipoAdmin) {
        alert('⚠️ Por favor, selecciona el tipo de administrador.');
        return;
    }

    if (!nombre || !email || !password) {
        alert('⚠️ Por favor, completa todos los campos.');
        return;
    }

    // Verificar si el correo ya existe
    if (usuariosGuardados.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        alert('⚠️ Ya existe un usuario con ese correo electrónico.');
        return;
    }

    // Crear objeto usuario
    const usuario = {
        id: contadorUsuarios++,
        tipoUsuario: tipoUsuario,
        tipoAdmin: tipoUsuario === 'administrador' ? tipoAdmin : null,
        nombre: nombre,
        email: email,
        password: password,
        fechaCreacion: new Date().toLocaleString('es-ES')
    };

    // Guardar usuario
    usuariosGuardados.push(usuario);
    guardarUsuarios();

    alert('✅ Usuario agregado exitosamente');

    // Limpiar formulario
    document.getElementById('tipo-usuario').value = '';
    document.getElementById('tipo-admin').value = '';
    document.getElementById('nombre').value = '';
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    document.getElementById('admin-options').style.display = 'none';
}

// ==================== FUNCIONES PARA MODIFICAR USUARIO ====================
function cargarTablaModificar() {
    const tbody = document.querySelector('.table-main tbody');
    
    if (!tbody) return;

    if (usuariosGuardados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 20px; color: #6c757d;">
                    No hay usuarios registrados aún
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    usuariosGuardados.forEach(usuario => {
        html += `
            <tr data-usuario-id="${usuario.id}">
                <td><input type="text" value="${usuario.nombre}" data-campo="nombre" /></td>
                <td><input type="email" value="${usuario.email}" data-campo="email" /></td>
                <td>
                    <select onchange="mostrarTipoAdmin(this)" data-campo="tipoUsuario">
                        <option value="usuario" ${usuario.tipoUsuario === 'usuario' ? 'selected' : ''}>Guardia</option>
                        <option value="administrador" ${usuario.tipoUsuario === 'administrador' ? 'selected' : ''}>Administrador</option>
                    </select>
                </td>
                <td>
                    <select class="tipo-admin" data-campo="tipoAdmin" style="display: ${usuario.tipoUsuario === 'administrador' ? 'block' : 'none'};">
                        <option value="">Seleccionar...</option>
                        <option value="A1" ${usuario.tipoAdmin === 'A1' ? 'selected' : ''}>A1</option>
                        <option value="A2" ${usuario.tipoAdmin === 'A2' ? 'selected' : ''}>A2</option>
                        <option value="A3" ${usuario.tipoAdmin === 'A3' ? 'selected' : ''}>A3</option>
                    </select>
                </td>
                <td><input type="password" placeholder="Nueva contraseña (opcional)" data-campo="password" /></td>
                <td><button class="guardar-btn" onclick="modificarUsuario(${usuario.id})">Guardar</button></td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

function modificarUsuario(idUsuario) {
    const fila = document.querySelector(`tr[data-usuario-id="${idUsuario}"]`);
    
    if (!fila) return;

    const nombre = fila.querySelector('[data-campo="nombre"]').value.trim();
    const email = fila.querySelector('[data-campo="email"]').value.trim();
    const tipoUsuario = fila.querySelector('[data-campo="tipoUsuario"]').value;
    const tipoAdmin = fila.querySelector('[data-campo="tipoAdmin"]').value;
    const password = fila.querySelector('[data-campo="password"]').value;

    if (!nombre || !email) {
        alert('⚠️ El nombre y correo no pueden estar vacíos.');
        return;
    }

    // Verificar si el correo ya existe en otro usuario
    const emailExiste = usuariosGuardados.some(u => 
        u.email.toLowerCase() === email.toLowerCase() && u.id !== idUsuario
    );

    if (emailExiste) {
        alert('⚠️ Ya existe otro usuario con ese correo electrónico.');
        return;
    }

    // Buscar y actualizar usuario
    const index = usuariosGuardados.findIndex(u => u.id === idUsuario);
    
    if (index !== -1) {
        usuariosGuardados[index].nombre = nombre;
        usuariosGuardados[index].email = email;
        usuariosGuardados[index].tipoUsuario = tipoUsuario;
        usuariosGuardados[index].tipoAdmin = tipoUsuario === 'administrador' ? tipoAdmin : null;
        
        if (password) {
            usuariosGuardados[index].password = password;
        }

        usuariosGuardados[index].fechaModificacion = new Date().toLocaleString('es-ES');

        guardarUsuarios();
        alert('✅ Usuario modificado exitosamente');
        
        fila.querySelector('[data-campo="password"]').value = '';
    }
}

// ==================== FUNCIONES PARA ELIMINAR USUARIO ====================
function cargarTablaEliminar() {
    const tbody = document.querySelector('.guardias tbody');
    
    if (!tbody) return;

    if (usuariosGuardados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 20px; color: #6c757d;">
                    No hay usuarios registrados aún
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    usuariosGuardados.forEach(usuario => {
        const tipoDisplay = usuario.tipoUsuario === 'administrador' 
            ? `Administrador (${usuario.tipoAdmin})` 
            : 'Guardia';
        
        html += `
            <tr>
                <td>${usuario.nombre} - ${usuario.email}</td>
                <td>${tipoDisplay}</td>
                <td class="eliminar" onclick="eliminarUsuario(${usuario.id})">✖</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

function inicializarBusquedaEliminar() {
    const formBusqueda = document.querySelector('.placeholder form');
    
    if (formBusqueda) {
        formBusqueda.addEventListener('submit', function(e) {
            e.preventDefault();
            buscarUsuarioEliminar(this.busqueda.value);
        });
    }
}

function eliminarUsuario(idUsuario) {
    const usuario = usuariosGuardados.find(u => u.id === idUsuario);
    
    if (!usuario) return;

    if (confirm(`¿Estás seguro de eliminar al usuario "${usuario.nombre}"?`)) {
        usuariosGuardados = usuariosGuardados.filter(u => u.id !== idUsuario);
        guardarUsuarios();
        alert('🗑️ Usuario eliminado correctamente');
        cargarTablaEliminar();
    }
}

function filtrarPorTipo(tipo) {
    const tbody = document.querySelector('.guardias tbody');
    
    if (!tbody) return;

    let usuariosFiltrados = usuariosGuardados;

    if (tipo === 'A') {
        usuariosFiltrados = usuariosGuardados.filter(u => u.tipoUsuario === 'administrador');
    } else if (tipo === 'G') {
        usuariosFiltrados = usuariosGuardados.filter(u => u.tipoUsuario === 'usuario');
    }

    if (usuariosFiltrados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 20px; color: #6c757d;">
                    No hay usuarios de este tipo
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    usuariosFiltrados.forEach(usuario => {
        const tipoDisplay = usuario.tipoUsuario === 'administrador' 
            ? `Administrador (${usuario.tipoAdmin})` 
            : 'Guardia';
        
        html += `
            <tr>
                <td>${usuario.nombre} - ${usuario.email}</td>
                <td>${tipoDisplay}</td>
                <td class="eliminar" onclick="eliminarUsuario(${usuario.id})">✖</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

function buscarUsuarioEliminar(termino) {
    termino = termino.toLowerCase().trim();
    
    if (!termino) {
        cargarTablaEliminar();
        return;
    }

    const usuariosFiltrados = usuariosGuardados.filter(u => 
        u.nombre.toLowerCase().includes(termino) || 
        u.email.toLowerCase().includes(termino)
    );

    const tbody = document.querySelector('.guardias tbody');
    
    if (!tbody) return;

    if (usuariosFiltrados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 20px; color: #6c757d;">
                    No se encontraron usuarios con ese criterio
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    usuariosFiltrados.forEach(usuario => {
        const tipoDisplay = usuario.tipoUsuario === 'administrador' 
            ? `Administrador (${usuario.tipoAdmin})` 
            : 'Guardia';
        
        html += `
            <tr>
                <td>${usuario.nombre} - ${usuario.email}</td>
                <td>${tipoDisplay}</td>
                <td class="eliminar" onclick="eliminarUsuario(${usuario.id})">✖</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// ==================== FUNCIONES DE ALMACENAMIENTO ====================
function guardarUsuarios() {
    localStorage.setItem('usuariosGuardados', JSON.stringify(usuariosGuardados));
    localStorage.setItem('contadorUsuarios', contadorUsuarios);
}

function cargarUsuarios() {
    const usuarios = localStorage.getItem('usuariosGuardados');
    const contador = localStorage.getItem('contadorUsuarios');

    if (usuarios) {
        usuariosGuardados = JSON.parse(usuarios);
    }

    if (contador) {
        contadorUsuarios = parseInt(contador);
    }
}

// ==================== FUNCIONES AUXILIARES ====================
// Función para obtener todos los usuarios (usada por otros scripts)
function obtenerUsuarios() {
    return usuariosGuardados;
}

function obtenerGuardias() {
    return usuariosGuardados.filter(u => u.tipoUsuario === 'usuario');
}

// Hacer funciones globales
window.modificarUsuario = modificarUsuario;
window.eliminarUsuario = eliminarUsuario;
window.filtrarPorTipo = filtrarPorTipo;
window.obtenerUsuarios = obtenerUsuarios;
window.obtenerGuardias = obtenerGuardias;