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
            <label>Fecha de Asignación:</label>
            <input type="date" id="fecha-asignacion" required />
          </div>

          <div class="form-section">
            <label>Hora de Inicio:</label>
            <input type="time" id="hora-inicio" required />
          </div>
          <div class="form-section">
            <label>Hora de Finalizacion:</label>
            <input type="time" id="hora-fin" required />
          </div>
        </div>

    <div class="botones-control">
    <button type="submit" class="success">Guardar Asignación</button>
    <button type="reset" class="peligro">Limpiar</button>
    </div>
      </form>
    </div>
    <!--Filtros-->
    <div class="filtros-container">
      <h4> Filtrar Asignaciones</h4>
      <div class="filtros-row">
        <div class="form-section">
          <label>Buscar guardia:</label>
          <input type="text" id="filtro-guardia" placeholder="Nombre o email">
        </div>

        <div class="form-section">
          <label>Fecha:</label>
          <input type="date" id="filtro-fecha">
        </div>

        <div class="form-section">
          <label>Estado:</label>
          <select id="filtro-estado">
            <option value="">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_curso">En curso</option>
            <option value="completada">Completada</option>
          </select>
        </div>

        <div style="display: flex; gap: 10px;">
          <button onclick="filtrarAsignaciones()" class="success" style="padding: 10px 20px;">🔍 Filtrar</button>
          <button onclick="limpiarFiltros()" class="peligro" style="padding: 10px 20px;">❌ Limpiar</button>
        </div>
      </div>
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
              <th>Fecha</th>
              <th>Hora Inicio</th>
              <th>Hora Fin</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="tbody-asignaciones">
            <tr>
              <td colspan="7" class="sin-datos">
                No hay asignaciones registradas aún
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  

</html>