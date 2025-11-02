<?php
require_once __DIR__ . '/../config/config.php';

if (!verificarSesion()) {
    header('Location: ../pages/Inicio_Sesion.php');
    exit();
}