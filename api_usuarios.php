<?php
// api_usuarios.php - API para gestion de usuarios con MySQL

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Incluir configuración y funciones comunes
require_once 'config.php';

// Configuracion de la base de datos
$host = 'localhost';
$dbname = 'sistema_rondas';
$usuario_bd = 'root'; // Nombre de usuario de la base de datos
$password_bd = 'admin';    //contraseña de la base de datos

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

// Función para obtener el id_tipo según el tipo de usuario
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

// Función para obtener el nombre del tipo de usuario
function obtenerNombreTipo($id_tipo)
{
  switch ($id_tipo) {
    case 1:
      return 'Guardia';
    case 2:
      return 'Administrador A1';
    case 3:
      return 'Administrador A2';
    case 4:
      return 'Administrador A3';
    default:
      return 'Usuario';
  }
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

  // ==================== LOGIN ====================
  if ($accion === 'login') {
    $email = $datos['email'];
    $password = $datos['password'];

    try {
      // Buscar usuario por correo
      $stmt = $pdo->prepare("SELECT id_usuario, id_tipo, nombre, correo, contrasena FROM usuarios WHERE correo = ?");
      $stmt->execute([$email]);
      $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

      if (!$usuario) {
        echo json_encode(['valido' => false, 'mensaje' => 'Usuario no encontrado']);
        exit;
      }

      // Verificar contraseña
      if (!password_verify($password, $usuario['contrasena'])) {
        echo json_encode(['valido' => false, 'mensaje' => 'Contraseña incorrecta']);
        exit;
      }
      // Configurar sesión
      $_SESSION['usuario_id'] = $usuario['id_usuario'];
      $_SESSION['usuario_nombre'] = $usuario['nombre'];
      $_SESSION['usuario_correo'] = $usuario['correo'];
      $_SESSION['tipo_usuario'] = $usuario['id_tipo'];
      $_SESSION['ultima_actividad'] = time();
      session_regenerate_id(true);

      // Login exitoso - No enviar la contraseña al cliente
      unset($usuario['contrasena']);
      $usuario['tipoUsuarioNombre'] = obtenerNombreTipo($usuario['id_tipo']);

      echo json_encode([
        'valido' => true,
        'mensaje' => 'Login exitoso',
        'usuario' => $usuario
      ]);
    } catch (PDOException $e) {
      echo json_encode(['valido' => false, 'mensaje' => 'Error al validar credenciales: ' . $e->getMessage()]);
    }
  }

  // ==================== RECUPERAR CONTRASEÑA ====================
  elseif ($accion === 'recuperar_password') {
    $email = $datos['email'];

    try {
      // Verificar si el usuario existe
      $stmt = $pdo->prepare("SELECT id_usuario, nombre FROM usuarios WHERE correo = ?");
      $stmt->execute([$email]);
      $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

      if (!$usuario) {
        echo json_encode(['exito' => false, 'mensaje' => 'No se encontró un usuario con ese correo']);
        exit;
      }

      // proxima implementacion: el envío de email real
      // por ahora solo simulamos el envío
      // generar token de recuperación (opcional para implementación futura)

      echo json_encode([
        'exito' => true,
        'mensaje' => "Se envió un enlace de recuperación a $email"
      ]);
    } catch (PDOException $e) {
      echo json_encode(['exito' => false, 'mensaje' => 'Error al procesar solicitud: ' . $e->getMessage()]);
    }
  }

  // ==================== AGREGAR USUARIO ====================
  elseif ($accion === 'agregar') {
    $tipoUsuario = $datos['tipoUsuario'];
    $tipoAdmin = isset($datos['tipoAdmin']) ? $datos['tipoAdmin'] : '';
    $nombre = $datos['nombre'];
    $email = $datos['email'];
    $password = $datos['password'];

    try {
      // Verificar si el correo ya existe
      $stmt = $pdo->prepare("SELECT COUNT(*) FROM usuarios WHERE correo = ?");
      $stmt->execute([$email]);
      $existe = $stmt->fetchColumn();

      if ($existe > 0) {
        echo json_encode(['exito' => false, 'mensaje' => 'Ya existe un usuario con ese correo electrónico']);
        exit;
      }

      // Obtener id_tipo
      $id_tipo = obtenerIdTipo($tipoUsuario, $tipoAdmin);

      // Hash de la contraseña
      $password_hash = password_hash($password, PASSWORD_DEFAULT);

      // Insertar usuario
      $stmt = $pdo->prepare("INSERT INTO usuarios (id_tipo, nombre, contrasena, correo) VALUES (?, ?, ?, ?)");
      $stmt->execute([$id_tipo, $nombre, $password_hash, $email]);

      echo json_encode(['exito' => true, 'mensaje' => 'Usuario agregado correctamente']);
    } catch (PDOException $e) {
      echo json_encode(['exito' => false, 'mensaje' => 'Error al agregar usuario: ' . $e->getMessage()]);
    }
  }

  // ==================== MODIFICAR USUARIO ====================
  elseif ($accion === 'modificar') {
    $idUsuario = $datos['idUsuario'];
    $nombre = $datos['nombre'];
    $email = $datos['email'];
    $tipoUsuario = $datos['tipoUsuario'];
    $tipoAdmin = isset($datos['tipoAdmin']) ? $datos['tipoAdmin'] : '';
    $password = isset($datos['password']) ? $datos['password'] : '';

    try {
      // Verificar si el correo ya existe en otro usuario
      $stmt = $pdo->prepare("SELECT COUNT(*) FROM usuarios WHERE correo = ? AND id_usuario != ?");
      $stmt->execute([$email, $idUsuario]);
      $existe = $stmt->fetchColumn();

      if ($existe > 0) {
        echo json_encode(['exito' => false, 'mensaje' => 'Ya existe otro usuario con ese correo electrónico']);
        exit;
      }

      // Obtener id_tipo
      $id_tipo = obtenerIdTipo($tipoUsuario, $tipoAdmin);

      // Actualizar usuario
      if (!empty($password)) {
        // Actualizar con nueva contraseña
        $password_hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE usuarios SET id_tipo = ?, nombre = ?, contrasena = ?, correo = ? WHERE id_usuario = ?");
        $stmt->execute([$id_tipo, $nombre, $password_hash, $email, $idUsuario]);
      } else {
        // Actualizar sin cambiar contraseña
        $stmt = $pdo->prepare("UPDATE usuarios SET id_tipo = ?, nombre = ?, correo = ? WHERE id_usuario = ?");
        $stmt->execute([$id_tipo, $nombre, $email, $idUsuario]);
      }

      echo json_encode(['exito' => true, 'mensaje' => 'Usuario modificado correctamente']);
    } catch (PDOException $e) {
      echo json_encode(['exito' => false, 'mensaje' => 'Error al modificar usuario: ' . $e->getMessage()]);
    }
  }

  // ==================== ELIMINAR USUARIO ====================
  elseif ($accion === 'eliminar') {
    $idUsuario = $datos['idUsuario'];

    try {
      // Verificar si el usuario tiene rondas asignadas
      $stmt = $pdo->prepare("SELECT COUNT(*) FROM Ronda_asignada WHERE id_usuario = ?");
      $stmt->execute([$idUsuario]);
      $tieneRondas = $stmt->fetchColumn();

      if ($tieneRondas > 0) {
        echo json_encode(['exito' => false, 'mensaje' => 'No se puede eliminar el usuario porque tiene rondas asignadas']);
        exit;
      }

      // Eliminar usuario
      $stmt = $pdo->prepare("DELETE FROM usuarios WHERE id_usuario = ?");
      $stmt->execute([$idUsuario]);

      echo json_encode(['exito' => true, 'mensaje' => 'Usuario eliminado correctamente']);
    } catch (PDOException $e) {
      echo json_encode(['exito' => false, 'mensaje' => 'Error al eliminar usuario: ' . $e->getMessage()]);
    }
  } else {
    echo json_encode(['exito' => false, 'mensaje' => 'Acción no válida']);
  }
}
