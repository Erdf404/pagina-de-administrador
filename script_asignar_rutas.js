// script_asignar_rutas.js

// ==================== Capa de datos Asignaciones ====================
const AsignacionesDB = {

  // Obtener todas las asignaciones
    async getAll() {
    const data = localStorage.getItem('asignacionesGuardadas');
    return data ? JSON.parse(data) : [];
    },

  // Obtener una asignación por ID
    async getById(id) {
    const asignaciones = await this.getAll();
    return asignaciones.find(a => a.id === id);
    },

  // Crear nueva asignación
    async create(asignacion) {
    const asignaciones = await this.getAll();
    const contador = await this.getContador();
    
    asignacion.id = contador;
    asignaciones.push(asignacion);
    
    localStorage.setItem('asignacionesGuardadas', JSON.stringify(asignaciones));
    localStorage.setItem('contadorAsignaciones', contador + 1);
    
    return asignacion;
    },

  // Actualizar asignacion existente
    async update(id, datosActualizados) {
    const asignaciones = await this.getAll();
    const index = asignaciones.findIndex(a => a.id === id);
    
    if (index !== -1) {
    asignaciones[index] = { ...asignaciones[index], ...datosActualizados };
    localStorage.setItem('asignacionesGuardadas', JSON.stringify(asignaciones));
    return asignaciones[index];
    }
    return null;
},

  // Eliminar asignacion
async delete(id) {
    const asignaciones = await this.getAll();
    const filtradas = asignaciones.filter(a => a.id !== id);
    localStorage.setItem('asignacionesGuardadas', JSON.stringify(filtradas));
    return true;
},

  // Obtener asignaciones por guardia
async getByGuardia(guardiaId) {
    const asignaciones = await this.getAll();
    return asignaciones.filter(a => a.guardiaId === guardiaId);
},

  // Obtener contador de IDs
async getContador() {
    const contador = localStorage.getItem('contadorAsignaciones');
    return contador ? parseInt(contador) : 1;
}
};
// ==================== Variables Globales ====================
let asignacionesGuardadas = [];

// ==================== Inicializacion ====================
document.addEventListener('DOMContentLoaded', async function() {
  await cargarAsignaciones();

  if (document.getElementById('container-asignaciones')) {
    await inicializarAsignaciones();
  }
});

async function inicializarAsignaciones() {
  await cargarGuardiasSelect();
  await cargarRutasSelect();
  await actualizarTablaAsignaciones();

  const formAsignar = document.getElementById('form-asignar-ruta');
  if (formAsignar) {
    formAsignar.addEventListener('submit', async function(e) {
      e.preventDefault();
      await asignarRuta();
    });
  }
}
// ==================== Cargar selectores de rutas y guardias ====================
async function cargarGuardiasSelect() {
  const select = document.getElementById('select-guardia');
  if (!select) return;
  
  let guardias = [];
  if (window.UsuariosDB) {
    guardias = await window.UsuariosDB.getGuardias();
  } else if (window.obtenerGuardias) {
    guardias = window.obtenerGuardias();
  }

  select.innerHTML = '<option value="">-- Selecciona un guardia --</option>';
  
  guardias.forEach(guardia => {
    select.innerHTML += `<option value="${guardia.id}">${guardia.nombre} (${guardia.email})</option>`;
  });

  if (guardias.length === 0) {
    select.innerHTML = '<option value="">No hay guardias registrados</option>';
  }
}

async function cargarRutasSelect() {
  const select = document.getElementById('select-ruta');
  if (!select) return;
  
  const rutasGuardadas = JSON.parse(localStorage.getItem('rutasGuardadas') || '[]');

  select.innerHTML = '<option value="">-- Selecciona una ruta --</option>';
  
  rutasGuardadas.forEach(ruta => {
    select.innerHTML += `<option value="${ruta.id}">${ruta.nombre} (${ruta.puntos.length} puntos)</option>`;
  });

  if (rutasGuardadas.length === 0) {
    select.innerHTML = '<option value="">No hay rutas creadas</option>';
  }
}
