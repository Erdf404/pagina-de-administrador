<?php
// api_asignaciones.php - API para asignar rutas a guardias

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$host = 'localhost';
$dbname = 'sistema_rondas';
$usuario_bd = 'root';
$password_bd = 'admin';

function conectarBD() {
    global $host, $dbname, $usuario_bd, $password_bd;
    try {
        $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $usuario_bd, $password_bd);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (PDOException $e) {
        return null;
    }
}

// ==================== GET: Obtener asignaciones ====================
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $accion = isset($_GET['accion']) ? $_GET['accion'] : '';

    $pdo = conectarBD();
    if (!$pdo) {
        echo json_encode(['exito' => false, 'mensaje' => 'Error de conexión']);
        exit;
    }

    // Obtener todas las asignaciones
    if ($accion === 'obtener') {
        try {
            $stmt = $pdo->query("
                SELECT 
                    ra.id_ronda_asignada as id,
                    ra.id_usuario as guardiaId,
                    u.nombre as guardiaNombre,
                    u.correo as guardiaEmail,
                    ra.id_ruta as rutaId,
                    r.nombre_ruta as rutaNombre,
                    ra.id_tipo as tipoRondaId,
                    tr.nombre_tipo_ronda as tipoRonda,
                    ra.fecha_de_ejecucion as fecha,
                    ra.hora_de_ejecucion as horaInicio,
                    ra.distancia_permitida as radioTolerancia,
                    DATE_FORMAT(ra.fecha_de_ejecucion, '%d/%m/%Y') as fechaFormateada
                FROM Ronda_asignada ra
                INNER JOIN usuarios u ON ra.id_usuario = u.id_usuario
                INNER JOIN Rutas r ON ra.id_ruta = r.id_ruta
                INNER JOIN Tipo_ronda tr ON ra.id_tipo = tr.id_tipo
                ORDER BY ra.fecha_de_ejecucion DESC, ra.id_ronda_asignada DESC
            ");
            $asignaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Para cada asignación, contar cuántos puntos tiene la ruta
            foreach ($asignaciones as &$asignacion) {
                $stmt = $pdo->prepare("
                    SELECT COUNT(*) 
                    FROM Ruta_coordenadas 
                    WHERE id_ruta = ?
                ");
                $stmt->execute([$asignacion['rutaId']]);
                $asignacion['rutaPuntos'] = intval($stmt->fetchColumn());
            }

            echo json_encode(['exito' => true, 'datos' => $asignaciones]);
        } catch (PDOException $e) {
            echo json_encode(['exito' => false, 'mensaje' => 'Error: ' . $e->getMessage()]);
        }
    }

    // Obtener asignaciones de un guardia específico
    elseif ($accion === 'obtener_por_guardia') {
        $guardiaId = isset($_GET['guardiaId']) ? intval($_GET['guardiaId']) : 0;

        try {
            $stmt = $pdo->prepare("
                SELECT 
                    ra.id_ronda_asignada as id,
                    ra.id_usuario as guardiaId,
                    u.nombre as guardiaNombre,
                    ra.id_ruta as rutaId,
                    r.nombre_ruta as rutaNombre,
                    ra.id_tipo as tipoRondaId,
                    tr.nombre_tipo_ronda as tipoRonda,
                    ra.fecha_de_ejecucion as fecha,
                    ra.hora_de_ejecucion as horaInicio,
                    ra.distancia_permitida as radioTolerancia
                FROM Ronda_asignada ra
                INNER JOIN usuarios u ON ra.id_usuario = u.id_usuario
                INNER JOIN Rutas r ON ra.id_ruta = r.id_ruta
                INNER JOIN Tipo_ronda tr ON ra.id_tipo = tr.id_tipo
                WHERE ra.id_usuario = ?
                ORDER BY ra.fecha_de_ejecucion DESC
            ");
            $stmt->execute([$guardiaId]);
            $asignaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(['exito' => true, 'datos' => $asignaciones]);
        } catch (PDOException $e) {
            echo json_encode(['exito' => false, 'mensaje' => 'Error: ' . $e->getMessage()]);
        }
    }

    // Obtener una asignación específica
    elseif ($accion === 'obtener_una') {
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;

        try {
            $stmt = $pdo->prepare("
                SELECT 
                    ra.*,
                    u.nombre as guardiaNombre,
                    u.correo as guardiaEmail,
                    r.nombre_ruta as rutaNombre,
                    tr.nombre_tipo_ronda as tipoRonda
                FROM Ronda_asignada ra
                INNER JOIN usuarios u ON ra.id_usuario = u.id_usuario
                INNER JOIN Rutas r ON ra.id_ruta = r.id_ruta
                INNER JOIN Tipo_ronda tr ON ra.id_tipo = tr.id_tipo
                WHERE ra.id_ronda_asignada = ?
            ");
            $stmt->execute([$id]);
            $asignacion = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($asignacion) {
                echo json_encode(['exito' => true, 'datos' => $asignacion]);
            } else {
                echo json_encode(['exito' => false, 'mensaje' => 'Asignación no encontrada']);
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

    // ==================== CREAR ASIGNACIÓN ====================
    if ($accion === 'crear') {
        $guardiaId = intval($datos['guardiaId']);
        $rutaId = intval($datos['rutaId']);
        $tipoRondaId = intval($datos['tipoRondaId']); // 1=Externo, 2=Interno
        $fecha = trim($datos['fecha']);
        $horaInicio = isset($datos['horaInicio']) ? trim($datos['horaInicio']) : '';
        $radioTolerancia = floatval($datos['radioTolerancia']);

        // Debug: registrar datos recibidos (remover en producción)
        error_log("Datos recibidos - Guardia: $guardiaId, Ruta: $rutaId, Tipo: $tipoRondaId, Fecha: $fecha, Hora: $horaInicio, Radio: $radioTolerancia");

        // Validaciones
        if ($guardiaId <= 0) {
            echo json_encode(['exito' => false, 'mensaje' => 'Guardia inválido']);
            exit;
        }

        if ($rutaId <= 0) {
            echo json_encode(['exito' => false, 'mensaje' => 'Ruta inválida']);
            exit;
        }

        if (!in_array($tipoRondaId, [1, 2])) {
            echo json_encode(['exito' => false, 'mensaje' => 'Tipo de ronda inválido']);
            exit;
        }

        if (empty($fecha)) {
            echo json_encode(['exito' => false, 'mensaje' => 'Fecha requerida']);
            exit;
        }

        if (empty($horaInicio)) {
            echo json_encode(['exito' => false, 'mensaje' => 'Hora de inicio requerida. Valor recibido: ' . var_export($horaInicio, true)]);
            exit;
        }

        if ($radioTolerancia < 5 || $radioTolerancia > 500) {
            echo json_encode(['exito' => false, 'mensaje' => 'Radio de tolerancia debe estar entre 5 y 500 metros']);
            exit;
        }

        try {
            // Verificar que el guardia existe y es tipo guardia (id_tipo = 1)
            $stmt = $pdo->prepare("SELECT id_tipo FROM usuarios WHERE id_usuario = ?");
            $stmt->execute([$guardiaId]);
            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$usuario) {
                echo json_encode(['exito' => false, 'mensaje' => 'Usuario no encontrado']);
                exit;
            }

            if ($usuario['id_tipo'] != 1) {
                echo json_encode(['exito' => false, 'mensaje' => 'El usuario seleccionado no es un guardia']);
                exit;
            }

            // Verificar que la ruta existe
            $stmt = $pdo->prepare("SELECT id_ruta FROM Rutas WHERE id_ruta = ?");
            $stmt->execute([$rutaId]);
            if (!$stmt->fetch()) {
                echo json_encode(['exito' => false, 'mensaje' => 'Ruta no encontrada']);
                exit;
            }

            // Insertar asignación
            $stmt = $pdo->prepare("
                INSERT INTO Ronda_asignada 
                (id_tipo, id_usuario, id_ruta, fecha_de_ejecucion, hora_de_ejecucion, distancia_permitida) 
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([$tipoRondaId, $guardiaId, $rutaId, $fecha, $horaInicio, $radioTolerancia]);

            $asignacionId = $pdo->lastInsertId();

            echo json_encode([
                'exito' => true,
                'mensaje' => 'Ruta asignada exitosamente',
                'id' => $asignacionId
            ]);
        } catch (PDOException $e) {
            echo json_encode(['exito' => false, 'mensaje' => 'Error al asignar: ' . $e->getMessage()]);
        }
    }

    // ==================== ACTUALIZAR ASIGNACIÓN ====================
    elseif ($accion === 'actualizar') {
        $id = intval($datos['id']);
        $guardiaId = intval($datos['guardiaId']);
        $rutaId = intval($datos['rutaId']);
        $tipoRondaId = intval($datos['tipoRondaId']);
        $fecha = trim($datos['fecha']);
        $horaInicio = trim($datos['horaInicio']);
        $radioTolerancia = floatval($datos['radioTolerancia']);

        // Validaciones similares a crear
        if ($radioTolerancia < 5 || $radioTolerancia > 500) {
            echo json_encode(['exito' => false, 'mensaje' => 'Radio de tolerancia inválido']);
            exit;
        }

        try {
            // Verificar que la asignación existe
            $stmt = $pdo->prepare("SELECT id_ronda_asignada FROM Ronda_asignada WHERE id_ronda_asignada = ?");
            $stmt->execute([$id]);
            if (!$stmt->fetch()) {
                echo json_encode(['exito' => false, 'mensaje' => 'Asignación no encontrada']);
                exit;
            }

            // Actualizar
            $stmt = $pdo->prepare("
                UPDATE Ronda_asignada 
                SET id_tipo = ?, 
                    id_usuario = ?, 
                    id_ruta = ?, 
                    fecha_de_ejecucion = ?,
                    hora_de_ejecucion = ?, 
                    distancia_permitida = ?
                WHERE id_ronda_asignada = ?
            ");
            $stmt->execute([$tipoRondaId, $guardiaId, $rutaId, $fecha, $horaInicio, $radioTolerancia, $id]);

            echo json_encode(['exito' => true, 'mensaje' => 'Asignación actualizada']);
        } catch (PDOException $e) {
            echo json_encode(['exito' => false, 'mensaje' => 'Error: ' . $e->getMessage()]);
        }
    }

    // ==================== ELIMINAR ASIGNACIÓN ====================
    elseif ($accion === 'eliminar') {
        $id = intval($datos['id']);

        try {
            // Verificar si hay rondas ejecutadas con esta asignación
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM rondas_usuarios WHERE id_ronda_asignada = ?");
            $stmt->execute([$id]);

            if ($stmt->fetchColumn() > 0) {
                echo json_encode([
                    'exito' => false,
                    'mensaje' => 'No se puede eliminar. Ya hay rondas ejecutadas con esta asignación'
                ]);
                exit;
            }

            // Eliminar
            $stmt = $pdo->prepare("DELETE FROM Ronda_asignada WHERE id_ronda_asignada = ?");
            $stmt->execute([$id]);

            echo json_encode(['exito' => true, 'mensaje' => 'Asignación eliminada']);
        } catch (PDOException $e) {
            echo json_encode(['exito' => false, 'mensaje' => 'Error: ' . $e->getMessage()]);
        }
    }

    else {
        echo json_encode(['exito' => false, 'mensaje' => 'Acción no válida']);
    }
}
?>