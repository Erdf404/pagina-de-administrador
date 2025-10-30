<?php require_once 'verificar_sesion.php'; ?>
<!-- Verifica si el usuario ha iniciado sesión -->
<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Rondines</title>
  <link rel="stylesheet" href="estilos.css" />
</head>

<body>
  <header>
    <div id="logo">
      <img src="logo-tsj.png" />
      <!-- Logotipo del TSJ -->
    </div>

    <div class="calendario">
      <button type="submit">Buscar</button>
    </div>

    <div id="user-info">
      <div class="user-dropdown">
        <button class="user-button">☰</button>
        <div class="dropdown-menu">
          <button>Datos del usuario actual</button>
          <button onclick="window.location.href='cerrar_sesion.php'">Cerrar sesión</button>
          <!-- Solo para Guardias -->
          <?php if (esGuardia()): ?>
            <button onclick="window.location.href='Rondines.php'">Mis Rondines</button>
          <?php endif; ?>

          <!-- Solo para Administradores -->
          <?php if (esAdministrador()): ?>
            <button onclick="window.location.href='Busqueda-guardia.php'">Buscar guardias</button>
            <button onclick="window.location.href='Rutas.php'">Crear rutas</button>
            <button onclick="window.location.href='Asignar-rutas.php'">Asignar rutas</button>
          <?php endif; ?>

          <!-- Solo Admin A2 y A3 -->
          <?php if (tienePermiso('modificar_usuarios')): ?>
            <button onclick="window.location.href='Modificar-usuario.php'">Modificar usuario</button>
          <?php endif; ?>

          <!-- Solo Admin A3 -->
          <?php if (tienePermiso('agregar_usuarios')): ?>
            <button onclick="window.location.href='Agregar-Usuario.php'">Agregar usuario</button>
          <?php endif; ?>
          <?php if (tienePermiso('eliminar_usuarios')): ?>
            <button onclick="window.location.href='Eliminar-usuario.php'">Eliminar usuario</button>
          <?php endif; ?>
          <!-- Botones para navegar a diferentes secciones -->
        </div>
      </div>
    </div>
  </header>

  <main>
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
  <script src="script_rondines.js"></script>
  <script src="script2.js"></script>
  <script src="script.js"></script>
</body>

</html>