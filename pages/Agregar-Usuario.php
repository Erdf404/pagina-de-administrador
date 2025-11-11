<?php require_once __DIR__ . '/../includes/verificar_permiso.php'; ?>
<!-- Verifica si el usuario ha iniciado sesión -->
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Agregar Usuario</title>
    <link rel="stylesheet" href="../assets/css/estilos.css" />
    <!-- Enlace al archivo CSS para estilos -->
</head>

<body>
    <header>
        <div id="logo">
            <img src="../assets/img/logo-tsj.png" alt="Logo del TSJ" />
        </div>
        <div id="user-info">
            <div class="user-dropdown">
                <button class="user-button">☰</button>
                <div class="dropdown-menu">
                    <button onclick="window.location.href='../pages/cerrar_sesion.php'">Cerrar sesión</button>
                    <!-- Solo para Guardias -->
                    <?php if (esGuardia()): ?>
                        <button onclick="window.location.href='../pages/Rondines.php'">Mis Rondines</button>
                    <?php endif; ?>

                    <!-- Solo para Administradores -->
                    <?php if (esAdministrador()): ?>
                        <button onclick="window.location.href='../pages/Busqueda-guardia.php'">Buscar guardias</button>
                        <button onclick="window.location.href='../pages/Rondines.php'">Buscar rondines</button>
                        <button onclick="window.location.href='../pages/Rutas.php'">Crear rutas</button>
                        <button onclick="window.location.href='../pages/Asignar-rutas.php'">Asignar rutas</button>
                        <button onclick="window.location.href='../pages/Modificar-usuario.php'">Modificar usuario</button>
                        <button onclick="window.location.href='../pages/Eliminar-usuario.php'">Eliminar usuario</button>
                    <?php endif; ?>
                    <!-- Botones para navegar a diferentes secciones -->
                </div>
            </div>
        </div>
    </header>
    <main>
        <h1>Agregar Usuario</h1>
        <!-- Título de la sección de agregar usuario -->
        <form action="../includes/Agregar-Usuario.php" method="post">
            <!-- Formulario para agregar un nuevo usuario -->
            <label for="tipo-usuario">Seleccionar Tipo de Usuario:</label>
            <!-- Etiqueta para el campo de selección de tipo de usuario -->
            <select id="tipo-usuario" name="tipo-usuario" required>
                <option value="" disabled selected>Seleccionar...</option>
                <option value="usuario">Guardia</option>
                <option value="encargado">Encargado</option>
                <option value="administrador">Administrador</option>
            </select>


            <label for="nombre">Nombre:</label>
            <input type="text" id="nombre" name="nombre" placeholder="Ingresa el nombre" required />
            <!-- Campo de entrada para el nombre del usuario -->

            <label for="email">Correo Electrónico:</label>
            <input type="email" id="email" name="email" placeholder="ejemplo@correo.com" required />
            <!-- Campo de entrada para el correo electrónico del usuario -->

            <label for="password">Contraseña:</label>
            <input type="text" id="password" name="password" placeholder="Ingresa una contraseña segura" required />
            <!-- Campo de entrada para la contraseña del usuario -->

            <button type="submit">Agregar Usuario</button>
            <!-- Botón para enviar el formulario y agregar el usuario -->
        </form>
    </main>
    <!-- Scripts -->
    <!-- agrega el script.js -->
    <script src="../assets/js/script.js"></script>

    <!-- agrega el script_usuarios.js -->
    <script src="../assets/js/script_usuarios.js"></script>
</body>

</html>