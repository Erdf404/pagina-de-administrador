<?php require_once __DIR__ . '/../includes/verificar_permiso.php'; ?>
<!-- Verifica si el usuario ha iniciado sesión -->
<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8" />
  <title>Eliminar usuarios</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="../assets/css/estilos.css" />
</head>

<body>
  <header>
    <div id="logo">
      <img src="../assets/img/logo-tsj.png" />
    </div>

    <div class="placeholder">
      <form method="POST" action="" onsubmit="event.preventDefault(); buscarUsuario(this.busqueda.value);">
        <input type="text" name="busqueda" placeholder="Buscar guardia......" />
        <button type="submit">Buscar</button>
      </form>
    </div>

    <div id="user-info">
      <div class="user-dropdown">
        <button class="user-button">☰</button>
        <!-- Botón para desplegar el menú de usuario -->
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
            <?php endif; ?>

            <!-- Solo Admin A2 y A3 -->
            <?php if (tienePermiso('modificar_usuarios')): ?>
              <button onclick="window.location.href='../pages/Modificar-usuario.php'">Modificar usuario</button>
            <?php endif; ?>

            <!-- Solo Admin A3 -->
            <?php if (tienePermiso('agregar_usuarios')): ?>
              <button onclick="window.location.href='../pages/Agregar-Usuario.php'">Agregar usuario</button>
            <?php endif; ?>
            <!-- Botones para navegar a diferentes secciones -->
        </div>
      </div>
    </div>
  </header>

  <main>
    <div class="filtros">
      <button class="filtro filtro-a" onclick="filtrarPorTipo('A')">A</button>
      <button class="filtro filtro-g" onclick="filtrarPorTipo('G')">G</button>
      <button class="filtro" onclick="cargarTablaEliminar()">Todos</button>
    </div>


    <table class="guardias">
      <thead>
        <tr>
          <th>Usuario </th>
          <th>Tipo de Usuario</th>
          <th>Eliminar</th>
        </tr>
      </thead>
      <!-- Encabezados de la tabla -->

      <tbody>
        <tr>
          <td>Nombre de usuario</td>
          <td>Administrador/Guardia</td>
          <td class="eliminar">✖</td>
        </tr>
        <!-- Fila de ejemplo para un usuario existente -->
      </tbody>
    </table>
  </main>
  <!-- Scripts -->
  <!-- agrega el script.js -->
  <script src="../assets/js/script.js"></script>

  <!-- agrega el script_usuarios.js -->
  <script src="../assets/js/script_usuarios.js"></script>
</body>

</html>