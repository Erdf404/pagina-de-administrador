<?php
require_once 'config.php';

if (!verificarSesion()) {
    header('Location: Inicio_Sesion.php');
    exit();
}
?>