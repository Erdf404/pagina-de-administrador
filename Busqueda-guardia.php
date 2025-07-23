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
          <button onclick="window.location.href='Modificar-usuario.php'">Modificar usuario</button>
          <button onclick="window.location.href='Inicio_Sesion.php'">Cerrar sesión</button>
          <button onclick="window.location.href='Agregar-Usuario.php'">Agregar usuario</button>
          <button onclick="window.location.href='Eliminar-usuario.php'">Eliminar usuario</button>
          <button onclick="window.location.href='Rondines.php'">Buscar rondines</button>
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
    <!-- agrega el script2.js -->
    <script src="script2.js"></script>

  <script src="script.js"></script>
</body>

</html>