<?php
require_once 'config.php';
cerrarSesion();
header('Location: Inicio_Sesion.php?mensaje=sesion_cerrada');
exit();
?>