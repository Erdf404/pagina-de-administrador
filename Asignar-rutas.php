<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <title>Asignar Rutas a Guardias</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">


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



</html>