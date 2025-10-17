// script_busqueda_guardias.js - Búsqueda y gestión de guardias

// Variables globales
let guardiasCargados = [];

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Esperar un poco para asegurar que el DOM esté completamente cargado
    setTimeout(() => {
        cargarGuardias();
        cargarTablaGuardias();
        inicializarBusqueda();
    }, 100);
});

// ==================== CARGAR DATOS ====================
function cargarGuardias() {
    const usuarios = localStorage.getItem('usuariosGuardados');
    
    console.log('Cargando guardias desde localStorage...');
    console.log('Datos en localStorage:', usuarios);
    
    if (usuarios) {
        try {
            const todosUsuarios = JSON.parse(usuarios);
            console.log('Usuarios parseados:', todosUsuarios);
            
            // Filtrar solo los usuarios tipo "usuario" (guardias)
            guardiasCargados = todosUsuarios.filter(u => u.tipoUsuario === 'usuario');
            console.log('Guardias filtrados:', guardiasCargados);
        } catch (e) {
            console.error('Error al parsear usuarios:', e);
            guardiasCargados = [];
        }
    } else {
        console.log('No hay usuarios en localStorage');
        guardiasCargados = [];
    }
}

// ==================== MOSTRAR TABLA DE GUARDIAS ====================
function cargarTablaGuardias() {
    const tbody = document.querySelector('.guardias tbody');
    
    console.log('Cargando tabla, guardias encontrados:', guardiasCargados.length);
    
    if (!tbody) {
        console.error('No se encontró el tbody de la tabla');
        return;
    }

    if (guardiasCargados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td style="text-align: center; padding: 40px; color: #6c757d; font-style: italic;">
                    <div style="font-size: 3rem; margin-bottom: 10px;">📋</div>
                    <strong>No hay guardias registrados aún</strong>
                    <br><br>
                    <small>Los guardias registrados aparecerán aquí</small>
                    <br><br>
                    <button onclick="window.location.href='Agregar-Usuario.php'" 
                            style="padding: 10px 20px; background: #0044cc; color: white; border: none; 
                                  border-radius: 6px; cursor: pointer; font-weight: bold; margin-top: 10px;">
                        ➕ Agregar Guardia
                    </button>
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    guardiasCargados.forEach(guardia => {
        html += `
            <tr onclick="verDetalleGuardia(${guardia.id})" style="cursor: pointer;" 
                onmouseover="this.style.backgroundColor='#e3f2fd'" 
                onmouseout="this.style.backgroundColor=''">
                <td class="guardia-nombre">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="background: #0044cc; color: white; width: 50px; height: 50px; 
                                    border-radius: 50%; display: flex; align-items: center; 
                                    justify-content: center; font-size: 1.5rem; font-weight: bold;">
                            ${guardia.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <strong style="font-size: 1.1rem; color: #0044cc;">${guardia.nombre}</strong>
                            <br>
                            <small style="color: #6c757d;">📧 ${guardia.email}</small>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
    console.log('Tabla cargada exitosamente');
}

// ==================== VER DETALLE DE GUARDIA ====================
function verDetalleGuardia(idGuardia) {
    console.log('Ver detalle de guardia:', idGuardia);
    const guardia = guardiasCargados.find(g => g.id === idGuardia);
    
    if (!guardia) {
        console.error('Guardia no encontrado:', idGuardia);
        return;
    }

    // Crear modal para mostrar información del guardia
    const modalExistente = document.getElementById('modal-detalle-guardia');
    if (modalExistente) {
        modalExistente.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'modal-detalle-guardia';
    modal.className = 'modal-guardia';
    modal.innerHTML = `
        <div class="modal-guardia-content">
            <span class="close-modal" onclick="cerrarModalGuardia()">&times;</span>
            <h2>📋 Información del Guardia</h2>
            
            <div class="info-guardia">
                <div class="info-item">
                    <strong>👤 Nombre:</strong>
                    <span>${guardia.nombre}</span>
                </div>
                
                <div class="info-item">
                    <strong>📧 Correo Electrónico:</strong>
                    <span>${guardia.email}</span>
                </div>
                
                <div class="info-item">
                    <strong>👮 Tipo de Usuario:</strong>
                    <span>Guardia</span>
                </div>
                
                <div class="info-item">
                    <strong>📅 Fecha de Registro:</strong>
                    <span>${guardia.fechaCreacion || 'No disponible'}</span>
                </div>
                
                ${guardia.fechaModificacion ? `
                    <div class="info-item">
                        <strong>🔄 Última Modificación:</strong>
                        <span>${guardia.fechaModificacion}</span>
                    </div>
                ` : ''}
            </div>
            
            <div class="modal-acciones">
                <button class="btn-modal btn-rondines" onclick="verRondinesGuardia(${guardia.id})">
                    🗺️ Ver Rondines
                </button>
                <button class="btn-modal btn-cerrar" onclick="cerrarModalGuardia()">
                    Cerrar
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'flex';

    // Agregar estilos si no existen
    if (!document.getElementById('estilos-modal-guardia')) {
        agregarEstilosModal();
    }
}

// ==================== CERRAR MODAL ====================
function cerrarModalGuardia() {
    const modal = document.getElementById('modal-detalle-guardia');
    if (modal) {
        modal.style.display = 'none';
        modal.remove();
    }
}

// ==================== VER RONDINES DEL GUARDIA ====================
function verRondinesGuardia(idGuardia) {
    const guardia = guardiasCargados.find(g => g.id === idGuardia);
    
    if (!guardia) return;

    // Guardar el ID del guardia en sessionStorage para usarlo en la página de rondines
    sessionStorage.setItem('guardiaSeleccionado', idGuardia);
    sessionStorage.setItem('nombreGuardia', guardia.nombre);
    sessionStorage.setItem('accesoPermitido', 'true');
    
    // Redirigir a la página de rondines
    window.location.href = 'Rondines.php';
}

// ==================== BÚSQUEDA DE GUARDIAS ====================
function inicializarBusqueda() {
    const formBusqueda = document.querySelector('.placeholder form');
    
    if (formBusqueda) {
        formBusqueda.addEventListener('submit', function(e) {
            e.preventDefault();
            const termino = this.busqueda.value;
            buscarGuardia(termino);
        });
        
        // Búsqueda en tiempo real mientras se escribe
        const inputBusqueda = formBusqueda.querySelector('input[name="busqueda"]');
        if (inputBusqueda) {
            inputBusqueda.addEventListener('input', function() {
                buscarGuardia(this.value);
            });
        }
    }
}

function buscarGuardia(termino) {
    termino = termino.toLowerCase().trim();
    
    if (!termino) {
        cargarTablaGuardias();
        return;
    }

    const guardiasFiltrados = guardiasCargados.filter(g => 
        g.nombre.toLowerCase().includes(termino) || 
        g.email.toLowerCase().includes(termino)
    );

    const tbody = document.querySelector('.guardias tbody');
    
    if (!tbody) return;

    if (guardiasFiltrados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td style="text-align: center; padding: 40px; color: #6c757d;">
                    <div style="font-size: 3rem; margin-bottom: 10px;">🔍</div>
                    <strong>No se encontraron guardias con ese criterio de búsqueda</strong>
                    <br><br>
                    <button onclick="cargarTablaGuardias(); document.querySelector('input[name=busqueda]').value='';" 
                            style="padding: 10px 20px; background: #0044cc; color: white; border: none; 
                                   border-radius: 6px; cursor: pointer; font-weight: bold;">
                        Ver todos los guardias
                    </button>
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    guardiasFiltrados.forEach(guardia => {
        html += `
            <tr onclick="verDetalleGuardia(${guardia.id})" style="cursor: pointer;"
                onmouseover="this.style.backgroundColor='#e3f2fd'" 
                onmouseout="this.style.backgroundColor=''">
                <td class="guardia-nombre">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="background: #0044cc; color: white; width: 50px; height: 50px; 
                                    border-radius: 50%; display: flex; align-items: center; 
                                    justify-content: center; font-size: 1.5rem; font-weight: bold;">
                            ${guardia.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <strong style="font-size: 1.1rem; color: #0044cc;">${guardia.nombre}</strong>
                            <br>
                            <small style="color: #6c757d;">📧 ${guardia.email}</small>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// ==================== AGREGAR ESTILOS DEL MODAL ====================
function agregarEstilosModal() {
    const style = document.createElement('style');
    style.id = 'estilos-modal-guardia';
    style.innerHTML = `
        .modal-guardia {
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
            animation: fadeIn 0.3s ease;
        }

        .modal-guardia-content {
            background-color: #fff;
            padding: 30px;
            border-radius: 12px;
            width: 90%;
            max-width: 600px;
            position: relative;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            animation: slideDown 0.3s ease;
        }

        .close-modal {
            position: absolute;
            right: 20px;
            top: 20px;
            font-size: 28px;
            font-weight: bold;
            color: #999;
            cursor: pointer;
            transition: color 0.3s ease;
        }

        .close-modal:hover {
            color: #333;
        }

        .modal-guardia-content h2 {
            color: #0044cc;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 3px solid #0044cc;
            font-size: 1.5rem;
        }

        .info-guardia {
            margin: 20px 0;
        }

        .info-item {
            display: flex;
            justify-content: space-between;
            padding: 15px;
            margin: 10px 0;
            background-color: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #0044cc;
            transition: all 0.3s ease;
        }

        .info-item:hover {
            background-color: #e3f2fd;
            transform: translateX(5px);
        }

        .info-item strong {
            color: #0044cc;
            font-size: 1rem;
        }

        .info-item span {
            color: #333;
            font-weight: 500;
        }

        .modal-acciones {
            display: flex;
            gap: 10px;
            margin-top: 25px;
            justify-content: flex-end;
        }

        .btn-modal {
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            transition: all 0.3s ease;
        }

        .btn-rondines {
            background-color: #0044cc;
            color: white;
        }

        .btn-rondines:hover {
            background-color: #0033aa;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 68, 204, 0.3);
        }

        .btn-cerrar {
            background-color: #6c757d;
            color: white;
        }

        .btn-cerrar:hover {
            background-color: #5a6268;
            transform: translateY(-2px);
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }

        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @media (max-width: 768px) {
            .modal-guardia-content {
                width: 95%;
                padding: 20px;
            }

            .info-item {
                flex-direction: column;
                gap: 5px;
            }

            .modal-acciones {
                flex-direction: column;
            }

            .btn-modal {
                width: 100%;
            }
        }
    `;
    document.head.appendChild(style);
}

// Hacer funciones globales
window.verDetalleGuardia = verDetalleGuardia;
window.cerrarModalGuardia = cerrarModalGuardia;
window.verRondinesGuardia = verRondinesGuardia;
window.cargarTablaGuardias = cargarTablaGuardias;
window.buscarGuardia = buscarGuardia;