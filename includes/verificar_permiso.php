<?php
// includes/verificar_permiso.php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/db_config.php'; 

// Verificar que haya sesión activa
if (!verificarSesion()) {
    header('Location: ../pages/Inicio_Sesion.php');
    exit();
}

// Definir permisos requeridos por página 
$permisos_pagina = [
    'agregar-usuario.php' => 'agregar_usuarios',
    'modificar-usuario.php' => 'modificar_usuarios',
    'eliminar-usuario.php' => 'eliminar_usuarios',
    'busqueda-guardia.php' => 'ver_guardias',
    'rutas.php' => 'crear_rutas',
    'asignar-rutas.php' => 'asignar_rutas',
    'rondines.php' => 'ver_rondines_propios' 
];

// Obtener nombre de la página actual y convertir a minúsculas
$pagina_actual = strtolower(basename($_SERVER['PHP_SELF']));

// Verificar si la página requiere permisos específicos
if (isset($permisos_pagina[$pagina_actual])) {
    $permiso_requerido = $permisos_pagina[$pagina_actual];
    
    // Verificar si el usuario tiene el permiso
    if (!tienePermiso($permiso_requerido)) {
        // No tiene permiso - mostrar página de error
        ?>
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Acceso Denegado</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    margin: 0;
                }
                .error-container {
                    background: white;
                    padding: 40px;
                    border-radius: 12px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                    text-align: center;
                    max-width: 500px;
                    animation: slideDown 0.5s ease;
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-50px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .error-icon {
                    font-size: 4rem;
                    margin-bottom: 20px;
                }
                h1 {
                    color: #d32f2f;
                    margin-bottom: 15px;
                }
                p {
                    color: #666;
                    margin-bottom: 25px;
                    line-height: 1.6;
                }
                .btn {
                    background: #0044cc;
                    color: white;
                    padding: 12px 24px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                    text-decoration: none;
                    display: inline-block;
                    margin: 5px;
                    transition: all 0.3s ease;
                }
                .btn:hover {
                    background: #0033aa;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 68, 204, 0.3);
                }
                .btn-secondary {
                    background: #6c757d;
                }
                .btn-secondary:hover {
                    background: #5a6268;
                }
                .user-info {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 20px 0;
                    border-left: 4px solid #0044cc;
                }
            </style>
        </head>
        <body>
            <div class="error-container">
                <div class="error-icon">🚫</div>
                <h1>Acceso Denegado</h1>
                <p><strong>No tienes permisos suficientes para acceder a esta página.</strong></p>
                
                <div class="user-info">
                    <strong>Usuario:</strong> <?php echo htmlspecialchars($_SESSION['usuario_nombre']); ?><br>
                    <strong>Tipo:</strong> 
                    <?php 
                    $tipos = [1 => 'Guardia', 2 => 'Encargado', 3 => 'Administrador'];
                    echo $tipos[$_SESSION['tipo_usuario']] ?? 'Desconocido';
                    ?>
                </div>
                
                <p style="font-size: 14px; color: #999;">
                    Esta sección requiere permisos de: <strong><?php echo ucfirst(str_replace('_', ' ', $permiso_requerido)); ?></strong>
                </p>
                
                <?php if (esGuardia()): ?>
                    <a href="../pages/Rondines.php" class="btn">Ir a Mis Rondines</a>
                <?php else: ?>
                    <a href="../pages/Busqueda-guardia.php" class="btn">Volver al Inicio</a>
                <?php endif; ?>
                
                <a href="../pages/cerrar_sesion.php" class="btn btn-secondary">Cerrar Sesión</a>
            </div>
        </body>
        </html>
        <?php
        exit();
    }
}
?>