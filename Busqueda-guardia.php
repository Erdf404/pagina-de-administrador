
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Busqueda de guardias</title>
    <link rel="stylesheet" href="Disain.css" />
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
  </body>
</html>