
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

// ==================== Inicializacion ====================
document.addEventListener('DOMContentLoaded', function() {
  if (document.querySelector('.box') && document.getElementById('password')) {
    inicializarLogin();
  }
});

// ==================== Configuración del formulario de login ====================
function inicializarLogin() {
  const form = document.querySelector('.box form');
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    await validarLogin();
  });

  console.log('✅ Sistema de validación de login inicializado');
}
// ==================== Validacion de Login ====================
async function validarLogin() {
  const emailInput = document.querySelector('input[type="email"]');
  const passwordInput = document.getElementById('password');
  if (!emailInput || !passwordInput) return mostrarMensaje('Error al obtener los campos', 'error');

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  // Validaciones basicas de los campos
  if (!email) return mostrarMensaje('⚠️ Ingresa tu correo electrónico', 'error');
  if (!validarFormatoEmail(email)) return mostrarMensaje('⚠️ Correo electrónico inválido', 'error');
  if (!password) return mostrarMensaje('⚠️ Ingresa tu contraseña', 'error');

  mostrarCargando(true);

  try {
    const resultado = UsuariosDB.validarCredenciales(email, password);
    if (resultado.valido) {
      await loginExitoso(resultado.usuario);
    } else {
      mostrarMensaje(`❌ ${resultado.mensaje}`, 'error');
      passwordInput.value = '';
      passwordInput.focus();
    }
  } catch (error) {
    console.error('Error al validar login:', error);
    mostrarMensaje('❌ Error al validar las credenciales. Intenta de nuevo.', 'error');
  } finally {
    mostrarCargando(false);
  }
}
// ==================== Login exitoso ====================
async function loginExitoso(usuario) {
  sessionStorage.setItem('usuarioActual', JSON.stringify(usuario));
  sessionStorage.setItem('accesoPermitido', 'true');
  sessionStorage.setItem('loginTimestamp', new Date().getTime());

  mostrarMensaje(`✅ ¡Bienvenido, ${usuario.nombre}!`, 'exito');

  // Redirigir tras un pequeño delay
  setTimeout(() => {
    window.location.href = 'Busqueda-guardia.php';
  }, 1000);
}

// ==================== Validacion de formato de email ====================
function validarFormatoEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
// ==================== Mensajes de UI (Error, Exito) ====================
function mostrarMensaje(mensaje, tipo = 'error') {
  let mensajeDiv = document.getElementById('mensaje-login');
  if (!mensajeDiv) {
    mensajeDiv = document.createElement('div');
    mensajeDiv.id = 'mensaje-login';
    const box = document.querySelector('.box');
    if (box) box.insertBefore(mensajeDiv, box.firstChild);
  }

  mensajeDiv.className = `mensaje-login mensaje-${tipo}`;
  mensajeDiv.textContent = mensaje;
  mensajeDiv.style.display = 'block';

  if (tipo === 'error') {
    setTimeout(() => mensajeDiv.style.display = 'none', 4000);
  }
}