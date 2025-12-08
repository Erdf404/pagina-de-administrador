<?php
// api_rondines.php - API para gestión de rondines ejecutados

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // agregar https://dominio.com cuando esté en producción
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Incluir archivos de configuración
require_once __DIR__ . '/../config/db_config.php';
require_once __DIR__ . '/../config/config.php';


// Verificar sesión
if (!verificarSesion()) {
    http_response_code(401);
    echo json_encode(['exito' => false, 'mensaje' => 'Sesión no válida']);
    exit;
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
                WHERE 1=1
            ";

            // FILTRO POR PERMISOS
            if (esGuardia()) {
                // Guardias SOLO ven sus propios rondines
                $sql .= " AND ru.id_usuario = " . obtenerIdUsuario();
            } elseif ($guardiaId > 0 && tienePermiso('ver_todos_rondines')) {
                // Admins pueden filtrar por guardia específico
                $sql .= " AND ru.id_usuario = " . intval($guardiaId);
            }
            // Si es admin y no hay filtro, ve todos
            
            $sql .= " ORDER BY ru.fecha DESC, ru.hora_inicio DESC";
            
            $stmt = $pdo->query($sql);
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
        // Verificar que el usuario tenga permiso para ver este rondín
        if (esGuardia()) {
            $stmt = $pdo->prepare("
                SELECT id_usuario FROM rondas_usuarios WHERE id_ronda_usuario = ?
            ");
            $stmt->execute([$rondinId]);
            $rondin = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$rondin || $rondin['id_usuario'] != obtenerIdUsuario()) {
                http_response_code(403);
                echo json_encode(['exito' => false, 'mensaje' => 'No tienes permiso para ver este rondín']);
                exit;
            }
        }
        
        // Obtener coordenadas con nombres de los puntos
        $stmt = $pdo->prepare("
            SELECT 
                cu.id,
                cu.hora_actual as hora,
                cu.latitud_actual as lat,
                cu.longitud_actual as lng,
                cu.codigo_qr as qr,
                cu.verificador,
                COALESCE(
                    -- Primero buscar por código QR exacto
                    (SELECT nombre_coordenada 
                     FROM Coordenadas_admin 
                     WHERE codigo_qr = cu.codigo_qr 
                     LIMIT 1),
                    -- Buscar por coordenadas GPS con tolerancia de 0.001 grados (~111 metros)
                    -- Esto cubre el radio de tolerancia típico de rondines
                    (SELECT nombre_coordenada 
                     FROM Coordenadas_admin 
                     WHERE ABS(latitud - cu.latitud_actual) < 0.001 
                     AND ABS(longitud - cu.longitud_actual) < 0.001
                     AND latitud IS NOT NULL
                     AND longitud IS NOT NULL
                     ORDER BY 
                         SQRT(POW(latitud - cu.latitud_actual, 2) + POW(longitud - cu.longitud_actual, 2))
                     LIMIT 1),
                    'Punto desconocido'
                ) as nombre_punto
            FROM coordenadas_usuarios cu
            WHERE cu.id_ronda_usuario = ?
            ORDER BY cu.hora_actual ASC
        ");
        $stmt->execute([$rondinId]);
        $coordenadas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['exito' => true, 'datos' => $coordenadas]);
    } catch (PDOException $e) {
        echo json_encode(['exito' => false, 'mensaje' => 'Error: ' . $e->getMessage()]);
    }
}
}
?>