// script_asignar_rutas.js - Actualizado con APIs de base de datos

let asignacionesGuardadas = [];
let guardiasCargados = [];
let rutasCargadas = [];

// ==================== INICIALIZACIÓN ====================
document.addEventListener("DOMContentLoaded", async function () {
  if (document.getElementById("container-asignaciones")) {
    await inicializarAsignaciones();
  }
});

async function inicializarAsignaciones() {
  await cargarGuardias();
  await cargarRutas();
  await cargarAsignaciones();
  await actualizarTablaAsignaciones();

  const formAsignar = document.getElementById("form-asignar-ruta");
  if (formAsignar) {
    formAsignar.addEventListener("submit", async function (e) {
      e.preventDefault();
      await asignarRuta();
    });
  }
}

// ==================== CARGAR DATOS ====================
async function cargarGuardias() {
  try {
    const response = await fetch("api_usuarios.php?accion=obtener");
    const resultado = await response.json();

    if (resultado.exito) {
      // Filtrar solo guardias (id_tipo = 1)
      guardiasCargados = resultado.datos.filter((u) => u.id_tipo === 1);
      actualizarSelectGuardias();
      console.log("✅ Guardias cargados:", guardiasCargados.length);
    } else {
      console.error("Error al cargar guardias");
      guardiasCargados = [];
    }
  } catch (error) {
    console.error("Error:", error);
    guardiasCargados = [];
  }
}

async function cargarRutas() {
  try {
    const response = await fetch("api_rutas.php?accion=obtener");
    const resultado = await response.json();

    if (resultado.exito) {
      rutasCargadas = resultado.datos;
      actualizarSelectRutas();
      console.log("✅ Rutas cargadas:", rutasCargadas.length);
    } else {
      console.error("Error al cargar rutas");
      rutasCargadas = [];
    }
  } catch (error) {
    console.error("Error:", error);
    rutasCargadas = [];
  }
}

async function cargarAsignaciones() {
  try {
    const response = await fetch("api_asignaciones.php?accion=obtener");
    const resultado = await response.json();

    if (resultado.exito) {
      asignacionesGuardadas = resultado.datos;
      console.log("✅ Asignaciones cargadas:", asignacionesGuardadas.length);
    } else {
      console.error("Error al cargar asignaciones");
      asignacionesGuardadas = [];
    }
  } catch (error) {
    console.error("Error:", error);
    asignacionesGuardadas = [];
  }
}

// ==================== ACTUALIZAR SELECTORES ====================
function actualizarSelectGuardias() {
  const select = document.getElementById("select-guardia");
  if (!select) return;

  select.innerHTML = '<option value="">-- Selecciona un guardia --</option>';

  guardiasCargados.forEach((guardia) => {
    const email = guardia.correo || "Sin correo";
    select.innerHTML += `<option value="${guardia.id_usuario}">${guardia.nombre} (${email})</option>`;
  });

  if (guardiasCargados.length === 0) {
    select.innerHTML = '<option value="">No hay guardias registrados</option>';
  }
}

function actualizarSelectRutas() {
  const select = document.getElementById("select-ruta");
  if (!select) return;

  select.innerHTML = '<option value="">-- Selecciona una ruta --</option>';

  rutasCargadas.forEach((ruta) => {
    const numPuntos = ruta.puntos ? ruta.puntos.length : 0;
    select.innerHTML += `<option value="${ruta.id}">${ruta.nombre} (${numPuntos} puntos)</option>`;
  });

  if (rutasCargadas.length === 0) {
    select.innerHTML = '<option value="">No hay rutas creadas</option>';
  }
}

// ==================== ASIGNAR RUTA ====================
async function asignarRuta() {
  const guardiaId = parseInt(document.getElementById("select-guardia").value);
  const rutaId = parseInt(document.getElementById("select-ruta").value);
  const tipoRondaId = parseInt(document.getElementById("tipo-ronda").value);
  const fecha = document.getElementById("fecha-asignacion").value;
  const horaInicio = document.getElementById("hora-inicio").value;
  const radioTolerancia = parseInt(
    document.getElementById("radio-tolerancia").value
  );

  // Debug: Verificar valores capturados
  console.log("Datos capturados:", {
    guardiaId,
    rutaId,
    tipoRondaId,
    fecha,
    horaInicio,
    radioTolerancia,
  });

  // Validaciones
  if (!guardiaId) {
    alert("⚠️ Por favor, selecciona un guardia.");
    return;
  }

  if (!rutaId) {
    alert("⚠️ Por favor, selecciona una ruta.");
    return;
  }

  if (!tipoRondaId) {
    alert("⚠️ Por favor, selecciona el tipo de ronda.");
    return;
  }

  if (!fecha) {
    alert("⚠️ Selecciona una fecha.");
    return;
  }

  if (!horaInicio || horaInicio.trim() === "") {
    alert("⚠️ Selecciona la hora de inicio.");
    return;
  }

  if (!radioTolerancia || radioTolerancia < 5 || radioTolerancia > 500) {
    alert("⚠️ Radio de tolerancia debe estar entre 5 y 500 metros.");
    return;
  }

  // Verificar conflicto de horario
  const conflicto = asignacionesGuardadas.some(
    (a) => a.guardiaId === guardiaId && a.fecha === fecha
  );

  if (conflicto) {
    if (
      !confirm(
        "⚠️ Ya existe una asignación para este guardia en esta fecha. ¿Continuar?"
      )
    ) {
      return;
    }
  }

  try {
    const response = await fetch("api_asignaciones.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accion: "crear",
        guardiaId: guardiaId,
        rutaId: rutaId,
        tipoRondaId: tipoRondaId,
        fecha: fecha,
        horaInicio: horaInicio,
        radioTolerancia: radioTolerancia,
      }),
    });

    const resultado = await response.json();

    if (resultado.exito) {
      mostrarMensajeAsignacion("✅ Ruta asignada exitosamente", "success");
      document.getElementById("form-asignar-ruta").reset();
      await cargarAsignaciones();
      await actualizarTablaAsignaciones();
    } else {
      alert("⚠️ " + resultado.mensaje);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("❌ Error al asignar la ruta");
  }
}

// ==================== ACTUALIZAR TABLA DE ASIGNACIONES ====================
async function actualizarTablaAsignaciones() {
  const tbody = document.getElementById("tbody-asignaciones");
  if (!tbody) return;

  if (asignacionesGuardadas.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="sin-datos">
          No hay asignaciones registradas aún
        </td>
      </tr>
    `;
    return;
  }

  // Ordenar por fecha descendente
  const asignacionesOrdenadas = [...asignacionesGuardadas].sort((a, b) => {
    const fechaA = new Date(a.fecha);
    const fechaB = new Date(b.fecha);
    return fechaB - fechaA;
  });

  let html = "";
  asignacionesOrdenadas.forEach((asignacion) => {
    const tipoRondaBadge =
      asignacion.tipoRonda === "Externo"
        ? '<span style="background: #28a745; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px;">🌍 Externo</span>'
        : '<span style="background: #007bff; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px;">🏢 Interno</span>';

    html += `
      <tr>
        <td>
          <strong>${asignacion.guardiaNombre}</strong><br>
          <small style="color: #6c757d;">${
            asignacion.guardiaEmail || "Sin correo"
          }</small>
        </td>
        <td>
          <strong>${asignacion.rutaNombre}</strong><br>
          <small style="color: #6c757d;">${
            asignacion.rutaPuntos
          } puntos - Radio: ${asignacion.radioTolerancia}m</small>
        </td>
        <td>
          ${formatearFecha(asignacion.fecha)}<br>
          <small style="color: #6c757d;">⏰ ${asignacion.horaInicio}</small><br>
          ${tipoRondaBadge}
        </td>
        <td>
          <button class="btn-accion btn-ver" onclick="verDetalleAsignacion(${
            asignacion.id
          })">👁 Ver</button>
          <button class="btn-accion btn-eliminar" onclick="eliminarAsignacion(${
            asignacion.id
          })">🗑</button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// ==================== VER DETALLE DE ASIGNACIÓN ====================
async function verDetalleAsignacion(idAsignacion) {
  const asignacion = asignacionesGuardadas.find((a) => a.id === idAsignacion);
  if (!asignacion) return;

  // Obtener detalles completos de la ruta
  try {
    const response = await fetch(
      `api_rutas.php?accion=obtener_una&id=${asignacion.rutaId}`
    );
    const resultado = await response.json();

    if (resultado.exito) {
      const ruta = resultado.datos;
      mostrarModalDetalleAsignacion(asignacion, ruta);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error al cargar los detalles");
  }
}

function mostrarModalDetalleAsignacion(asignacion, ruta) {
  const modalExistente = document.getElementById("modal-detalle-asignacion");
  if (modalExistente) modalExistente.remove();

  const puntosList = ruta.puntos
    .map(
      (p, index) =>
        `<div style="padding: 8px; background: #0044cc; margin: 5px 0; border-radius: 4px;">
      <strong>${index + 1}.</strong> ${p.nombre} 
      <small style="color: #e9eef3ff;">(${p.lat}, ${p.lng})</small>
    </div>`
    )
    .join("");

  const modal = document.createElement("div");
  modal.id = "modal-detalle-asignacion";
  modal.className = "modal-asignacion";
  modal.innerHTML = `
    <div class="modal-asignacion-content">
      <span class="close-modal" onclick="cerrarModalAsignacion()">&times;</span>
      <h2>📋 Detalle de Asignación</h2>
      
      <div class="info-asignacion">
        <div class="info-item">
          <strong>👤 Guardia:</strong>
          <span>${asignacion.guardiaNombre}</span>
        </div>
        
        <div class="info-item">
          <strong>📧 Correo:</strong>
          <span>${asignacion.guardiaEmail || "No disponible"}</span>
        </div>
        
        <div class="info-item">
          <strong>🗺️ Ruta:</strong>
          <span>${asignacion.rutaNombre}</span>
        </div>
        
        <div class="info-item">
          <strong>📍 Tipo de Ronda:</strong>
          <span>${asignacion.tipoRonda}</span>
        </div>
        
        <div class="info-item">
          <strong>📅 Fecha:</strong>
          <span>${formatearFecha(asignacion.fecha)}</span>
        </div>
        
        <div class="info-item">
          <strong>⏰ Hora de Inicio:</strong>
          <span>${asignacion.horaInicio}</span>
        </div>
        
        <div class="info-item">
          <strong>📏 Radio de Tolerancia:</strong>
          <span>${asignacion.radioTolerancia} metros</span>
        </div>
      </div>
      
      <h3 style="margin-top: 20px; color: #0044cc;">📍 Puntos de la Ruta</h3>
      <div style="max-height: 300px; overflow-y: auto;">
        ${puntosList}
      </div>
      
      <div class="modal-acciones">
        <button class="btn-modal btn-cerrar" onclick="cerrarModalAsignacion()">
          Cerrar
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.style.display = "flex";

  if (!document.getElementById("estilos-modal-asignacion")) {
    agregarEstilosModalAsignacion();
  }
}

function cerrarModalAsignacion() {
  const modal = document.getElementById("modal-detalle-asignacion");
  if (modal) {
    modal.style.display = "none";
    modal.remove();
  }
}

// ==================== ELIMINAR ASIGNACIÓN ====================
async function eliminarAsignacion(idAsignacion) {
  const asignacion = asignacionesGuardadas.find((a) => a.id === idAsignacion);
  if (!asignacion) return;

  if (
    !confirm(
      `¿Eliminar la asignación de "${asignacion.rutaNombre}" a ${asignacion.guardiaNombre}?`
    )
  ) {
    return;
  }

  try {
    const response = await fetch("api_asignaciones.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accion: "eliminar",
        id: idAsignacion,
      }),
    });

    const resultado = await response.json();

    if (resultado.exito) {
      mostrarMensajeAsignacion(
        "🗑️ Asignación eliminada correctamente",
        "success"
      );
      await cargarAsignaciones();
      await actualizarTablaAsignaciones();
    } else {
      alert("⚠️ " + resultado.mensaje);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("❌ Error al eliminar la asignación");
  }
}

// ==================== FUNCIONES AUXILIARES ====================
function formatearFecha(fecha) {
  const date = new Date(fecha + "T00:00:00");
  return date.toLocaleDateString("es-ES", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function mostrarMensajeAsignacion(mensaje, tipo) {
  let mensajeDiv = document.getElementById("mensaje-asignacion");

  if (!mensajeDiv) {
    mensajeDiv = document.createElement("div");
    mensajeDiv.id = "mensaje-asignacion";
    const container = document.getElementById("container-asignaciones");
    if (container) {
      container.insertBefore(mensajeDiv, container.firstChild);
    }
  }

  mensajeDiv.className = tipo === "success" ? "mensaje-exito" : "mensaje-error";
  mensajeDiv.textContent = mensaje;
  mensajeDiv.style.display = "block";

  setTimeout(() => {
    mensajeDiv.style.display = "none";
  }, 3000);
}

function agregarEstilosModalAsignacion() {
  const style = document.createElement("style");
  style.id = "estilos-modal-asignacion";
  style.innerHTML = `
    .modal-asignacion {
      display: none;
      position: fixed;
      z-index: 1000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.6);
      justify-content: center;
      align-items: center;
      animation: fadeIn 0.3s ease;
    }

    .modal-asignacion-content {
      background-color: #fff;
      padding: 30px;
      border-radius: 12px;
      width: 90%;
      max-width: 700px;
      max-height: 85vh;
      overflow-y: auto;
      position: relative;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      animation: slideDown 0.3s ease;
    }

    .close-modal {
      position: absolute;
      right: 20px;
      top: 20px;
      font-size: 28px;
      font-weight: bold;
      color: #999;
      cursor: pointer;
      transition: color 0.3s ease;
    }

    .close-modal:hover {
      color: #333;
    }

    .modal-asignacion-content h2 {
      color: #0044cc;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 3px solid #0044cc;
      font-size: 1.5rem;
    }

    .info-asignacion {
      margin: 20px 0;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 15px;
      margin: 10px 0;
      background-color: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #0044cc;
      transition: all 0.3s ease;
    }

    .info-item:hover {
      background-color: #e3f2fd;
      transform: translateX(5px);
    }

    .info-item strong {
      color: #0044cc;
      font-size: 1rem;
    }

    .info-item span {
      color: #333;
      font-weight: 500;
    }

    .modal-acciones {
      display: flex;
      gap: 10px;
      margin-top: 25px;
      justify-content: flex-end;
    }

    .btn-modal {
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      transition: all 0.3s ease;
    }

    .btn-cerrar {
      background-color: #6c757d;
      color: white;
    }

    .btn-cerrar:hover {
      background-color: #5a6268;
      transform: translateY(-2px);
    }

    @media (max-width: 768px) {
      .modal-asignacion-content {
        width: 95%;
        padding: 20px;
        max-height: 90vh;
      }

      .info-item {
        flex-direction: column;
        gap: 5px;
      }
    }
  `;
  document.head.appendChild(style);
}

// Hacer funciones globales
window.verDetalleAsignacion = verDetalleAsignacion;
window.cerrarModalAsignacion = cerrarModalAsignacion;
window.eliminarAsignacion = eliminarAsignacion;
