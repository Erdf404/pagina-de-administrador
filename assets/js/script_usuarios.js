// script_usuarios.js - Gestión de usuarios (Agregar, Modificar, Eliminar)

// Variables globales
let usuariosGuardados = [];

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

async function agregarUsuario() {
    const tipoUsuario = document.getElementById('tipo-usuario').value;
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Validaciones
    if (!tipoUsuario) {
        alert('⚠️ Por favor, selecciona el tipo de usuario.');
        return;
    }


    if (!nombre || !email || !password) {
        alert('⚠️ Por favor, completa todos los campos.');
        return;
    }

    try {
        const response = await fetch('../api/api_usuarios.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                accion: 'agregar',
                tipoUsuario: tipoUsuario,
                nombre: nombre,
                email: email,
                password: password
            })
        });

        const resultado = await response.json();

        if (resultado.exito) {
            alert('✅ Usuario agregado exitosamente');
            
            // Limpiar formulario
            document.getElementById('tipo-usuario').value = '';
            document.getElementById('nombre').value = '';
            document.getElementById('email').value = '';
            document.getElementById('password').value = '';
        } else {
            alert('⚠️ ' + resultado.mensaje);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al agregar usuario. Intenta de nuevo.');
    }
}

// ==================== FUNCIONES PARA MODIFICAR USUARIO ====================
async function cargarTablaModificar() {
    const tbody = document.querySelector('.table-main tbody');
    
    if (!tbody) return;

    await cargarUsuarios();

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
        let tipoSeleccionado = 'usuario';
        if (usuario.id_tipo === 2) tipoSeleccionado = 'encargado';
        if (usuario.id_tipo === 3) tipoSeleccionado = 'administrador';
    
        html += `
            <tr data-usuario-id="${usuario.id_usuario}">
                <td><input type="text" value="${usuario.nombre}" data-campo="nombre" /></td>
                <td><input type="email" value="${usuario.correo || ''}" data-campo="email" /></td>
                <td>
                    <select data-campo="tipoUsuario">
                        <option value="usuario" ${tipoSeleccionado === 'usuario' ? 'selected' : ''}>Guardia</option>
                        <option value="encargado" ${tipoSeleccionado === 'encargado' ? 'selected' : ''}>Encargado</option>
                        <option value="administrador" ${tipoSeleccionado === 'administrador' ? 'selected' : ''}>Administrador</option>
                    </select>
                </td>
                <td>
                    <div style="position: relative; display: inline-block; width: 100%;">
                        <input type="password" placeholder="Generar nueva contraseña" data-campo="password" style="padding-right: 35px; width: 100%;" />
                        <span class="toggle-password-icon" onclick="togglePasswordModificar(${usuario.id_usuario})" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); cursor: pointer; user-select: none;">👁</span>
                    </div>
                </td>
                <td><button class="guardar-btn" onclick="modificarUsuario(${usuario.id_usuario})">Guardar</button></td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

async function modificarUsuario(idUsuario) {
    const fila = document.querySelector(`tr[data-usuario-id="${idUsuario}"]`);
    
    if (!fila) return;

    const nombre = fila.querySelector('[data-campo="nombre"]').value.trim();
    const email = fila.querySelector('[data-campo="email"]').value.trim();
    const tipoUsuario = fila.querySelector('[data-campo="tipoUsuario"]').value;
    const password = fila.querySelector('[data-campo="password"]').value;

    if (!nombre || !email) {
        alert('⚠️ El nombre y correo no pueden estar vacíos.');
        return;
    }

    try {
        const response = await fetch('../api/api_usuarios.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                accion: 'modificar',
                idUsuario: idUsuario,
                nombre: nombre,
                email: email,
                tipoUsuario: tipoUsuario,
                password: password
            })
        });

        const resultado = await response.json();

        if (resultado.exito) {
            alert('✅ Usuario modificado exitosamente');
            fila.querySelector('[data-campo="password"]').value = '';
            await cargarUsuarios();
        } else {
            alert('⚠️ ' + resultado.mensaje);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al modificar usuario. Intenta de nuevo.');
    }
}



// ==================== FUNCIONES PARA ELIMINAR USUARIO ====================
async function cargarTablaEliminar() {
    const tbody = document.querySelector('.guardias tbody');
    
    if (!tbody) return;

    await cargarUsuarios();

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
        let tipoDisplay = 'Guardia';
        if (usuario.id_tipo === 2) tipoDisplay = 'Encargado';
        if (usuario.id_tipo === 3) tipoDisplay = 'Administrador';
        
        html += `
            <tr>
                <td>${usuario.nombre} - ${usuario.correo || 'Sin correo'}</td>
                <td>${tipoDisplay}</td>
                <td class="eliminar" onclick="eliminarUsuario(${usuario.id_usuario})">✖</td>
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

async function eliminarUsuario(idUsuario) {
    const usuario = usuariosGuardados.find(u => u.id_usuario === idUsuario);
    
    if (!usuario) return;

    if (!confirm(`¿Estás seguro de eliminar al usuario "${usuario.nombre}"?`)) {
        return;
    }

    try {
        const response = await fetch('../api/api_usuarios.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                accion: 'eliminar',
                idUsuario: idUsuario
            })
        });

        const resultado = await response.json();

        if (resultado.exito) {
            alert('🗑️ Usuario eliminado correctamente');
            await cargarTablaEliminar();
        } else {
            alert('⚠️ ' + resultado.mensaje);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al eliminar usuario. Intenta de nuevo.');
    }
}

function filtrarPorTipo(tipo) {
    const tbody = document.querySelector('.guardias tbody');
    
    if (!tbody) return;

    let usuariosFiltrados = usuariosGuardados;

    if (tipo === 'A') {
        usuariosFiltrados = usuariosGuardados.filter(u => u.id_tipo >= 2 && u.id_tipo <= 3);
    } else if (tipo === 'G') {
        usuariosFiltrados = usuariosGuardados.filter(u => u.id_tipo === 1);
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
        const esAdmin = usuario.id_tipo >= 2 && usuario.id_tipo <= 4;
        let tipoDisplay = 'Guardia';        
        if (usuario.id_tipo === 2) tipoDisplay = 'Encargado';
        if (usuario.id_tipo === 3) tipoDisplay = 'Administrador';
        
        html += `
            <tr>
                <td>${usuario.nombre} - ${usuario.correo || 'Sin correo'}</td>
                <td>${tipoDisplay}</td>
                <td class="eliminar" onclick="eliminarUsuario(${usuario.id_usuario})">✖</td>
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
        (u.correo && u.correo.toLowerCase().includes(termino))
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
        const esAdmin = usuario.id_tipo >= 2 && usuario.id_tipo <= 4;
        let tipoDisplay = 'Guardia';
        if (usuario.id_tipo === 2) tipoDisplay = 'Encargado';
        if (usuario.id_tipo === 3) tipoDisplay = 'Administrador';
        
        
        html += `
            <tr>
                <td>${usuario.nombre} - ${usuario.correo || 'Sin correo'}</td>
                <td>${tipoDisplay}</td>
                <td class="eliminar" onclick="eliminarUsuario(${usuario.id_usuario})">✖</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// ==================== FUNCIONES DE CARGA DE DATOS ====================
async function cargarUsuarios() {
    try {
        const response = await fetch('../api/api_usuarios.php?accion=obtener');
        const resultado = await response.json();

        if (resultado.exito) {
            usuariosGuardados = resultado.datos;
        } else {
            console.error('Error al cargar usuarios:', resultado.mensaje);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}



// ==================== Funciones globales ====================
window.modificarUsuario = modificarUsuario;
window.eliminarUsuario = eliminarUsuario;
window.filtrarPorTipo = filtrarPorTipo;