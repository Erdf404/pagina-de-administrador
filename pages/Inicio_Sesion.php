<?php
// Verifica si el usuario ya tiene una sesión activa
// Verifica si el usuario ya tiene una sesión activa
require_once __DIR__ . '/../config/config.php';

if (verificarSesion()) {
  // Redirigir según tipo de usuario
  $tipo = obtenerTipoUsuario();
  if ($tipo === 1) {
      // Guardia -> Rondines
      header('Location: ../pages/Rondines.php');
  } else {
      // Admin -> Busqueda guardias
      header('Location: ../pages/Busqueda-guardia.php');
  }
  exit();
}

$mensaje = '';
if (isset($_GET['mensaje']) && $_GET['mensaje'] === 'sesion_cerrada') {
  $mensaje = 'Sesión cerrada exitosamente';
}
?>
<!DOCTYPE html>
<html lang="es">
<!-- Declaración del tipo de documento y el idioma de la página -->

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <!-- Metaetiqueta para la configuración de la vista en dispositivos móviles -->
  <title>Página de Inicio de Sesión</title>
  <!-- Título de la página web -->
  <link rel="stylesheet" href="../assets/css/Inicio.css" />
  <!-- Enlace al archivo CSS para estilos -->
</head>

<body>
  <img src="../assets/img/logo-tsj.png" alt="Logo del TSJ" class="logo" />
  <div class="box">
    <h1>Iniciar Sesión</h1>
    <!-- Título de la sección de inicio de sesión -->
    <?php if ($mensaje): ?>
      <div style="padding: 12px; margin-bottom: 15px; background: #d4edda; color: #155724; border-radius: 6px;">
        ✅ <?php echo htmlspecialchars($mensaje); ?>
      </div>
    <?php endif; ?>
    <!-- Mostrar mensaje de sesion cerrada exitosamente -->

    <form method="post">
      <input type="email" placeholder="Usuario" required />
      <!-- Campo de entrada para el usuario -->

      <div class="password-container">
        <!-- Contenedor para la contraseña -->
        <input
          type="password"
          id="password"
          placeholder="Contraseña"
          required /> <!-- Campo de entrada para la contraseña -->
        <span class="toggle-password" onclick="togglePassword()">👁</span>
        <!-- Icono para alternar la visibilidad de la contraseña -->
      </div>

      <button type="submit">Entrar</button>
      <!-- Botón para enviar el formulario -->
      <button type="button" class="recover-button" onclick="openModal()">
        <!-- Botón para abrir la ventana modal de recuperación de usuario -->
        Recuperar Usuario
      </button>
    </form>
  </div>

  <!-- Ventana modal para recuperación de usuario -->
  <div class="modal" id="recoverModal">
    <!-- Contenedor de la ventana modal -->
    <div class="modal-content">
      <!-- Contenido de la ventana modal -->
      <span class="close" onclick="closeModal()">&times;</span>
      <!-- Botón para cerrar la ventana modal -->
      <h2>Recuperar Usuario</h2>
      <!-- Título de la ventana modal -->
      <p>Por favor, ingresa tu correo electrónico:</p>
      <!-- Instrucción para el usuario -->
      <input type="email" placeholder="Correo electrónico" required />
      <!-- Campo de entrada para el correo electrónico -->
      <button type="button" onclick="recuperarContrasena()">Enviar</button>
      <!-- Botón para enviar la solicitud de recuperación -->
    </div>
  </div>
  <!-- agrega el script.js -->
  <script src="../assets/js/script.js"></script>
  <!-- agrega el script_inicio_validacion.js -->
  <script src="../assets/js/script_inicio_validacion.js"></script>
</body>

</html>