<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

define('SESSION_TIMEOUT', 28800); // 8 horas

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

function cerrarSesion() {
    $_SESSION = array();
    if (isset($_COOKIE[session_name()])) {
        setcookie(session_name(), '', time() - 3600, '/');
    }
    session_destroy();
}
?>