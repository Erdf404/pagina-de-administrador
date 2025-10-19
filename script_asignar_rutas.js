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
// ==================== Asignar rutas ====================
async function asignarRuta() {
  const guardiaId = parseInt(document.getElementById('select-guardia').value);
  const rutaId = parseInt(document.getElementById('select-ruta').value);
  const horaInicio = document.getElementById('hora-inicio').value;
  const horaFin = document.getElementById('hora-fin').value;
  const fecha = document.getElementById('fecha-asignacion').value;
  const radioTolerancia = parseInt(document.getElementById('radio-tolerancia').value);

  // Validaciones básicas
  if (!guardiaId) return alert('⚠️ Por favor, selecciona un guardia.');
  if (!rutaId) return alert('⚠️ Por favor, selecciona una ruta.');
  if (!horaInicio || !horaFin) return alert('⚠️ Especifica hora de inicio y fin.');
  if (!fecha) return alert('⚠️ Selecciona una fecha.');
  if (!radioTolerancia || radioTolerancia < 5 || radioTolerancia > 500)
    return alert('⚠️ Radio de tolerancia entre 5 y 500 metros.');
  if (horaFin <= horaInicio)
    return alert('⚠️ La hora de finalización debe ser posterior.');

  // Obtener datos de guardia y ruta
  let guardia = null;
  if (window.UsuariosDB) guardia = await window.UsuariosDB.getById(guardiaId);
  else if (window.obtenerUsuarios) {
    const usuarios = window.obtenerUsuarios();
    guardia = usuarios.find(g => g.id === guardiaId);
  }

  const rutasGuardadas = JSON.parse(localStorage.getItem('rutasGuardadas') || '[]');
  const ruta = rutasGuardadas.find(r => r.id === rutaId);
  if (!guardia || !ruta) return alert('⚠️ Error al obtener información.');

  // Verificar conflicto de horario
  const conflicto = asignacionesGuardadas.some(a => 
    a.guardiaId === guardiaId && a.fecha === fecha &&
    ((horaInicio >= a.horaInicio && horaInicio < a.horaFin) ||
    (horaFin > a.horaInicio && horaFin <= a.horaFin) ||
    (horaInicio <= a.horaInicio && horaFin >= a.horaFin))
  );
  if (conflicto && !confirm('⚠️ Ya existe una asignación en ese horario. ¿Continuar?')) return;

  // Crear objeto
  const nuevaAsignacion = {
    guardiaId,
    guardiaNombre: guardia.nombre,
    guardiaEmail: guardia.email,
    rutaId,
    rutaNombre: ruta.nombre,
    rutaPuntos: ruta.puntos.length,
    fecha,
    horaInicio,
    horaFin,
    radioTolerancia,
    fechaCreacion: new Date().toLocaleString('es-ES')
  };

  try {
    await AsignacionesDB.create(nuevaAsignacion);
    await cargarAsignaciones();
    await actualizarTablaAsignaciones();
    mostrarMensajeAsignacion('✅ Ruta asignada exitosamente', 'success');
    document.getElementById('form-asignar-ruta').reset();
  } catch (error) {
    console.error('Error al guardar asignación:', error);
    alert('❌ Error al guardar la asignación.');
  }
}
// ==================== Actualizar tabla ====================
async function actualizarTablaAsignaciones() {
  const tbody = document.getElementById('tbody-asignaciones');
  if (!tbody) return;

  if (asignacionesGuardadas.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="sin-datos">
          No hay asignaciones registradas aún
        </td>
      </tr>
    `;
    return;
  }

  const asignacionesOrdenadas = [...asignacionesGuardadas].sort((a, b) => {
    const fechaA = new Date(a.fecha + ' ' + a.horaInicio);
    const fechaB = new Date(b.fecha + ' ' + b.horaInicio);
    return fechaB - fechaA;
  });

  let html = '';
  asignacionesOrdenadas.forEach(asignacion => {
    html += `
      <tr>
        <td><strong>${asignacion.guardiaNombre}</strong><br>
          <small>${asignacion.guardiaEmail}</small>
        </td>
        <td><strong>${asignacion.rutaNombre}</strong><br>
          <small>${asignacion.rutaPuntos} puntos - Radio: ${asignacion.radioTolerancia}m</small>
        </td>
        <td>${formatearFecha(asignacion.fecha)}</td>
        <td>${asignacion.horaInicio}</td>
        <td>${asignacion.horaFin}</td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}
