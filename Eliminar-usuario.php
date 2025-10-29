<?php require_once 'verificar_sesion.php'; ?> 
<!-- Verifica si el usuario ha iniciado sesión -->
<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8" />
  <title>Eliminar usuarios</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="estilos.css" />
</head>

<body>
  <header>
    <div id="logo">
      <img src="logo-tsj.png" />
    </div>

    <div class="placeholder">
    <form method="POST" action="" onsubmit="event.preventDefault(); buscarUsuario(this.busqueda.value);">
        <input type="text" name="busqueda" placeholder="Buscar guardia......" />
        <button type="submit">Buscar</button>
    </form>
</div>

    <div id="user-info">
      <div class="user-dropdown">
        <button class="user-button">☰</button>
        <!-- Botón para desplegar el menú de usuario -->
        <div class="dropdown-menu">
          <button>Datos del usuario actual</button>
          <button onclick="window.location.href='Modificar-usuario.php'">Modificar usuario</button>
          <button onclick="window.location.href='Inicio_Sesion.php'">Cerrar sesión</button>
          <button onclick="window.location.href='Agregar-Usuario.php'">Agregar usuario</button>
          <button onclick="window.location.href='Busqueda-guardia.php'">Buscar guardias</button>
          <button onclick="window.location.href='Rondines.php'">Buscar rondines</button>
          <button onclick="window.location.href='Rutas.php'">Crear rutas</button>
          <button onclick="window.location.href='Asignar-rutas.php'">Asignar rutas
          <!-- Botones para navegar a diferentes secciones -->
        </div>
      </div>
    </div>
  </header>

  <main>
    <div class="filtros">
    <button class="filtro filtro-a" onclick="filtrarPorTipo('A')">A</button>
    <button class="filtro filtro-g" onclick="filtrarPorTipo('G')">G</button>
    <button class="filtro" onclick="cargarTablaEliminar()">Todos</button>
</div>


    <table class="guardias">
      <thead>
        <tr>
          <th>Usuario </th>
          <th>Tipo de Usuario</th>
          <th>Eliminar</th>
        </tr>
      </thead>
      <!-- Encabezados de la tabla -->

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
    <!-- agrega el script2.js -->
    <script src="script2.js"></script>
    
  <!-- agrega el script.js -->
  <script src="script.js"></script>

  <!-- agrega el script_usuarios.js -->
  <script src="script_usuarios.js"></script>
</body>

</html>