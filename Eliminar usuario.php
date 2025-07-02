<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Eliminar usuarios</title>
  <link rel="stylesheet" href="Eliminar usuario.css" />
</head>

<body>
  <header>
    <div id="logo">
      <img src="logo-tsj.png" />
    </div>

    <div class="placeholder">
      <form method="POST" action="">
        <input type="text" name="busqueda" placeholder="Buscar guardia......" />
        <button type="submit">Buscar</button>
      </form>
    </div>

    <div id="user-info">
      <button id="user-data">Datos del usuario actual</button>
      <div id="dropdown">
        <button>Cerrar sesión</button>
      </div>
    </div>
  </header>

  <main>
    <table class="guardias">
      <thead>
        <tr>
          <th>Usuario </th>
          <th>Tipo de Usuario</th>
          <th>Eliminar</th>
        </tr>
      </thead>

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
</body>
</html>