<?php
// api_rutas.php - API para gestión de rutas (colecciones de coordenadas)

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Incluir archivo de configuración y funciones comunes
require_once 'config.php';

// Verificar sesión
if (!verificarSesion()) {
    http_response_code(401);
    echo json_encode(['exito' => false, 'mensaje' => 'Sesión no válida']);
    exit;
}

// Verificar permisos según la API
if (!tienePermiso('crear_rutas')) { // Cambiar según la API
    http_response_code(403);
    echo json_encode(['exito' => false, 'mensaje' => 'No tienes permisos']);
    exit;
}

$host = 'localhost';
$dbname = 'sistema_rondas';
$usuario_bd = 'root';
$password_bd = 'admin';

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

// ==================== GET: Obtener rutas ====================
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $accion = isset($_GET['accion']) ? $_GET['accion'] : '';

  $pdo = conectarBD();
  if (!$pdo) {
    echo json_encode(['exito' => false, 'mensaje' => 'Error de conexión']);
    exit;
  }

  // Obtener todas las rutas con sus coordenadas
  if ($accion === 'obtener') {
    try {
      // Obtener rutas
      $stmt = $pdo->query("
                SELECT 
                    id_ruta as id,
                    nombre_ruta as nombre,
                    descripcion,
                    DATE_FORMAT(fecha_creacion, '%d/%m/%Y %H:%i') as fecha
                FROM Rutas 
                ORDER BY id_ruta DESC
            ");
      $rutas = $stmt->fetchAll(PDO::FETCH_ASSOC);

      // Para cada ruta, obtener sus coordenadas en orden
      foreach ($rutas as &$ruta) {
        $stmt = $pdo->prepare("
                    SELECT 
                        c.id_coordenada_admin as id,
                        c.nombre_coordenada as nombre,
                        c.latitud as lat,
                        c.longitud as lng,
                        rc.orden
                    FROM Ruta_coordenadas rc
                    INNER JOIN Coordenadas_admin c ON rc.id_coordenada_admin = c.id_coordenada_admin
                    WHERE rc.id_ruta = ?
                    ORDER BY rc.orden ASC
                ");
        $stmt->execute([$ruta['id']]);
        $ruta['puntos'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
      }

      echo json_encode(['exito' => true, 'datos' => $rutas]);
    } catch (PDOException $e) {
      echo json_encode(['exito' => false, 'mensaje' => 'Error: ' . $e->getMessage()]);
    }
  }

  // Obtener una ruta específica
  elseif ($accion === 'obtener_una') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;

    try {
      $stmt = $pdo->prepare("
                SELECT 
                    id_ruta as id,
                    nombre_ruta as nombre,
                    descripcion,
                    fecha_creacion
                FROM Rutas 
                WHERE id_ruta = ?
            ");
      $stmt->execute([$id]);
      $ruta = $stmt->fetch(PDO::FETCH_ASSOC);

      if (!$ruta) {
        echo json_encode(['exito' => false, 'mensaje' => 'Ruta no encontrada']);
        exit;
      }

      // Obtener coordenadas de la ruta
      $stmt = $pdo->prepare("
                SELECT 
                    c.id_coordenada_admin as id,
                    c.nombre_coordenada as nombre,
                    c.latitud as lat,
                    c.longitud as lng,
                    rc.orden
                FROM Ruta_coordenadas rc
                INNER JOIN Coordenadas_admin c ON rc.id_coordenada_admin = c.id_coordenada_admin
                WHERE rc.id_ruta = ?
                ORDER BY rc.orden ASC
            ");
      $stmt->execute([$id]);
      $ruta['puntos'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

      echo json_encode(['exito' => true, 'datos' => $ruta]);
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

  // ==================== CREAR RUTA ====================
  if ($accion === 'crear') {
    $nombre = trim($datos['nombre']);
    $descripcion = isset($datos['descripcion']) ? trim($datos['descripcion']) : '';
    $puntos = isset($datos['puntos']) ? $datos['puntos'] : [];

    // Validaciones
    if (empty($nombre)) {
      echo json_encode(['exito' => false, 'mensaje' => 'El nombre de la ruta es requerido']);
      exit;
    }

    if (count($puntos) < 2) {
      echo json_encode(['exito' => false, 'mensaje' => 'Una ruta debe tener al menos 2 puntos']);
      exit;
    }

    try {
      // Verificar si ya existe una ruta con ese nombre
      $stmt = $pdo->prepare("SELECT COUNT(*) FROM Rutas WHERE nombre_ruta = ?");
      $stmt->execute([$nombre]);

      if ($stmt->fetchColumn() > 0) {
        echo json_encode(['exito' => false, 'mensaje' => 'Ya existe una ruta con ese nombre']);
        exit;
      }

      // Iniciar transacción
      $pdo->beginTransaction();

      // Insertar ruta
      $stmt = $pdo->prepare("INSERT INTO Rutas (nombre_ruta, descripcion) VALUES (?, ?)");
      $stmt->execute([$nombre, $descripcion]);
      $rutaId = $pdo->lastInsertId();

      // Insertar coordenadas de la ruta en orden
      $stmt = $pdo->prepare("
                INSERT INTO Ruta_coordenadas (id_ruta, id_coordenada_admin, orden) 
                VALUES (?, ?, ?)
            ");

      foreach ($puntos as $index => $puntoId) {
        $orden = $index + 1;
        $stmt->execute([$rutaId, intval($puntoId), $orden]);
      }

      $pdo->commit();

      echo json_encode([
        'exito' => true,
        'mensaje' => 'Ruta creada exitosamente',
        'id' => $rutaId
      ]);
    } catch (PDOException $e) {
      $pdo->rollBack();
      echo json_encode(['exito' => false, 'mensaje' => 'Error al crear ruta: ' . $e->getMessage()]);
    }
  }

  // ==================== ACTUALIZAR RUTA ====================
  elseif ($accion === 'actualizar') {
    $id = intval($datos['id']);
    $nombre = trim($datos['nombre']);
    $descripcion = isset($datos['descripcion']) ? trim($datos['descripcion']) : '';
    $puntos = isset($datos['puntos']) ? $datos['puntos'] : [];

    if (count($puntos) < 2) {
      echo json_encode(['exito' => false, 'mensaje' => 'Una ruta debe tener al menos 2 puntos']);
      exit;
    }

    try {
      // Verificar nombre único
      $stmt = $pdo->prepare("
                SELECT COUNT(*) 
                FROM Rutas 
                WHERE nombre_ruta = ? AND id_ruta != ?
            ");
      $stmt->execute([$nombre, $id]);

      if ($stmt->fetchColumn() > 0) {
        echo json_encode(['exito' => false, 'mensaje' => 'Ya existe otra ruta con ese nombre']);
        exit;
      }

      $pdo->beginTransaction();

      // Actualizar ruta
      $stmt = $pdo->prepare("UPDATE Rutas SET nombre_ruta = ?, descripcion = ? WHERE id_ruta = ?");
      $stmt->execute([$nombre, $descripcion, $id]);

      // Eliminar coordenadas antiguas
      $stmt = $pdo->prepare("DELETE FROM Ruta_coordenadas WHERE id_ruta = ?");
      $stmt->execute([$id]);

      // Insertar nuevas coordenadas
      $stmt = $pdo->prepare("
                INSERT INTO Ruta_coordenadas (id_ruta, id_coordenada_admin, orden) 
                VALUES (?, ?, ?)
            ");

      foreach ($puntos as $index => $puntoId) {
        $orden = $index + 1;
        $stmt->execute([$id, intval($puntoId), $orden]);
      }

      $pdo->commit();

      echo json_encode(['exito' => true, 'mensaje' => 'Ruta actualizada exitosamente']);
    } catch (PDOException $e) {
      $pdo->rollBack();
      echo json_encode(['exito' => false, 'mensaje' => 'Error: ' . $e->getMessage()]);
    }
  }

  // ==================== ELIMINAR RUTA ====================
  elseif ($accion === 'eliminar') {
    $id = intval($datos['id']);

    try {
      // Verificar si la ruta está asignada a algún usuario
      $stmt = $pdo->prepare("SELECT COUNT(*) FROM Ronda_asignada WHERE id_ruta = ?");
      $stmt->execute([$id]);

      if ($stmt->fetchColumn() > 0) {
        echo json_encode([
          'exito' => false,
          'mensaje' => 'No se puede eliminar. Esta ruta está asignada a uno o más guardias'
        ]);
        exit;
      }

      // Eliminar ruta (las coordenadas se eliminan automáticamente por CASCADE)
      $stmt = $pdo->prepare("DELETE FROM Rutas WHERE id_ruta = ?");
      $stmt->execute([$id]);

      echo json_encode(['exito' => true, 'mensaje' => 'Ruta eliminada exitosamente']);
    } catch (PDOException $e) {
      echo json_encode(['exito' => false, 'mensaje' => 'Error: ' . $e->getMessage()]);
    }
  } else {
    echo json_encode(['exito' => false, 'mensaje' => 'Acción no válida']);
  }
}
