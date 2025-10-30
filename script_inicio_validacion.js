
// script_inicio_validacion.js - Validación de inicio de sesión optimizado

// ==================== Capa de datos Usuarios ====================
const UsuariosDB = {

  // Validar credenciales de usuario mediante API
  async validarCredenciales(email, password) {
    try {
      const response = await fetch('api_usuarios.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accion: 'login',
          email: email,
          password: password
        })
      });

      const resultado = await response.json();
      return resultado;
    } catch (error) {
      console.error('Error al validar credenciales:', error);
      return { valido: false, mensaje: 'Error de conexión con el servidor' };
    }
  },

  // Recuperar contraseña (enviar email)
  async recuperarPassword(email) {
    try {
      const response = await fetch('api_usuarios.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accion: 'recuperar_password',
          email: email
        })
      });

      const resultado = await response.json();
      return resultado;
    } catch (error) {
      console.error('Error al recuperar contraseña:', error);
      return { exito: false, mensaje: 'Error de conexión con el servidor' };
    }
  }
};

// ==================== Inicialización ====================
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

// ==================== Validación de Login ====================
async function validarLogin() {
  const emailInput = document.querySelector('input[type="email"]');
  const passwordInput = document.getElementById('password');
  
  if (!emailInput || !passwordInput) {
    return mostrarMensaje('Error al obtener los campos', 'error');
  }

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  // Validaciones básicas de los campos
  if (!email) {
    return mostrarMensaje('⚠️ Ingresa tu correo electrónico', 'error');
  }
  
  if (!validarFormatoEmail(email)) {
    return mostrarMensaje('⚠️ Correo electrónico inválido', 'error');
  }
  
  if (!password) {
    return mostrarMensaje('⚠️ Ingresa tu contraseña', 'error');
  }

  mostrarCargando(true);

  try {
    const resultado = await UsuariosDB.validarCredenciales(email, password);
    
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
    window.location.href = 'Rondines.php';
  }, 1000);
}

// ==================== Validación de formato de email ====================
function validarFormatoEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// ==================== Mensajes de UI (Error, Éxito) ====================
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

// ==================== Indicador de carga ====================
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

// ==================== Recuperación de contraseña ====================
async function recuperarContrasena() {
  const emailInput = document.querySelector('#recoverModal input[type="email"]');
  if (!emailInput) return;

  const email = emailInput.value.trim();
  
  if (!email) {
    return mostrarMensaje('⚠️ Ingresa tu correo electrónico', 'error');
  }
  
  if (!validarFormatoEmail(email)) {
    return mostrarMensaje('⚠️ Correo electrónico inválido', 'error');
  }

  // Mostrar indicador de carga
  const btnEnviar = document.querySelector('#recoverModal button');
  if (btnEnviar) {
    btnEnviar.disabled = true;
    btnEnviar.textContent = 'Enviando...';
  }

  try {
    const resultado = await UsuariosDB.recuperarPassword(email);
    
    if (resultado.exito) {
      mostrarMensaje(`✅ ${resultado.mensaje}`, 'exito');
      if (window.closeModal) window.closeModal();
      emailInput.value = '';
    } else {
      mostrarMensaje(`❌ ${resultado.mensaje}`, 'error');
    }
  } catch (error) {
    console.error('Error al recuperar contraseña:', error);
    mostrarMensaje('❌ Error al procesar la solicitud', 'error');
  } finally {
    if (btnEnviar) {
      btnEnviar.disabled = false;
      btnEnviar.textContent = 'Enviar';
    }
  }
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

// ==================== Manejo de sesión ====================
function verificarSesionActiva() {
  const usuarioActual = sessionStorage.getItem('usuarioActual');
  const loginTimestamp = sessionStorage.getItem('loginTimestamp');

  if (usuarioActual && loginTimestamp) {
    const tiempoTranscurrido = new Date().getTime() - parseInt(loginTimestamp);
    const OCHO_HORAS = 8 * 60 * 60 * 1000;

    if (tiempoTranscurrido < OCHO_HORAS) {
      return JSON.parse(usuarioActual);
    } else {
      cerrarSesion();
    }
  }
  return null;
}

function obtenerUsuarioActual() {
  const usuario = sessionStorage.getItem('usuarioActual');
  return usuario ? JSON.parse(usuario) : null;
}

function cerrarSesion() {
  sessionStorage.removeItem('usuarioActual');
  sessionStorage.removeItem('accesoPermitido');
  sessionStorage.removeItem('loginTimestamp');
  sessionStorage.removeItem('guardiaSeleccionado');
  sessionStorage.removeItem('nombreGuardia');
  window.location.href = 'Inicio_Sesion.php';
}

// ==================== Funciones globales ====================
window.UsuariosDB = UsuariosDB;
window.recuperarContrasena = recuperarContrasena;
window.verificarSesionActiva = verificarSesionActiva;
window.obtenerUsuarioActual = obtenerUsuarioActual;
window.cerrarSesion = cerrarSesion;