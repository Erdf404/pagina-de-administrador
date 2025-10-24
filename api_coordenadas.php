<?php
// api_coordenadas.php - API para gestión de puntos/coordenadas

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Configuración de la base de datos
$host = 'localhost';
$dbname = 'sistema_rondas';
$usuario_bd = 'root';
$password_bd = 'admin';

// Función para conectar a la base de datos
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

// ==================== GET: Obtener coordenadas ====================
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $accion = isset($_GET['accion']) ? $_GET['accion'] : '';

  $pdo = conectarBD();
  if (!$pdo) {
    echo json_encode(['exito' => false, 'mensaje' => 'Error de conexión']);
    exit;
  }

  // Obtener todas las coordenadas
  if ($accion === 'obtener') {
    try {
      $stmt = $pdo->query("
                SELECT 
                    id_coordenada_admin as id,
                    nombre_coordenada as nombre,
                    latitud as lat,
                    longitud as lng,
                    DATE_FORMAT(NOW(), '%d/%m/%Y %H:%i') as fecha
                FROM Coordenadas_admin 
                ORDER BY id_coordenada_admin DESC
            ");
      $coordenadas = $stmt->fetchAll(PDO::FETCH_ASSOC);

      echo json_encode(['exito' => true, 'datos' => $coordenadas]);
    } catch (PDOException $e) {
      echo json_encode(['exito' => false, 'mensaje' => 'Error: ' . $e->getMessage()]);
    }
  }

  // Obtener una coordenada específica
  elseif ($accion === 'obtener_uno') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;

    try {
      $stmt = $pdo->prepare("
                SELECT 
                    id_coordenada_admin as id,
                    nombre_coordenada as nombre,
                    latitud as lat,
                    longitud as lng
                FROM Coordenadas_admin 
                WHERE id_coordenada_admin = ?
            ");
      $stmt->execute([$id]);
      $coordenada = $stmt->fetch(PDO::FETCH_ASSOC);

      if ($coordenada) {
        echo json_encode(['exito' => true, 'datos' => $coordenada]);
      } else {
        echo json_encode(['exito' => false, 'mensaje' => 'Coordenada no encontrada']);
      }
    } catch (PDOException $e) {
      echo json_encode(['exito' => false, 'mensaje' => 'Error: ' . $e->getMessage()]);
    }
  }
}

// ==================== POST: Crear, actualizar o eliminar ====================
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
    echo json_encode(['exito' => false, 'mensaje' => 'Error de conexión']);
    exit;
  }

  // ==================== CREAR COORDENADA ====================
  if ($accion === 'crear') {
    $nombre = trim($datos['nombre']);
    $lat = floatval($datos['lat']);
    $lng = floatval($datos['lng']);

    // Validaciones
    if (empty($nombre)) {
      echo json_encode(['exito' => false, 'mensaje' => 'El nombre es requerido']);
      exit;
    }

    if ($lat < -90 || $lat > 90 || $lng < -180 || $lng > 180) {
      echo json_encode(['exito' => false, 'mensaje' => 'Coordenadas inválidas']);
      exit;
    }

    try {
      // Verificar si ya existe una coordenada con ese nombre
      $stmt = $pdo->prepare("SELECT COUNT(*) FROM Coordenadas_admin WHERE nombre_coordenada = ?");
      $stmt->execute([$nombre]);

      if ($stmt->fetchColumn() > 0) {
        echo json_encode(['exito' => false, 'mensaje' => 'Ya existe un punto con ese nombre']);
        exit;
      }

      // Insertar nueva coordenada
      $stmt = $pdo->prepare("
                INSERT INTO Coordenadas_admin (nombre_coordenada, latitud, longitud) 
                VALUES (?, ?, ?)
            ");
      $stmt->execute([$nombre, $lat, $lng]);

      $nuevoId = $pdo->lastInsertId();

      echo json_encode([
        'exito' => true,
        'mensaje' => 'Coordenada guardada exitosamente',
        'id' => $nuevoId
      ]);
    } catch (PDOException $e) {
      echo json_encode(['exito' => false, 'mensaje' => 'Error al guardar: ' . $e->getMessage()]);
    }
  }

  // ==================== ACTUALIZAR COORDENADA ====================
  elseif ($accion === 'actualizar') {
    $id = intval($datos['id']);
    $nombre = trim($datos['nombre']);
    $lat = floatval($datos['lat']);
    $lng = floatval($datos['lng']);

    try {
      // Verificar que no exista otro punto con el mismo nombre
      $stmt = $pdo->prepare("
                SELECT COUNT(*) 
                FROM Coordenadas_admin 
                WHERE nombre_coordenada = ? AND id_coordenada_admin != ?
            ");
      $stmt->execute([$nombre, $id]);

      if ($stmt->fetchColumn() > 0) {
        echo json_encode(['exito' => false, 'mensaje' => 'Ya existe otro punto con ese nombre']);
        exit;
      }

      // Actualizar
      $stmt = $pdo->prepare("
                UPDATE Coordenadas_admin 
                SET nombre_coordenada = ?, latitud = ?, longitud = ?
                WHERE id_coordenada_admin = ?
            ");
      $stmt->execute([$nombre, $lat, $lng, $id]);

      echo json_encode(['exito' => true, 'mensaje' => 'Coordenada actualizada']);
    } catch (PDOException $e) {
      echo json_encode(['exito' => false, 'mensaje' => 'Error: ' . $e->getMessage()]);
    }
  }

  // ==================== ELIMINAR COORDENADA ====================
  elseif ($accion === 'eliminar') {
    $id = intval($datos['id']);

    try {
      // Verificar si la coordenada está siendo usada en alguna ruta
      $stmt = $pdo->prepare("SELECT COUNT(*) FROM Ruta_coordenadas WHERE id_coordenada_admin = ?");
      $stmt->execute([$id]);

      if ($stmt->fetchColumn() > 0) {
        echo json_encode([
          'exito' => false,
          'mensaje' => 'No se puede eliminar. Este punto está siendo usado en una o más rutas'
        ]);
        exit;
      }

      // Eliminar
      $stmt = $pdo->prepare("DELETE FROM Coordenadas_admin WHERE id_coordenada_admin = ?");
      $stmt->execute([$id]);

      echo json_encode(['exito' => true, 'mensaje' => 'Coordenada eliminada']);
    } catch (PDOException $e) {
      echo json_encode(['exito' => false, 'mensaje' => 'Error: ' . $e->getMessage()]);
    }
  } else {
    echo json_encode(['exito' => false, 'mensaje' => 'Acción no válida']);
  }
}
