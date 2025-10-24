// script_mapa.js - Actualizado para usar APIs de base de datos

// Variables globales
const map = L.map("map").setView([20.702314, -103.473337], 17);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
  maxZoom: 19,
}).addTo(map);

let marcadorTemporal = null;
let puntosGuardados = [];
let rutasGuardadas = [];
let rutaTemporal = [];
let rutaActualPolyline = null;
let marcadoresRuta = [];

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', async function() {
  await cargarDatos();
});

// Event listeners del mapa
map.on("click", function (e) {
  crearMarcadorTemporal(e.latlng.lat, e.latlng.lng);
});

// ==================== FUNCIONES DE CARGA DE DATOS ====================
async function cargarDatos() {
  await cargarPuntos();
  await cargarRutas();
  actualizarSelectPuntos();
}

async function cargarPuntos() {
  try {
    const response = await fetch('api_coordenadas.php?accion=obtener');
    const resultado = await response.json();

    if (resultado.exito) {
      puntosGuardados = resultado.datos;
      actualizarTablaPuntos();
      console.log('✅ Puntos cargados:', puntosGuardados.length);
    } else {
      console.error('Error al cargar puntos:', resultado.mensaje);
      puntosGuardados = [];
    }
  } catch (error) {
    console.error('Error:', error);
    puntosGuardados = [];
  }
}

async function cargarRutas() {
  try {
    const response = await fetch('api_rutas.php?accion=obtener');
    const resultado = await response.json();

    if (resultado.exito) {
      rutasGuardadas = resultado.datos;
      actualizarTablaRutas();
      console.log('✅ Rutas cargadas:', rutasGuardadas.length);
    } else {
      console.error('Error al cargar rutas:', resultado.mensaje);
      rutasGuardadas = [];
    }
  } catch (error) {
    console.error('Error:', error);
    rutasGuardadas = [];
  }
}

// ==================== GESTIÓN DE PUNTOS ====================
function crearMarcadorTemporal(lat, lng) {
  if (marcadorTemporal) {
    map.removeLayer(marcadorTemporal);
  }

  marcadorTemporal = L.marker([lat, lng]).addTo(map);
  marcadorTemporal
    .bindPopup(`
      <b>Nuevo Punto</b><br>
      Lat: ${lat.toFixed(6)}<br>
      Lng: ${lng.toFixed(6)}<br>
      <small>Asigna un nombre y guárdalo</small>
    `)
    .openPopup();

  marcadorTemporal.on("contextmenu", function (e) {
    e.originalEvent.preventDefault();
    limpiarMarcadorTemporal();
  });
}

function limpiarMarcadorTemporal() {
  if (marcadorTemporal) {
    map.removeLayer(marcadorTemporal);
    marcadorTemporal = null;
  }
}

async function guardarPunto() {
  const nombrePunto = document.getElementById("nombre_punto").value.trim();

  if (!nombrePunto) {
    alert("Por favor, ingresa un nombre para el punto.");
    return;
  }

  if (!marcadorTemporal) {
    alert("Por favor, selecciona una ubicación en el mapa.");
    return;
  }

  const lat = marcadorTemporal.getLatLng().lat;
  const lng = marcadorTemporal.getLatLng().lng;

  try {
    const response = await fetch('api_coordenadas.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accion: 'crear',
        nombre: nombrePunto,
        lat: lat,
        lng: lng
      })
    });

    const resultado = await response.json();

    if (resultado.exito) {
      mostrarMensaje("✅ Punto guardado exitosamente", "success");
      document.getElementById("nombre_punto").value = "";
      limpiarMarcadorTemporal();
      await cargarPuntos();
      actualizarSelectPuntos();
    } else {
      alert("⚠️ " + resultado.mensaje);
    }
  } catch (error) {
    console.error('Error:', error);
    alert("❌ Error al guardar el punto");
  }
}

function actualizarTablaPuntos() {
  const tbody = document.getElementById("tbody-puntos");

  if (puntosGuardados.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="sin-datos">
          No hay puntos guardados aún
        </td>
      </tr>
    `;
    return;
  }

  let html = "";
  puntosGuardados.forEach((punto) => {
    html += `
      <tr>
        <td><strong>${punto.nombre}</strong></td>
        <td>${punto.lat}, ${punto.lng}</td>
        <td>${punto.fecha}</td>
        <td>
          <button class="btn-accion btn-ver" onclick="verPunto(${punto.id})">👁 Ver</button>
          <button class="btn-accion btn-eliminar" onclick="eliminarPunto(${punto.id})">🗑</button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function verPunto(idPunto) {
  const punto = puntosGuardados.find((p) => p.id === idPunto);
  if (!punto) return;

  limpiarMarcadorTemporal();
  map.setView([punto.lat, punto.lng], 17);

  setTimeout(() => {
    marcadorTemporal = L.marker([punto.lat, punto.lng]).addTo(map);
    marcadorTemporal
      .bindPopup(`
        <b>${punto.nombre}</b><br>
        Lat: ${punto.lat}<br>
        Lng: ${punto.lng}<br>
        <small>Creado: ${punto.fecha}</small>
      `)
      .openPopup();
  }, 100);
}

async function eliminarPunto(idPunto) {
  const punto = puntosGuardados.find((p) => p.id === idPunto);
  if (!punto) return;

  if (!confirm(`¿Eliminar el punto "${punto.nombre}"?`)) return;

  try {
    const response = await fetch('api_coordenadas.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accion: 'eliminar',
        id: idPunto
      })
    });

    const resultado = await response.json();

    if (resultado.exito) {
      mostrarMensaje("🗑 Punto eliminado correctamente", "success");
      await cargarPuntos();
      actualizarSelectPuntos();
    } else {
      alert("⚠️ " + resultado.mensaje);
    }
  } catch (error) {
    console.error('Error:', error);
    alert("❌ Error al eliminar el punto");
  }
}

// ==================== GESTIÓN DE RUTAS ====================
function actualizarSelectPuntos() {
  const select = document.getElementById("select_punto");
  select.innerHTML = '<option value="">-- Selecciona un punto --</option>';

  puntosGuardados.forEach((punto) => {
    select.innerHTML += `<option value="${punto.id}">${punto.nombre}</option>`;
  });
}

function agregarPuntoRuta() {
  const selectPunto = document.getElementById("select_punto");
  const puntoId = parseInt(selectPunto.value);

  if (!puntoId) {
    alert("Por favor, selecciona un punto.");
    return;
  }

  const punto = puntosGuardados.find((p) => p.id === puntoId);
  if (!punto) return;

  if (rutaTemporal.some((p) => p.id === puntoId)) {
    alert("Este punto ya está en la ruta.");
    return;
  }

  rutaTemporal.push(punto);
  actualizarListaPuntosRuta();
  actualizarRutaEnMapa();
  selectPunto.value = "";
}

function actualizarListaPuntosRuta() {
  const contenedor = document.getElementById("lista-puntos-ruta");

  if (rutaTemporal.length === 0) {
    contenedor.innerHTML = '<p class="sin-datos">No hay puntos seleccionados</p>';
    return;
  }

  let html = "";
  rutaTemporal.forEach((punto, index) => {
    html += `
      <div class="punto-seleccionado">
        <span class="orden-numero">${index + 1}</span>
        <strong>${punto.nombre}</strong>
        <button class="btn-quitar" onclick="quitarPuntoRuta(${index})">✖</button>
      </div>
    `;
  });

  contenedor.innerHTML = html;
}

function quitarPuntoRuta(index) {
  rutaTemporal.splice(index, 1);
  actualizarListaPuntosRuta();
  actualizarRutaEnMapa();
}

function actualizarRutaEnMapa() {
  limpiarRutaActual();

  if (rutaTemporal.length < 2) return;

  const coordenadas = rutaTemporal.map((punto) => [punto.lat, punto.lng]);
  rutaActualPolyline = L.polyline(coordenadas, {
    color: "#ff0000",
    weight: 4,
    opacity: 0.7,
    dashArray: "10, 10",
  }).addTo(map);

  map.fitBounds(rutaActualPolyline.getBounds(), { padding: [20, 20] });
}

async function guardarRuta() {
  const nombreRuta = document.getElementById("nombre_ruta").value.trim();

  if (!nombreRuta) {
    alert("Por favor, ingresa un nombre para la ruta.");
    return;
  }

  if (rutaTemporal.length < 2) {
    alert("Una ruta debe tener al menos 2 puntos.");
    return;
  }

  const puntosIds = rutaTemporal.map(p => p.id);

  try {
    const response = await fetch('api_rutas.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accion: 'crear',
        nombre: nombreRuta,
        descripcion: `Ruta con ${rutaTemporal.length} puntos`,
        puntos: puntosIds
      })
    });

    const resultado = await response.json();

    if (resultado.exito) {
      mostrarMensaje("✅ Ruta guardada exitosamente", "success");
      limpiarRutaTemporal();
      await cargarRutas();
    } else {
      alert("⚠️ " + resultado.mensaje);
    }
  } catch (error) {
    console.error('Error:', error);
    alert("❌ Error al guardar la ruta");
  }
}

function limpiarRutaTemporal() {
  rutaTemporal = [];
  document.getElementById("nombre_ruta").value = "";
  actualizarListaPuntosRuta();
  limpiarRutaActual();
}

function actualizarTablaRutas() {
  const tbody = document.getElementById("tbody-rutas");

  if (rutasGuardadas.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="sin-datos">
          No hay rutas guardadas aún
        </td>
      </tr>
    `;
    return;
  }

  let html = "";
  rutasGuardadas.forEach((ruta) => {
    const puntosList = ruta.puntos.map((p) => p.nombre).join(", ");
    html += `
      <tr>
        <td><strong>${ruta.nombre}</strong></td>
        <td>${puntosList} (${ruta.puntos.length} puntos)</td>
        <td>${ruta.fecha}</td>
        <td>
          <button class="btn-accion btn-ruta" onclick="verRuta(${ruta.id})">🗺️ Ver</button>
          <button class="btn-accion btn-eliminar" onclick="eliminarRuta(${ruta.id})">🗑</button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function verRuta(idRuta) {
  const ruta = rutasGuardadas.find((r) => r.id === idRuta);
  if (!ruta) return;

  limpiarMarcadorTemporal();
  limpiarRutaActual();

  const coordenadas = ruta.puntos.map((punto) => [parseFloat(punto.lat), parseFloat(punto.lng)]);
  rutaActualPolyline = L.polyline(coordenadas, {
    color: "#2196f3",
    weight: 5,
    opacity: 0.8,
  }).addTo(map);

  ruta.puntos.forEach((punto, index) => {
    const marcador = L.marker([parseFloat(punto.lat), parseFloat(punto.lng)], {
      icon: L.divIcon({
        className: "custom-div-icon",
        html: `<div style="background-color: #2196f3; color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white;">${index + 1}</div>`,
        iconSize: [25, 25],
        iconAnchor: [12.5, 12.5],
      }),
    }).addTo(map);

    marcador.bindPopup(`
      <b>${punto.nombre}</b><br>
      Orden: ${index + 1}<br>
      Ruta: ${ruta.nombre}
    `);

    marcadoresRuta.push(marcador);
  });

  map.fitBounds(rutaActualPolyline.getBounds(), { padding: [50, 50] });
}

async function eliminarRuta(idRuta) {
  const ruta = rutasGuardadas.find((r) => r.id === idRuta);
  if (!ruta) return;

  if (!confirm(`¿Eliminar la ruta "${ruta.nombre}"?`)) return;

  try {
    const response = await fetch('api_rutas.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accion: 'eliminar',
        id: idRuta
      })
    });

    const resultado = await response.json();

    if (resultado.exito) {
      mostrarMensaje("🗑 Ruta eliminada correctamente", "success");
      await cargarRutas();
    } else {
      alert("⚠️ " + resultado.mensaje);
    }
  } catch (error) {
    console.error('Error:', error);
    alert("❌ Error al eliminar la ruta");
  }
}

function limpiarRutaActual() {
  if (rutaActualPolyline) {
    map.removeLayer(rutaActualPolyline);
    rutaActualPolyline = null;
  }

  marcadoresRuta.forEach(marcador => {
    map.removeLayer(marcador);
  });
  marcadoresRuta = [];
}

// ==================== FUNCIONES AUXILIARES ====================
function mostrarMensaje(mensaje, tipo) {
  const div = document.getElementById("mensaje-exito");
  div.textContent = mensaje;
  div.style.display = "block";
  setTimeout(() => (div.style.display = "none"), 3000);
}

// Hacer funciones globales
window.guardarPunto = guardarPunto;
window.limpiarMarcadorTemporal = limpiarMarcadorTemporal;
window.verPunto = verPunto;
window.eliminarPunto = eliminarPunto;
window.agregarPuntoRuta = agregarPuntoRuta;
window.quitarPuntoRuta = quitarPuntoRuta;
window.guardarRuta = guardarRuta;
window.limpiarRutaTemporal = limpiarRutaTemporal;
window.verRuta = verRuta;
window.eliminarRuta = eliminarRuta;