<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Modificar Usuarios</title>
  <link rel="stylesheet" href="Modificar.css" />
</head>

<body>
  <header>
    <div id="logo">
      <img src="logo-tsj.png" alt="Logo del TSJ" />
    </div>
    <div id="user-info">
      <div class="user-dropdown">
        <button class="user-button">☰</button>
        <div class="dropdown-menu">
          <button >Datos del usuario actual</button>
          <button onclick="window.location.href='Inicio_Sesion.php'">Cerrar sesión</button>
          <button onclick="window.location.href='Agregar-Usuario.php'">Agregar usuario</button>
          <button onclick="window.location.href='Eliminar usuario.php'">Eliminar usuario</button>
          <button onclick="window.location.href='Busqueda-guardia.php'">Buscar rondines</button>
        </div>
      </div>
    </div>
  </header>

  <main>
    <h1>Modificar Usuarios</h1>
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Correo Electrónico</th>
          <th>Tipo de Usuario</th>
          <th>Tipo de Administrador</th>
          <th>Contraseña</th>
          <th>Guardar</th>
        </tr>
      </thead>
      <!-- Encabezados de la tabla -->
      <tbody>
        <tr>
          <td><input type="text" value="Juan Pérez" /></td>
          <!-- Campo de entrada para el nombre del usuario -->
          <td><input type="email" value="juan@example.com" /></td>
          <!-- Campo de entrada para el correo electrónico del usuario -->
          <td>
            <select onchange="mostrarTipoAdmin(this)">
              <option value="usuario">Usuario</option>
              <option value="administrador" selected>Administrador</option>
            </select>
          </td>
          <!-- Campo de selección para el tipo de usuario -->
          <td>
            <select class="tipo-admin">
              <option value="">Seleccionar...</option>
              <option value="A1" selected>A1</option>
              <option value="A2">A2</option>
              <option value="A3">A3</option>
            </select>
            <!-- Campo de selección para el tipo de administrador -->
          </td>
          <td><input type="password" placeholder="Opcional" /></td>
          <!-- Campo de entrada para la contraseña del usuario, opcional -->
          <td><button class="guardar-btn">Guardar</button></td>
          <!-- Botón para guardar los cambios del usuario -->
        </tr>
        <!-- Fila de ejemplo para un usuario existente -->
        <tr>
          <td><input type="text" value="María López" /></td>
          <td><input type="email" value="maria@example.com" /></td>
          <td>
            <select onchange="mostrarTipoAdmin(this)">
              <option value="usuario" selected>Usuario</option>
              <option value="administrador">Administrador</option>
            </select>
          </td>
          <td>
            <select class="tipo-admin" style="display: none;">
              <option value="">Seleccionar...</option>
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="A3">A3</option>
            </select>
          </td>
          <td><input type="password" placeholder="Opcional" /></td>
          <td><button class="guardar-btn">Guardar</button></td>
        </tr>
        <!-- segundo  ejemplo de un usuario ya existente en la tabla -->
      </tbody>


    </table>
  </main>

  <script>
    function mostrarTipoAdmin(selectElement) {
      const fila = selectElement.closest('tr');
      const tipoAdminSelect = fila.querySelector('.tipo-admin');
      if (selectElement.value === 'administrador') {
        tipoAdminSelect.style.display = 'block';
      } else {
        tipoAdminSelect.style.display = 'none';
      }
    }
  </script>
  <!-- Script para mostrar u ocultar el campo de tipo de administrador según el tipo de usuario seleccionado -->

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