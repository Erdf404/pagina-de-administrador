// script_rondines.js - Gestión de rondines ejecutados

let rondinesGuardados = [];
let rondinesFiltrados = [];
let guardiaSeleccionado = null;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.guardias')) {
        inicializarRondines();
        inicializarFechas();
    }
});

async function inicializarRondines() {
    // Verificar si viene desde búsqueda de guardia
    const guardiaId = sessionStorage.getItem('guardiaSeleccionado');
    const nombreGuardia = sessionStorage.getItem('nombreGuardia');
    
    if (guardiaId) {
        guardiaSeleccionado = parseInt(guardiaId);
        mostrarNombreGuardia(nombreGuardia);
    }
    
    await cargarRondines();
}

function inicializarFechas() {
    // Establecer fecha de hoy como fecha fin por defecto
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('fecha-fin').value = hoy;
    
    // Establecer fecha de inicio como hace 30 días
    const hace30dias = new Date();
    hace30dias.setDate(hace30dias.getDate() - 30);
    document.getElementById('fecha-inicio').value = hace30dias.toISOString().split('T')[0];
}

function mostrarNombreGuardia(nombre) {
    const displayNombre = document.getElementById('nombre-guardia-display');
    const btnVerTodos = document.getElementById('btn-ver-todos');
    
    if (displayNombre && nombre) {
        displayNombre.textContent = `👤 ${nombre}`;
        displayNombre.style.display = 'inline-block';
        displayNombre.style.color = '#ffffff'; // Color blanco
        displayNombre.style.fontWeight = 'bold';
        displayNombre.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.3)'; // Sombra para mejor legibilidad
    }
    
    // Mostrar botón "Ver Todos" solo si es administrador
    if (btnVerTodos) {
        btnVerTodos.style.display = 'inline-block';
    }
}

async function cargarRondines() {
    try {
        let url = '../api/api_rondines.php?accion=obtener';
        if (guardiaSeleccionado) {
            url += `&guardiaId=${guardiaSeleccionado}`;
        }
        
        const response = await fetch(url);
        const resultado = await response.json();
        
        if (resultado.exito) {
            rondinesGuardados = resultado.datos;
            rondinesFiltrados = rondinesGuardados;
            actualizarTablaRondines();
        } else {
            console.error('Error al cargar rondines');
            rondinesGuardados = [];
            rondinesFiltrados = [];
            actualizarTablaRondines();
        }
    } catch (error) {
        console.error('Error:', error);
        rondinesGuardados = [];
        rondinesFiltrados = [];
        actualizarTablaRondines();
    }
}

function filtrarPorFecha() {
    const fechaInicio = document.getElementById('fecha-inicio').value;
    const fechaFin = document.getElementById('fecha-fin').value;
    
    if (!fechaInicio && !fechaFin) {
        alert('⚠️ Selecciona al menos una fecha');
        return;
    }
    
    // Filtrar rondines por rango de fechas
    rondinesFiltrados = rondinesGuardados.filter(rondin => {
        const fechaRondin = rondin.fecha; // Formato YYYY-MM-DD
        
        if (fechaInicio && fechaFin) {
            return fechaRondin >= fechaInicio && fechaRondin <= fechaFin;
        } else if (fechaInicio) {
            return fechaRondin >= fechaInicio;
        } else if (fechaFin) {
            return fechaRondin <= fechaFin;
        }
        
        return true;
    });
    
    actualizarTablaRondines();
    
    // Mostrar mensaje con resultados
    if (rondinesFiltrados.length === 0) {
        mostrarMensaje('No se encontraron rondines en el rango de fechas seleccionado', 'info');
    } else {
        mostrarMensaje(`✅ Se encontraron ${rondinesFiltrados.length} rondines`, 'success');
    }
}

function limpiarFiltros() {
    // Restaurar fechas por defecto
    inicializarFechas();
    
    // Mostrar todos los rondines
    rondinesFiltrados = rondinesGuardados;
    actualizarTablaRondines();
    
    mostrarMensaje('Filtros limpiados', 'info');
}

function actualizarTablaRondines() {
    const tbody = document.querySelector('.guardias tbody');
    if (!tbody) return;
    
    if (rondinesFiltrados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: #6c757d;">
                    <div style="font-size: 3rem; margin-bottom: 10px;">📋</div>
                    <strong>No hay rondines registrados</strong>
                    <br><br>
                    <small>Los rondines ejecutados aparecerán aquí</small>
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    rondinesFiltrados.forEach(rondin => {
        const tipoIcon = rondin.tipoRonda === 'Externo' ? '🌍' : '🏢';
        
        html += `
            <tr>
                <td>
                    <strong>${formatearFecha(rondin.fecha)}</strong>
                    <br>
                    <small style="color: #6c757d;">${rondin.guardiaNombre}</small>
                </td>
                <td>${rondin.horaInicio}</td>
                <td>${rondin.horaFinal || '-'}</td>
                <td>
                    ${tipoIcon} ${rondin.tipoRonda}
                    <br>
                    <small style="color: #6c757d;">${rondin.rutaNombre}</small>
                </td>
                <td>
                    <button class="mapa-boton" onclick="verMapaRondin(${rondin.id})">
                         Mostrar Resumen
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

async function verMapaRondin(rondinId) {
    try {
        const response = await fetch(`../api/api_rondines.php?accion=obtener_coordenadas&id=${rondinId}`);
        const resultado = await response.json();
        
        if (resultado.exito && resultado.datos.length > 0) {
            const rondin = rondinesFiltrados.find(r => r.id === rondinId);
            mostrarModalMapa(rondin, resultado.datos);
        } else {
            alert('⚠️ No hay coordenadas registradas para este rondín');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al cargar las coordenadas');
    }
}

function mostrarModalMapa(rondin, coordenadas) {
    const modalExistente = document.getElementById('modal-mapa-rondin');
    if (modalExistente) modalExistente.remove();
    
    const listaCoordenadas = coordenadas.map((c, i) => {
        // Determinar el texto de ubicación
        let ubicacionTexto = '';
        if (c.qr) {
            ubicacionTexto = `QR: ${c.qr}`;
        } else if (c.lat && c.lng) {
            ubicacionTexto = `(${c.lat}, ${c.lng})`;
        } else {
            ubicacionTexto = 'Sin ubicación';
        }
        
        return `
        <div style="padding: 12px; background: ${c.verificador ? '#2a9b44ff' : '#9c141fff'}; 
                    margin: 8px 0; border-radius: 8px; color: white;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="flex: 1;">
                    <strong style="font-size: 16px;">${i + 1}. ${c.nombre_punto || 'Punto desconocido'}</strong>
                    <br>
                    <small style="opacity: 0.9;">⏰ ${c.hora}</small>
                    <br>
                    <small style="opacity: 0.8;">📍 ${ubicacionTexto}</small>
                </div>
                <div style="font-size: 24px;">
                    ${c.verificador ? '✅' : '❌'}
                </div>
            </div>
        </div>
    `;
    }).join('');
    
    const modal = document.createElement('div');
    modal.id = 'modal-mapa-rondin';
    modal.className = 'modal-rondin';
    modal.innerHTML = `
        <div class="modal-rondin-content">
            <span class="close-modal" onclick="cerrarModalRondin()">&times;</span>
            <h2>🗺️ Recorrido del Rondín</h2>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 15px; border-radius: 8px; margin: 15px 0; color: #ffffff;">
                <strong>👤 Guardia:</strong> ${rondin.guardiaNombre}<br>
                <strong>📅 Fecha:</strong> ${formatearFecha(rondin.fecha)}<br>
                <strong>⏰ Inicio:</strong> ${rondin.horaInicio} | 
                <strong>Fin:</strong> ${rondin.horaFinal || 'En progreso'}<br>
                <strong>🗺️ Ruta:</strong> ${rondin.rutaNombre}
            </div>
            
            <h3 style="margin-top: 20px; color: #0044cc;">📍 Puntos Registrados (${coordenadas.length})</h3>
            <div style="max-height: 400px; overflow-y: auto;">
                ${listaCoordenadas}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    if (!document.getElementById('estilos-modal-rondin')) {
        agregarEstilosModal();
    }
}

function cerrarModalRondin() {
    const modal = document.getElementById('modal-mapa-rondin');
    if (modal) {
        modal.style.display = 'none';
        modal.remove();
    }
}

function verTodos() {
    guardiaSeleccionado = null;
    sessionStorage.removeItem('guardiaSeleccionado');
    sessionStorage.removeItem('nombreGuardia');
    
    const displayNombre = document.getElementById('nombre-guardia-display');
    const btnVerTodos = document.getElementById('btn-ver-todos');
    
    if (displayNombre) displayNombre.style.display = 'none';
    if (btnVerTodos) btnVerTodos.style.display = 'none';
    
    cargarRondines();
}

function formatearFecha(fecha) {
    const date = new Date(fecha + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function mostrarMensaje(mensaje, tipo) {
    let mensajeDiv = document.getElementById('mensaje-rondines');
    
    if (!mensajeDiv) {
        mensajeDiv = document.createElement('div');
        mensajeDiv.id = 'mensaje-rondines';
        const main = document.querySelector('main');
        if (main) main.insertBefore(mensajeDiv, main.firstChild);
    }
    
    const colores = {
        success: { bg: '#d4edda', color: '#155724', border: '#c3e6cb' },
        info: { bg: '#d1ecf1', color: '#0c5460', border: '#bee5eb' },
        error: { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb' }
    };
    
    const estilo = colores[tipo] || colores.info;
    
    mensajeDiv.style.cssText = `
        padding: 12px 20px;
        margin-bottom: 15px;
        background: ${estilo.bg};
        color: ${estilo.color};
        border: 1px solid ${estilo.border};
        border-radius: 6px;
        text-align: center;
        font-weight: bold;
    `;
    mensajeDiv.textContent = mensaje;
    
    setTimeout(() => {
        mensajeDiv.style.display = 'none';
    }, 3000);
}

function agregarEstilosModal() {
    const style = document.createElement('style');
    style.id = 'estilos-modal-rondin';
    style.innerHTML = `
        .modal-rondin {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.6);
            justify-content: center;
            align-items: center;
        }
        
        .modal-rondin-content {
            background-color: #fff;
            padding: 30px;
            border-radius: 12px;
            width: 90%;
            max-width: 700px;
            max-height: 85vh;
            overflow-y: auto;
            position: relative;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        .close-modal {
            position: absolute;
            right: 20px;
            top: 20px;
            font-size: 28px;
            font-weight: bold;
            color: #999;
            cursor: pointer;
        }
        
        .close-modal:hover {
            color: #333;
        }
        
        .modal-rondin-content h2 {
            color: #0044cc;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 3px solid #0044cc;
        }
        
    `;
    document.head.appendChild(style);
}

// ==================== Funciones globales ====================
window.verMapaRondin = verMapaRondin;
window.cerrarModalRondin = cerrarModalRondin;
window.verTodos = verTodos;
window.filtrarPorFecha = filtrarPorFecha;
window.limpiarFiltros = limpiarFiltros;