<?php require_once __DIR__ . '/../includes/verificar_permiso.php'; ?>
<!-- Verifica si el usuario ha iniciado sesión -->
<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Rondines</title>
  <link rel="stylesheet" href="../assets/css/estilos.css" />
</head>

<body>
  <header>
    <div id="logo">
      <img src="../assets/img/logo-tsj.png" />
      <!-- Logotipo del TSJ -->
    </div>

    <div class="calendario">
      <!-- Mostrar nombre del guardia si viene de búsqueda -->
      <span id="nombre-guardia-display" class="nombre-guardia-header" style="display: none;"></span>
      
      <!-- Botón Ver Todos solo para administradores -->
      <?php if (esAdministrador()): ?>
        <button type="button" id="btn-ver-todos" onclick="verTodos()" style="display: none;">Ver Todos</button>
      <?php endif; ?>
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

            <!-- Solo para Encargados -->
            <?php if (esEncargado()): ?>
              <button onclick="window.location.href='../pages/Rondines.php'">Buscar Rondines</button>
              <button onclick="window.location.href='../pages/Busqueda-guardia.php'">Buscar guardias</button>
              <button onclick="window.location.href='../pages/Asignar-rutas.php'">Asignar rutas</button>
            <?php endif; ?>
            
          <!-- Solo para Administradores -->
          <?php if (esAdministrador()): ?>
            <button onclick="window.location.href='../pages/Busqueda-guardia.php'">Buscar guardias</button>
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
          <?php if (tienePermiso('eliminar_usuarios')): ?>
            <button onclick="window.location.href='../pages/Eliminar-usuario.php'">Eliminar usuario</button>
          <?php endif; ?>
          <!-- Botones para navegar a diferentes secciones -->
        </div>
      </div>
    </div>
  </header>

  <main>
    <!-- Filtros de fecha -->
    <div class="filtros-rondines">
      <div class="filtro-fecha">
        <label for="fecha-inicio">Desde:</label>
        <input type="date" id="fecha-inicio" />
      </div>
      
      <div class="filtro-fecha">
        <label for="fecha-fin">Hasta:</label>
        <input type="date" id="fecha-fin" />
      </div>
      
      <button class="btn-filtrar" onclick="filtrarPorFecha()">🔍 Filtrar</button>
      <button class="btn-limpiar" onclick="limpiarFiltros()">✖ Limpiar</button>
    </div>

    <table class="guardias">
      <thead>
        <tr>
          <th>Fecha del recorrido</th>
          <th>Hora de inicio</th>
          <th>Hora de fin</th>
          <th>Tipo de recorrido</th>
          <th>Mapa</th>
        </tr>
      </thead>

      <tbody>
        <tr>
          <td colspan="5" style="text-align: center; padding: 40px; color: #6c757d;">
            <div style="font-size: 3rem; margin-bottom: 10px;">📋</div>
            <strong>Cargando rondines...</strong>
          </td>
        </tr>
      </tbody>
    </table>
  </main>

  <!-- Scripts -->
  <script src="../assets/js/script_rondines.js"></script>
  <script src="../assets/js/script.js"></script>
</body>

</html>