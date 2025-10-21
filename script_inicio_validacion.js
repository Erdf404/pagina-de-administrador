
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
// ==================== Indicador de carga (solo sera visible cuando se use una base de datos en un servidor) ====================
function mostrarCargando(mostrar) {
  const submitBtn = document.querySelector('.box button[type="submit"]');
  if (!submitBtn) return;

  if (mostrar) {
    submitBtn.disabled = true;
    submitBtn.dataset.textoOriginal = submitBtn.textContent;
    submitBtn.textContent = 'Validando...';
    submitBtn.style.opacity = '0.7';
  } else {
    submitBtn.disabled = false;
    submitBtn.textContent = submitBtn.dataset.textoOriginal || 'Entrar';
    submitBtn.style.opacity = '1';
  }
}
// ==================== Recuperacion de contraseña (De momento solo estetico) ====================
async function recuperarContrasena() {
  const emailInput = document.querySelector('#recoverModal input[type="email"]');
  if (!emailInput) return;

  const email = emailInput.value.trim();
  if (!email) return mostrarMensaje('⚠️ Ingresa tu correo electrónico', 'error');
  if (!validarFormatoEmail(email)) return mostrarMensaje('⚠️ Correo electrónico inválido', 'error');

  const usuario = UsuariosDB.getByEmail(email);
  if (!usuario) return mostrarMensaje('❌ No se encontró un usuario con ese correo', 'error');

  mostrarMensaje(`✅ Se envió un enlace de recuperación a ${email}`, 'exito');

  if (window.closeModal) window.closeModal();
  emailInput.value = '';
}
// ==================== Agregar estilos para los mensajes ====================
function agregarEstilosMensajes() {
  if (document.getElementById('estilos-login-mensajes')) return;

  const style = document.createElement('style');
  style.id = 'estilos-login-mensajes';
  style.innerHTML = `
    .mensaje-login {
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 8px;
      font-weight: bold;
      text-align: center;
      animation: slideDown 0.3s ease;
      display: none;
    }
    .mensaje-error {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
    .mensaje-exito {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .box button[type="submit"]:disabled {
      cursor: not-allowed;
      background-color: #6c757d !important;
    }
  `;
  document.head.appendChild(style);
}
// Agregar estilos al cargar
agregarEstilosMensajes();

