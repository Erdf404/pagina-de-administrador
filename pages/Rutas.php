<?php require_once __DIR__ . '/../includes/verificar_permiso.php'; ?>
<!-- Verifica si el usuario ha iniciado sesión -->
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Sistema de Puntos de Rondines con Rutas</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../assets/css/estilo_mapa.css" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
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
                    <button>Datos del usuario actual</button>
                    <button onclick="window.location.href='../pages/cerrar_sesion.php'">Cerrar sesión</button>
                    <!-- Solo para Guardias -->
                    <?php if (esGuardia()): ?>
                        <button onclick="window.location.href='../pages/Rondines.php'">Mis Rondines</button>
                    <?php endif; ?>

                    <!-- Solo para Administradores -->
                    <?php if (esAdministrador()): ?>
                        <button onclick="window.location.href='../pages/Busqueda-guardia.php'">Buscar guardias</button>
                        <button onclick="window.location.href='../pages/Rondines.php'">Buscar rondines</button>
                        <button onclick="window.location.href='../pages/Asignar-rutas.php'">Asignar rutas</button>
                    <?php endif; ?>

                    <!-- Solo Admin A2 y A3 -->
                    <?php if (tienePermiso('modificar_usuarios')): ?>
                        <button onclick="window.location.href='../pages/Modificar-usuario.php'">Modificar usuario</button>
                    <?php endif; ?>

                    <!-- Solo Admin A3 -->
                    <?php if (tienePermiso('agregar_usuarios')): ?>
                        <button onclick="window.location.href='../pages/Agregar-Usuario.php'">Agregar usuario</button>
                    <?php endif; ?>

                    <?php if (tienePermiso('eliminar_usuarios')): ?>
                        <button onclick="window.location.href='../pages/Eliminar-usuario.php'">Eliminar usuario</button>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </header>

    <div class="container">
        <h1>Sistema de Puntos de Rondines con Rutas</h1>

        <!-- Mensajes -->
        <div id="mensaje-exito" class="mensaje-exito" style="display: none;"></div>

        <!-- Pestañas de navegación -->
        <div class="tabs-container">
            <button class="tab-button active" onclick="cambiarTab('gps')">📍 Coordenadas GPS</button>
            <button class="tab-button" onclick="cambiarTab('qr')">🔳 Códigos QR</button>
            <button class="tab-button" onclick="cambiarTab('rutas')">🗺️ Gestión de Rutas</button>
        </div>

        <!-- TAB 1: COORDENADAS GPS -->
        <div id="tab-gps" class="tab-content active">
            <div class="instrucciones">
                <strong>📋 Instrucciones:</strong><br>
                • <strong>Clic izquierdo</strong> en el mapa para colocar un punto<br>
                • <strong>Asigna un nombre</strong> al punto y guárdalo<br>
                • <strong>Clic derecho</strong> en un marcador para eliminarlo temporalmente<br>
                • Estos puntos usan <strong>verificación por GPS</strong>
            </div>

            <div class="layout">
                <!-- Panel de creación de puntos GPS -->
                <div class="panel-creacion">
                    <div class="form-section">
                        <label>Nombre del punto:</label>
                        <input type="text" id="nombre_punto" placeholder="Ej: Entrada Principal, Laboratorio A, etc." required>
                    </div>
                    <div class="botones-control">
                        <button type="button" onclick="guardarPunto()" class="success">💾 Guardar Punto GPS</button>
                        <button type="button" onclick="limpiarMarcadorTemporal()" class="peligro">🗑 Limpiar</button>
                    </div>
                    <label>🗺 Haz clic en el mapa para colocar un punto:</label>
                    <div id="map"></div>
                </div>

                <!-- Panel de puntos GPS guardados -->
                <div class="panel">
                    <h3>Puntos GPS Guardados</h3>
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
            </div>
        </div>

        <!-- TAB 2: CÓDIGOS QR -->
        <div id="tab-qr" class="tab-content">
            <div class="instrucciones">
                <strong>📋 Instrucciones para Códigos QR:</strong><br>
                • <strong>Ingresa un nombre</strong> para identificar la ubicación del QR<br>
                • <strong>Genera el código QR</strong> automáticamente con formato QR_LUGAR_NUMERO<br>
                • <strong>Descarga e imprime</strong> el código QR generado<br>
                • <strong>Guarda en el sistema</strong> para poder usarlo en rutas<br>
                • Los guardias escanearán estos códigos durante sus rondas
            </div>

            <div class="layout">
                <!-- Panel de generación de QR -->
                <div class="panel-creacion">
                    <h3>🔳 Generar Nuevo Código QR</h3>

                    <div class="form-section">
                        <label>Nombre del Punto:</label>
                        <input type="text" id="nombre_qr" placeholder="Ej: Entrada Principal, Almacén, Oficina 2, etc." required>
                    </div>

                    <div class="botones-control">
                        <button type="button" onclick="generarQR()" class="success">🔳 Generar QR</button>
                        <button type="button" onclick="limpiarFormularioQR()" class="peligro">🗑️ Limpiar</button>
                    </div>

                    <!-- Vista previa del QR generado -->
                    <div id="qr-preview" style="display: none; margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 8px; text-align: center;">
                        <h4 style="color: #0044cc;">✅ Código QR Generado</h4>
                        <div class="qr-container" style="margin: 20px auto;">
                            <canvas id="qr-canvas"></canvas>
                            <p id="qr-nombre-preview" style="margin-top: 10px; font-weight: bold; color: #0044cc;"></p>
                            <p id="qr-codigo-preview" style="margin-top: 5px; font-family: monospace; color: #666;"></p>
                        </div>
                        <div class="botones-control">
                            <button type="button" onclick="descargarQR()" class="success">💾 Descargar Imagen</button>
                            <button type="button" onclick="guardarQR()" class="success">✅ Guardar en Sistema</button>
                        </div>
                    </div>
                </div>

                <!-- Panel de QRs guardados -->
                <div class="panel">
                    <h3>📂 Códigos QR Guardados</h3>
                    <div id="tabla-qrs-container">
                        <table class="tabla" id="tabla-qrs">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Código</th>
                                    <th>Fecha</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="tbody-qrs">
                                <tr>
                                    <td colspan="4" class="sin-datos">
                                        No hay códigos QR guardados aún
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- TAB 3: RUTAS -->
        <div id="tab-rutas" class="tab-content">
            <div class="panel">
                <h3>🗺️ Gestión de Rutas</h3>

                <!-- Filtro de tipo de puntos -->
                <div class="form-section">
                    <label>Filtrar puntos por tipo:</label>
                    <select id="filtro-tipo-punto" onchange="actualizarSelectPuntos()">
                        <option value="GPS">📍 Solo GPS</option>
                        <option value="QR">🔳 Solo QR</option>
                    </select>
                </div>

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
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
    <script src="../assets/js/script_mapa.js"></script>
    <script src="../assets/js/script.js"></script>
</body>

</html>