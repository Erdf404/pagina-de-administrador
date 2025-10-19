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