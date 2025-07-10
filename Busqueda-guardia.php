<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8" />
  <title>Busqueda de guardias</title>
  <link rel="stylesheet" href="Busqueda.css" />
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
          <button onclick="window.location.href='Modificar usuario.php'">Modificar usuario</button>
          <button onclick="window.location.href='Inicio_Sesion.php'">Cerrar sesión</button>
          <button onclick="window.location.href='Agregar-Usuario.php'">Agregar usuario</button>
          <button onclick="window.location.href='Eliminar usuario.php'">Eliminar usuario</button>
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
          <td>Nombres de guardias</td>
        </tr>
      </tbody>
    </table>
  </main>
  <script>
    const userDropdown = document.querySelector('.user-dropdown');
    const userButton = document.querySelector('.user-button');

    userButton.addEventListener('click', () => {
      userDropdown.classList.toggle('active');
    });

    // Cierra el menú si haces clic fuera
    document.addEventListener('click', function(e) {
      if (!userDropdown.contains(e.target)) {
        userDropdown.classList.remove('active');
      }
    });
  </script>
</body>

</html>