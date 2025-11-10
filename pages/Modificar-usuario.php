<?php require_once __DIR__ . '/../includes/verificar_permiso.php'; ?>
<!-- Verifica si el usuario ha iniciado sesión -->
<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Modificar Usuarios</title>
  <link rel="stylesheet" href="../assets/css/estilos.css" />
</head>

<body>
  <header>
    <div id="logo">
      <img src="../assets/img/logo-tsj.png" alt="Logo del TSJ" />
    </div>
    <div id="user-info">
      <div class="user-dropdown">
        <button class="user-button">☰</button>
        <div class="dropdown-menu">
          <button>Datos del usuario actual</button>
          <button onclick="window.location.href='../pages/cerrar_sesion.php'">Cerrar sesión</button>
            <!-- Solo para Guardias -->
            <?php if (esGuardia()): ?>
              <button onclick="window.location.href='../pages/Rondines.php'">Mis Rondines</button>
            <?php endif; ?>

            <!-- Solo para Administradores -->
            <?php if (esAdministrador()): ?>
              <button onclick="window.location.href='../pages/Busqueda-guardia.php'">Buscar guardias</button>
              <button onclick="window.location.href='../pages/Rondines.php'">Buscar rondines</button>
              <button onclick="window.location.href='../pages/Rutas.php'">Crear rutas</button>
              <button onclick="window.location.href='../pages/Asignar-rutas.php'">Asignar rutas</button>
              <button onclick="window.location.href='../pages/Agregar-Usuario.php'">Agregar usuario</button>
              <button onclick="window.location.href='../pages/Eliminar-usuario.php'">Eliminar usuario</button>
            <?php endif; ?>
            <!-- Botones para navegar a diferentes secciones -->
        </div>
      </div>
    </div>
  </header>

  <main class="table-main">
    <h1>Modificar Usuarios</h1>
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Correo Electrónico</th>
          <th>Tipo de Usuario</th>
          <th>Contraseña</th>
          <th>Guardar</th>
        </tr>
      </thead>
      <!-- Encabezados de la tabla -->
      <tbody>
        <tr>
          <td colspan="5" style="text-align: center; padding: 20px; color: #6c757d;">
            Cargando usuarios...
          </td>
        </tr>
        <!-- Los usuarios se cargarán dinámicamente desde JavaScript -->
      </tbody>
    </table>
  </main>
</body>
<!-- agrega el script.js -->
<script src="../assets/js/script.js"></script>

<!-- agrega el script_usuarios.js -->
<script src="../assets/js/script_usuarios.js"></script>

</html>