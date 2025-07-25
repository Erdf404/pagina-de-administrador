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
          <button onclick="window.location.href='Inicio_Sesion.php'">Cerrar sesión</button>
          <button onclick="window.location.href='Agregar-Usuario.php'">Agregar usuario</button>
          <button onclick="window.location.href='Eliminar-usuario.php'">Eliminar usuario</button>
          <button onclick="window.location.href='Modificar-usuario.php'">Modificar usuario</button>
          <button onclick="window.location.href='Busqueda-guardia.php'">Buscar guardias</button>
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
          <td>Nombres de guardias</td>
          <td></td>
          <td></td>
          <td></td>
          <td class="mapa-boton"> Mostrar mapa</td>
        </tr>
      </tbody>
    </table>
  </main>
    <!-- agrega el script2.js -->
    <script src="script2.js"></script>
  <!-- agrega el script.js -->
  <script src="script.js"></script>
</body>

</html>