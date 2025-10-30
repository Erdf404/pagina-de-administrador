<?php
// Iniciar sesión si no está iniciada
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
// Definir tiempo de inactividad para cierre de sesión (en segundos)
define('SESSION_TIMEOUT', 28800); // 8 horas

// Función para verificar si la sesión está activa y no ha expirado
function verificarSesion() {
    if (!isset($_SESSION['usuario_id'])) {
        return false;
    }
    
    if (isset($_SESSION['ultima_actividad'])) {
        $inactivo = time() - $_SESSION['ultima_actividad'];
        if ($inactivo > SESSION_TIMEOUT) {
            session_destroy();
            return false;
        }
    }
    
    $_SESSION['ultima_actividad'] = time();
    return true;
}

// Función para cerrar sesión
function cerrarSesion() {
    $_SESSION = array();
    if (isset($_COOKIE[session_name()])) {
        setcookie(session_name(), '', time() - 3600, '/');
    }
    session_destroy();
}

// Función para verificar permisos según tipo de usuario
function tienePermiso($permiso) {
    if (!verificarSesion()) {
        return false;
    }
    
    $tipo_usuario = $_SESSION['tipo_usuario'] ?? 0;
    
    // Definir permisos por tipo de usuario
    // 1 = Guardia, 2 = Admin A1, 3 = Admin A2, 4 = Admin A3
    $permisos = [
        1 => ['ver_rondines_propios'], // Guardia: SOLO sus rondines
        
        2 => [ // Admin A1: Ver todo, crear rutas, asignar
            'ver_rondines_propios',
            'ver_todos_rondines',
            'ver_guardias',
            'crear_rutas',
            'asignar_rutas'
        ],
        
        3 => [ // Admin A2: A1 + modificar usuarios
            'ver_rondines_propios',
            'ver_todos_rondines',
            'ver_guardias',
            'crear_rutas',
            'asignar_rutas',
            'modificar_usuarios'
        ],
        
        4 => [ // Admin A3: Todo
            'ver_rondines_propios',
            'ver_todos_rondines',
            'ver_guardias',
            'crear_rutas',
            'asignar_rutas',
            'modificar_usuarios',
            'agregar_usuarios',
            'eliminar_usuarios'
        ]
    ];
    
    $permisos_usuario = $permisos[$tipo_usuario] ?? [];
    return in_array($permiso, $permisos_usuario);
}

// Función para obtener tipo de usuario actual
function obtenerTipoUsuario() {
    return $_SESSION['tipo_usuario'] ?? 0;
}

// Función para obtener ID de usuario actual
function obtenerIdUsuario() {
    return $_SESSION['usuario_id'] ?? 0;
}

// Función para verificar si es guardia
function esGuardia() {
    return obtenerTipoUsuario() === 1;
}

// Función para verificar si es administrador
function esAdministrador() {
    $tipo = obtenerTipoUsuario();
    return $tipo >= 2 && $tipo <= 4;
}
?>