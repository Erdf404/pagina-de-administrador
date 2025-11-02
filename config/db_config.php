<?php
// config/db_config.php - Configuración segura de base de datos usando .env

// Definir rutas base del proyecto
define('BASE_PATH', dirname(__DIR__)); // Raíz del proyecto
define('CONFIG_PATH', __DIR__); // Carpeta config
define('API_PATH', BASE_PATH . '/api');
define('PAGES_PATH', BASE_PATH . '/pages');
define('ASSETS_PATH', BASE_PATH . '/assets');
define('INCLUDES_PATH', BASE_PATH . '/includes');

/**
 * Carga las variables de entorno desde el archivo .env
 */
function cargarEnv($ruta = null) {
    if ($ruta === null) {
        $ruta = BASE_PATH . '/.env'; // Buscar .env en la raíz
    }
    
    if (!file_exists($ruta)) {
        throw new Exception("Archivo .env no encontrado en: $ruta");
    }

    $lineas = file($ruta, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    
    foreach ($lineas as $linea) {
        // Ignorar comentarios
        if (strpos(trim($linea), '#') === 0) {
            continue;
        }

        // Separar clave=valor
        if (strpos($linea, '=') !== false) {
            list($clave, $valor) = explode('=', $linea, 2);
            $clave = trim($clave);
            $valor = trim($valor);
            
            // Remover comillas si existen
            $valor = trim($valor, '"\'');
            
            // Establecer variable de entorno
            if (!array_key_exists($clave, $_ENV)) {
                $_ENV[$clave] = $valor;
                putenv("$clave=$valor");
            }
        }
    }
}

// Cargar variables de entorno
try {
    cargarEnv();
} catch (Exception $e) {
    error_log("Error al cargar .env: " . $e->getMessage());
    die("Error de configuración del sistema");
}

/**
 * Función para conectar a la base de datos
 * Lee las credenciales desde el archivo .env
 * @return PDO|null
 */
function conectarBD() {
    // Obtener credenciales desde variables de entorno
    $host = getenv('DB_HOST') ?: $_ENV['DB_HOST'] ?? 'localhost';
    $dbname = getenv('DB_NAME') ?: $_ENV['DB_NAME'] ?? 'sistema_rondas';
    $usuario_bd = getenv('DB_USER') ?: $_ENV['DB_USER'] ?? 'root';
    $password_bd = getenv('DB_PASS') ?: $_ENV['DB_PASS'] ?? '';
    
    try {
        $pdo = new PDO(
            "mysql:host=$host;dbname=$dbname;charset=utf8mb4", 
            $usuario_bd, 
            $password_bd
        );
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
        return $pdo;
    } catch (PDOException $e) {
        error_log("Error de conexión a BD: " . $e->getMessage());
        return null;
    }
}