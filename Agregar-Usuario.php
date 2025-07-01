<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Agregar Usuario</title>
    <link rel="stylesheet" href="Agregar-Usuario.css" />
    <!-- Enlace al archivo CSS para estilos -->
</head>
<body>
    <header>
        <div id="logo">
            <img src="logo-tsj.png" alt="Logo del TSJ" />
        </div>
        <div id="user-info"> 
            <button id="user-data">Datos del usuario actual</button>
            <div id="dropdown">
                <button>Cerrar sesión</button>
            </div>
        </div>
    </header>
    <main>
        <h1>Agregar Usuario</h1> 
        <!-- Título de la sección de agregar usuario -->
        <form action="Agregar-Usuario.php" method="post">
            <!-- Formulario para agregar un nuevo usuario -->
            <label for="tipo-usuario">Seleccionar Tipo de Usuario:</label>
            <!-- Etiqueta para el campo de selección de tipo de usuario -->
            <select id="tipo-usuario" name="tipo-usuario" required onchange="mostrarOpcionesAdministrador()">
            <!-- Campo de selección para el tipo de usuario -->
                <option value="" disabled selected>Seleccionar...</option>
                <option value="administrador">Administrador</option>
                <option value="usuario">Usuario</option>
            </select>
            <!-- Opciones de tipo de usuario: Administrador o Usuario -->

            <div id="admin-options">
                <label for="tipo-admin">Tipo de Administrador:</label>
                <select id="tipo-admin" name="tipo-admin">
                    <option value="" disabled selected>Seleccionar tipo de administrador...</option>
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="A3">A3</option> 
                </select>
            </div>
            <!-- Opciones adicionales para el tipo de administrador, visible solo si se selecciona Administrador -->

            <label for="nombre">Nombre:</label>
            <input type="text" id="nombre" name="nombre" placeholder="Ingresa el nombre" required />
            <!-- Campo de entrada para el nombre del usuario -->

            <label for="email">Correo Electrónico:</label>
            <input type="email" id="email" name="email" placeholder="ejemplo@correo.com" required />
            <!-- Campo de entrada para el correo electrónico del usuario -->

            <label for="password">Contraseña:</label>
            <input type="password" id="password" name="password" placeholder="Ingresa una contraseña segura" required />
            <!-- Campo de entrada para la contraseña del usuario -->

            <button type="submit">Agregar Usuario</button>
            <!-- Botón para enviar el formulario y agregar el usuario -->
        </form>
    </main>

    <script>
        function mostrarOpcionesAdministrador() {
            const tipoUsuario = document.getElementById('tipo-usuario').value;
            const adminOptions = document.getElementById('admin-options');

            if (tipoUsuario === 'administrador') {
                adminOptions.style.display = 'block';
            } else {
                adminOptions.style.display = 'none';
            }
        }
    </script>
    <!-- Script para mostrar u ocultar las opciones de administrador según la selección del tipo de usuario -->
</body>
</html>
