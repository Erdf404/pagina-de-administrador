<?php
// api_usuarios.php - API para gestion de usuarios con MySQL

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Configuracion de la base de datos
$host = 'localhost';
$dbname = 'sistema_rondas';
$usuario_bd = 'root'; // Cambiar segun tu configuracion
$password_bd = '';    // Cambiar segun tu configuracion

// Funcion para conectar a la base de datos
function conectarBD()
{
  global $host, $dbname, $usuario_bd, $password_bd;
  try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $usuario_bd, $password_bd);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    return $pdo;
  } catch (PDOException $e) {
    return null;
  }
}

// Funcion para obtener el id_tipo segun el tipo de usuario
function obtenerIdTipo($tipoUsuario, $tipoAdmin)
{
  if ($tipoUsuario === 'usuario') {
    return 1; // Guardia
  } elseif ($tipoUsuario === 'administrador') {
    if ($tipoAdmin === 'A1') return 2;
    if ($tipoAdmin === 'A2') return 3;
    if ($tipoAdmin === 'A3') return 4;
  }
  return 1; // Por defecto guardia
}

// Procesar solicitud GET
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $accion = isset($_GET['accion']) ? $_GET['accion'] : '';

  if ($accion === 'obtener') {
    $pdo = conectarBD();
    if (!$pdo) {
      echo json_encode(['exito' => false, 'mensaje' => 'Error de conexión a la base de datos']);
      exit;
    }

    try {
      $stmt = $pdo->query("SELECT id_usuario, id_tipo, nombre, correo FROM usuarios ORDER BY nombre");
      $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

      echo json_encode(['exito' => true, 'datos' => $usuarios]);
    } catch (PDOException $e) {
      echo json_encode(['exito' => false, 'mensaje' => 'Error al obtener usuarios: ' . $e->getMessage()]);
    }
  }
}
// Procesar solicitud POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $json = file_get_contents('php://input');
  $datos = json_decode($json, true);

  if (!$datos) {
    echo json_encode(['exito' => false, 'mensaje' => 'Datos inválidos']);
    exit;
  }

  $accion = isset($datos['accion']) ? $datos['accion'] : '';

  $pdo = conectarBD();
  if (!$pdo) {
    echo json_encode(['exito' => false, 'mensaje' => 'Error de conexión a la base de datos']);
    exit;
  }
}
