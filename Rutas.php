<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Sistema de Puntos de Rondines con Rutas</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="estilo_mapa.css" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
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
                    <button onclick="window.location.href='Agregar-Usuario.php'">Agregar usuario</button>
                    <button onclick="window.location.href='Eliminar-usuario.php'">Eliminar usuario</button>
                    <button onclick="window.location.href='Rondines.php'">Buscar rondines</button>
                    <button onclick="window.location.href='Busqueda-guardia.php'">Buscar guardias</button>
                    <button onclick="window.location.href='Asignar-rutas.php'">Asignar rutas</button>
                    <!-- Botones para navegar a diferentes secciones -->
                </div>
            </div>
        </div>
    </header>

    <body>
        <div class="container">
            <h1>Sistema de Puntos de Rondines con Rutas</h1>

            <!-- Mensajes -->
            <div id="mensaje-exito" class="mensaje-exito" style="display: none;"></div>

            <!-- Instrucciones -->
            <div class="instrucciones">
                <strong>📋 Instrucciones:</strong><br>
                • <strong>Clic izquierdo</strong> en el mapa para colocar un punto<br>
                • <strong>Asigna un nombre</strong> al punto y guárdalo<br>
                • <strong>Clic derecho</strong> en un marcador para eliminarlo temporalmente<br>
                • <strong>Crea rutas</strong> seleccionando puntos guardados en el orden deseado
            </div>

            <div class="layout">
                <!-- Panel de creación de puntos -->
                <div class="panel-creacion">
                    <div class="form-section">
                        <label>Nombre del punto:</label>
                        <input type="text" id="nombre_punto" placeholder="Ej: Entrada Principal, Laboratorio A, etc." required>
                    </div>
                    <div class="botones-control">
                        <button type="button" onclick="guardarPunto()" class="success">💾 Guardar Punto</button>
                        <button type="button" onclick="limpiarMarcadorTemporal()" class="peligro">🗑 Limpiar</button>
                    </div>
                    <label>🗺 Haz clic en el mapa para colocar un punto:</label>
                    <div id="map"></div>
                </div>

                <!-- Panel de puntos guardados -->
                <div class="panel">
                    <h3>Puntos Guardados</h3>
                    <div id="tabla-puntos-container">
                        <table class="tabla" id="tabla-puntos">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Coordenadas</th>
                                    <th>Fecha</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="tbody-puntos">
                                <tr>
                                    <td colspan="4" class="sin-datos">
                                        No hay puntos guardados aún
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Panel de rutas -->
                <div class="panel">
                    <h3> Gestión de Rutas</h3>

                    <!-- Crear nueva ruta -->
                    <div class="form-section">
                        <label>Nombre de la ruta:</label>
                        <input type="text" id="nombre_ruta" placeholder="Ej: Ronda Nocturna, Inspección Matutina, etc.">
                    </div>

                    <div class="form-section">
                        <label>Seleccionar punto:</label>
                        <select id="select_punto">
                            <option value="">-- Selecciona un punto --</option>
                        </select>
                    </div>

                    <div class="botones-control">
                        <button type="button" onclick="agregarPuntoRuta()" class="success">➕ Agregar Punto</button>
                        <button type="button" onclick="guardarRuta()" class="success">💾 Guardar Ruta</button>
                        <button type="button" onclick="limpiarRutaTemporal()" class="peligro">🗑 Limpiar Ruta</button>
                    </div>

                    <!-- Puntos seleccionados para la ruta -->
                    <div id="puntos-ruta-seleccionados">
                        <strong>Puntos en la ruta actual:</strong>
                        <div id="lista-puntos-ruta">
                            <p class="sin-datos">No hay puntos seleccionados</p>
                        </div>
                    </div>

                    <!-- Rutas guardadas -->
                    <h4>🗂️ Rutas Guardadas</h4>
                    <div id="tabla-rutas-container">
                        <table class="tabla" id="tabla-rutas">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Puntos</th>
                                    <th>Fecha</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="tbody-rutas">
                                <tr>
                                    <td colspan="4" class="sin-datos">
                                        No hay rutas guardadas aún
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Scripts -->
        <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
        <script src="script_mapa.js"></script>
        <script src="script.js"></script>
    </body>

</html>