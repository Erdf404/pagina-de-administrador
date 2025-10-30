<?php require_once 'verificar_sesion.php'; ?>
<!-- Verifica si el usuario ha iniciado sesión -->
<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8" />
  <title>Busqueda de guardias</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="estilos.css" />
</head>

<body>
  <header>
    <div id="logo">
      <img src="logo-tsj.png" />
      <!-- Logotipo del TSJ -->
    </div>

    <div class="placeholder">
      <form method="POST" action="">
        <input type="text" name="busqueda" placeholder="Buscar guardia......" ? />
        <button type="submit">Buscar</button>
      </form>
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
              <button onclick="window.location.href='Rondines.php'">Buscar rondines</button>
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
          <th>Guardia</th>
        </tr>
      </thead>

      <tbody>
        <tr>
          <td class="guardia-nombre">Nombre de guardia</td>
        </tr>
      </tbody>
    </table>
  </main>
  <!-- agrega el script_busqueda_guardia.js -->
  <script src="script_busqueda_guardia.js"></script>
  <!-- agrega el script2.js -->
  <script src="script2.js"></script>
  <!-- agrega el script.js -->
  <script src="script.js"></script>
</body>

</html>