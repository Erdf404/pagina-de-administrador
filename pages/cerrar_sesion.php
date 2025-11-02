<?php
require_once __DIR__ . '/../config/config.php';
cerrarSesion();
header('Location: ../pages/Inicio_Sesion.php?mensaje=sesion_cerrada');
exit();
?>