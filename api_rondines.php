<?php
// api_rondines.php - API para gestión de rondines ejecutados

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
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

// ==================== GET: Obtener rondines ====================
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $accion = isset($_GET['accion']) ? $_GET['accion'] : '';
    
    $pdo = conectarBD();
    if (!$pdo) {
        echo json_encode(['exito' => false, 'mensaje' => 'Error de conexión']);
        exit;
    }

    // Obtener todos los rondines
    if ($accion === 'obtener') {
        $guardiaId = isset($_GET['guardiaId']) ? intval($_GET['guardiaId']) : 0;
        
        try {
            $sql = "
                SELECT 
                    ru.id_ronda_usuario as id,
                    ru.id_usuario as guardiaId,
                    u.nombre as guardiaNombre,
                    ru.fecha,
                    ru.hora_inicio as horaInicio,
                    ru.hora_final as horaFinal,
                    ra.id_tipo as tipoRondaId,
                    tr.nombre_tipo_ronda as tipoRonda,
                    r.nombre_ruta as rutaNombre,
                    r.id_ruta as rutaId
                FROM rondas_usuarios ru
                INNER JOIN usuarios u ON ru.id_usuario = u.id_usuario
                INNER JOIN Ronda_asignada ra ON ru.id_ronda_asignada = ra.id_ronda_asignada
                INNER JOIN Rutas r ON ra.id_ruta = r.id_ruta
                INNER JOIN Tipo_ronda tr ON ra.id_tipo = tr.id_tipo
            ";
            
            if ($guardiaId > 0) {
                $sql .= " WHERE ru.id_usuario = ?";
                $stmt = $pdo->prepare($sql . " ORDER BY ru.fecha DESC, ru.hora_inicio DESC");
                $stmt->execute([$guardiaId]);
            } else {
                $stmt = $pdo->query($sql . " ORDER BY ru.fecha DESC, ru.hora_inicio DESC");
            }
            
            $rondines = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['exito' => true, 'datos' => $rondines]);
        } catch (PDOException $e) {
            echo json_encode(['exito' => false, 'mensaje' => 'Error: ' . $e->getMessage()]);
        }
    }
    
    // Obtener coordenadas de un rondín específico
    elseif ($accion === 'obtener_coordenadas') {
        $rondinId = isset($_GET['id']) ? intval($_GET['id']) : 0;
        
        try {
            $stmt = $pdo->prepare("
                SELECT 
                    id,
                    hora_actual as hora,
                    latitud_actual as lat,
                    longitud_actual as lng,
                    codigo_qr as qr,
                    verificador
                FROM coordenadas_usuarios
                WHERE id_ronda_usuario = ?
                ORDER BY hora_actual ASC
            ");
            $stmt->execute([$rondinId]);
            $coordenadas = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['exito' => true, 'datos' => $coordenadas]);
        } catch (PDOException $e) {
            echo json_encode(['exito' => false, 'mensaje' => 'Error: ' . $e->getMessage()]);
        }
    }
}