<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <title>Asignar Rutas a Guardias</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="estilo_mapa.css" />
</head>

<body>
  <div class="container" id="container-asignaciones">
    <h1>Asignar Rutas a Guardias</h1>

    <!-- Formulario de asignación -->
    <div class="form-asignar">
      <h3>Asignar Nueva Ruta</h3>
      <form id="form-asignar-ruta">
        <div class="form-row">
          <div class="form-section">
            <label>Guardia:</label>
            <select id="select-guardia" required>
              <option value="">-- Selecciona un guardia --</option>
            </select>
          </div>

          <div class="form-section">
            <label>Ruta:</label>
            <select id="select-ruta" required>
              <option value="">-- Selecciona una ruta --</option>
            </select>
          </div>
        </div>

        <div class="form-row-triple">
          <div class="form-section">
            <label>Tipo de Ronda:</label>
            <select id="tipo-ronda" required>
              <option value="">-- Selecciona el tipo --</option>
              <option value="1">🌍 Externo</option>
              <option value="2">🏢 Interno</option>
            </select>
          </div>

          <div class="form-section">
            <label>Fecha de Asignación:</label>
            <input type="date" id="fecha-asignacion" required />
          </div>

          <div class="form-section">
            <label>Hora de Inicio:</label>
            <input type="time" id="hora-inicio" step="60" required />
          </div>
        </div>

        <div class="form-section">
          <label>Radio de Tolerancia (metros):</label>
          <input type="number" id="radio-tolerancia" min="5" max="500" value="50" required>
        </div>

        <div class="botones-control">
          <button type="submit" class="success">💾 Guardar Asignación</button>
          <button type="reset" class="peligro">🗑️ Limpiar</button>
        </div>
      </form>
    </div>

    <!-- Tabla de asignaciones -->
    <div class="panel">
      <h3>Asignaciones Registradas</h3>
      <div style="overflow-x: auto;">
        <table class="tabla">
          <thead>
            <tr>
              <th>Guardia</th>
              <th>Ruta</th>
              <th>Fecha, Hora y Tipo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="tbody-asignaciones">
            <tr>
              <td colspan="4" class="sin-datos">
                No hay asignaciones registradas aún
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Scripts -->
  <script src="script_usuarios.js"></script>
  <script src="script_asignar_rutas.js"></script>
</body>

</html>