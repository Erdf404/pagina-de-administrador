<?php require_once 'verificar_sesion.php'; ?> 
<!-- Verifica si el usuario ha iniciado sesión -->
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Agregar Usuario</title>
    <link rel="stylesheet" href="estilos.css" />
    <!-- Enlace al archivo CSS para estilos -->
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
                    <button>Datos del usuario actual</button>
                    <button onclick="window.location.href='Inicio_Sesion.php'">Cerrar sesión</button>
                    <button onclick="window.location.href='Rondines.php'">Buscar rondines</button>
                    <button onclick="window.location.href='Eliminar-usuario.php'">Eliminar usuario</button>
                    <button onclick="window.location.href='Modificar-usuario.php'">Modificar usuario</button>
                    <button onclick="window.location.href='Busqueda-guardia.php'">Buscar guardias
                        <!-- Botones para navegar a diferentes secciones -->
                </div>
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
                <option value="usuario">Guardia</option>
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
    <!-- agrega el script2.js -->
    <script src="script2.js"></script>

    <!-- agrega el script.js -->
    <script src="script.js"></script>

    <!-- agrega el script_usuarios.js -->
    <script src="script_usuarios.js"></script>
</body>

</html>