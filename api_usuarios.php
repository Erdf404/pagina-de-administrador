<?php
// api_usuarios.php - API para gestión de usuarios con MySQL

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Configuración de la base de datos
$host = 'localhost';
$dbname = 'sistema_rondas';
$usuario_bd = 'root'; // Cambiar según tu configuración
$password_bd = '';    // Cambiar según tu configuración
