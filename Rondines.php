<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Busqueda de guardias</title>
    <link rel="stylesheet" href="Rondines.css" />
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
            <td> Mostrar mapa</td>
          </tr>
        </tbody>
      </table>
    </main>
  </body>
</html>