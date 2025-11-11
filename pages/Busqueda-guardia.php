<?php require_once __DIR__ . '/../includes/verificar_permiso.php';?>
<!-- Verifica si el usuario ha iniciado sesión -->
<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8" />
  <title>Busqueda de guardias</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="../assets/css/estilos.css" />
</head>

<body>
  <header>
    <div id="logo">
      <img src="../assets/img/logo-tsj.png" />
      <!-- Logotipo del TSJ -->
    </div>

    <div class="placeholder">
      <form method="POST" action="">
        <input type="text" name="busqueda" placeholder="Buscar guardia......"/>
        <button type="submit">Buscar</button>
      </form>
    </div>

    <div id="user-info">
      <div class="user-dropdown">
        <button class="user-button">☰</button>
        <div class="dropdown-menu">
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
              <button onclick="window.location.href='../pages/Rondines.php'">Buscar rondines</button>
              <button onclick="window.location.href='../pages/Rutas.php'">Crear rutas</button>
              <button onclick="window.location.href='../pages/Asignar-rutas.php'">Asignar rutas</button>
              <button onclick="window.location.href='../pages/Modificar-usuario.php'">Modificar usuario</button>
              <button onclick="window.location.href='../pages/Agregar-Usuario.php'">Agregar usuario</button>
              <button onclick="window.location.href='../pages/Eliminar-usuario.php'">Eliminar usuario</button>
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
  <script src="../assets/js/script_busqueda_guardia.js"></script>
  <!-- agrega el script.js -->
  <script src="../assets/js/script.js"></script>
</body>

</html>