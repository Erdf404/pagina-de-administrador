
// script_inicio_validacion.js - Validación de inicio de sesión optimizado

// ==================== Capa de datos Usuarios ====================
const UsuariosDB = {

  // Obtener todos los usuarios guardados en localStorage
  getAll() {
    const data = localStorage.getItem('usuariosGuardados');
    return data ? JSON.parse(data) : [];
  },

  // Obtener usuario por email (sin sensibilidad a mayúsculas)
  getByEmail(email) {
    const usuarios = this.getAll();
    return usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  // Validar credenciales de usuario
  validarCredenciales(email, password) {
    const usuario = this.getByEmail(email);

    if (!usuario) {
      return { valido: false, mensaje: 'Usuario no encontrado' };
    }

    if (usuario.password !== password) {
      return { valido: false, mensaje: 'Contraseña incorrecta' };
    }

    return { valido: true, usuario, mensaje: 'Credenciales válidas' };
  },

  // Obtener usuarios por tipo ("usuario" o "administrador")
  getByTipo(tipo) {
    const usuarios = this.getAll();
    return usuarios.filter(u => u.tipoUsuario === tipo);
  }
};

