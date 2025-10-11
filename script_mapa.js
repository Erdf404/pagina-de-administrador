// Variables globales
const map = L.map("map").setView([20.702314, -103.473337], 19);

// Solo OpenStreetMap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
  maxZoom: 19,
}).addTo(map);

let marcadorTemporal = null;
let puntosGuardados = [];
let rutasGuardadas = [];
let rutaTemporal = [];
let contadorPuntos = 1;
let contadorRutas = 1;
let rutaActualPolyline = null;
let marcadoresRuta = []; // Array para guardar marcadores de rutas

// Inicialización
cargarDatos();

// Event listeners
map.on("click", function (e) {
  crearMarcadorTemporal(e.latlng.lat, e.latlng.lng);
});

// Funciones para puntos
function crearMarcadorTemporal(lat, lng) {
  if (marcadorTemporal) {
    map.removeLayer(marcadorTemporal);
  }

  marcadorTemporal = L.marker([lat, lng]).addTo(map);
  marcadorTemporal
    .bindPopup(
      `
                <b>Nuevo Punto</b><br>
                Lat: ${lat}<br>
                Lng: ${lng}<br>
                <small>Asigna un nombre y guárdalo</small>
            `
    )
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

// Nueva función para limpiar TODO el mapa
function limpiarMapaCompleto() {
  limpiarMarcadorTemporal();
  limpiarRutaActual();
}

function guardarPunto() {
  const nombrePunto = document.getElementById("nombre_punto").value.trim();

  if (!nombrePunto) {
    alert("Por favor, ingresa un nombre para el punto.");
    return;
  }

  if (!marcadorTemporal) {
    alert("Por favor, selecciona una ubicación en el mapa.");
    return;
  }

  if (
    puntosGuardados.some(
      (p) => p.nombre.toLowerCase() === nombrePunto.toLowerCase()
    )
  ) {
    alert("Ya existe un punto con ese nombre.");
    return;
  }

  const lat = marcadorTemporal.getLatLng().lat.toFixed(6);
  const lng = marcadorTemporal.getLatLng().lng.toFixed(6);

  const punto = {
    id: contadorPuntos++,
    nombre: nombrePunto,
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    fecha: new Date().toLocaleString("es-ES"),
  };

  puntosGuardados.push(punto);
  guardarDatos();
  actualizarTablaPuntos();
  actualizarSelectPuntos();
  mostrarMensaje("✅ Punto guardado exitosamente", "success");

  document.getElementById("nombre_punto").value = "";
  limpiarMarcadorTemporal();
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

  // Solo limpiar el marcador temporal anterior (NO la ruta)
  limpiarMarcadorTemporal();

  // Centrar el mapa en el punto
  map.setView([punto.lat, punto.lng], 19);

  // Pequeño delay para asegurar que el mapa se centre correctamente
  setTimeout(() => {
    marcadorTemporal = L.marker([punto.lat, punto.lng]).addTo(map);
    marcadorTemporal
      .bindPopup(
        `
                <b>${punto.nombre}</b><br>
                Lat: ${punto.lat}<br>
                Lng: ${punto.lng}<br>
                <small>Creado: ${punto.fecha}</small>
            `
      )
      .openPopup();
  }, 100);
}

function eliminarPunto(idPunto) {
  const punto = puntosGuardados.find((p) => p.id === idPunto);
  if (!punto) return;

  if (confirm(`¿Eliminar el punto "${punto.nombre}"?`)) {
    puntosGuardados = puntosGuardados.filter((p) => p.id !== idPunto);
    guardarDatos();
    actualizarTablaPuntos();
    actualizarSelectPuntos();
    mostrarMensaje("🗑 Punto eliminado correctamente", "success");
  }
}

// Funciones para rutas
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

  // Verificar si ya está en la ruta
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
    contenedor.innerHTML =
      '<p class="sin-datos">No hay puntos seleccionados</p>';
    return;
  }

  let html = "";
  rutaTemporal.forEach((punto, index) => {
    html += `
                    <div class="punto-seleccionado">
                        <span class="orden-numero">${index + 1}</span>
                        <strong>${punto.nombre}</strong>
                        <button class="btn-quitar" onclick="quitarPuntoRuta(${index})">❌</button>
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
  // Remover ruta anterior
  limpiarRutaActual();

  if (rutaTemporal.length < 2) return;

  // Crear nueva ruta
  const coordenadas = rutaTemporal.map((punto) => [punto.lat, punto.lng]);
  rutaActualPolyline = L.polyline(coordenadas, {
    color: "#ff0000",
    weight: 4,
    opacity: 0.7,
    dashArray: "10, 10",
  }).addTo(map);

  // Ajustar vista del mapa
  map.fitBounds(rutaActualPolyline.getBounds(), {
    padding: [20, 20],
  });
}

function guardarRuta() {
  const nombreRuta = document.getElementById("nombre_ruta").value.trim();

  if (!nombreRuta) {
    alert("Por favor, ingresa un nombre para la ruta.");
    return;
  }

  if (rutaTemporal.length < 2) {
    alert("Una ruta debe tener al menos 2 puntos.");
    return;
  }

  if (
    rutasGuardadas.some(
      (r) => r.nombre.toLowerCase() === nombreRuta.toLowerCase()
    )
  ) {
    alert("Ya existe una ruta con ese nombre.");
    return;
  }

  const ruta = {
    id: contadorRutas++,
    nombre: nombreRuta,
    puntos: [...rutaTemporal],
    fecha: new Date().toLocaleString("es-ES"),
  };

  rutasGuardadas.push(ruta);
  guardarDatos();
  actualizarTablaRutas();
  mostrarMensaje("✅ Ruta guardada exitosamente", "success");

  limpiarRutaTemporal();
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

  // Limpiar vista anterior
  limpiarMarcadorTemporal();
  limpiarRutaActual();

  // Mostrar ruta en el mapa
  const coordenadas = ruta.puntos.map((punto) => [punto.lat, punto.lng]);
  rutaActualPolyline = L.polyline(coordenadas, {
    color: "#2196f3",
    weight: 5,
    opacity: 0.8,
  }).addTo(map);

  // Agregar marcadores numerados
  ruta.puntos.forEach((punto, index) => {
    const marcador = L.marker([punto.lat, punto.lng], {
      icon: L.divIcon({
        className: "custom-div-icon",
        html: `<div style="background-color: #2196f3; color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white;">${
          index + 1
        }</div>`,
        iconSize: [25, 25],
        iconAnchor: [12.5, 12.5],
      }),
    }).addTo(map);

    marcador.bindPopup(`
                    <b>${punto.nombre}</b><br>
                    Orden: ${index + 1}<br>
                    Ruta: ${ruta.nombre}
                `);
    
    // Guardar marcador para poder eliminarlo después
    marcadoresRuta.push(marcador);
  });

  // Ajustar vista del mapa
  map.fitBounds(rutaActualPolyline.getBounds(), {
    padding: [50, 50],
  });
}

// Nueva función para limpiar rutas y marcadores
function limpiarRutaActual() {
  // Limpiar polyline
  if (rutaActualPolyline) {
    map.removeLayer(rutaActualPolyline);
    rutaActualPolyline = null;
  }
  
  // Limpiar todos los marcadores de ruta
  marcadoresRuta.forEach(marcador => {
    map.removeLayer(marcador);
  });
  marcadoresRuta = [];
}

function eliminarRuta(idRuta) {
  const ruta = rutasGuardadas.find((r) => r.id === idRuta);
  if (!ruta) return;

  if (confirm(`¿Eliminar la ruta "${ruta.nombre}"?`)) {
    rutasGuardadas = rutasGuardadas.filter((r) => r.id !== idRuta);
    guardarDatos();
    actualizarTablaRutas();
    mostrarMensaje("🗑 Ruta eliminada correctamente", "success");
  }
}

// Funciones auxiliares
function mostrarMensaje(mensaje, tipo) {
  const div = document.getElementById("mensaje-exito");
  div.textContent = mensaje;
  div.style.display = "block";
  setTimeout(() => (div.style.display = "none"), 3000);
}

function guardarDatos() {
  localStorage.setItem("puntosGuardados", JSON.stringify(puntosGuardados));
  localStorage.setItem("rutasGuardadas", JSON.stringify(rutasGuardadas));
  localStorage.setItem("contadorPuntos", contadorPuntos);
  localStorage.setItem("contadorRutas", contadorRutas);
}

function cargarDatos() {
  const puntos = localStorage.getItem("puntosGuardados");
  const rutas = localStorage.getItem("rutasGuardadas");
  const contadorP = localStorage.getItem("contadorPuntos");
  const contadorR = localStorage.getItem("contadorRutas");

  if (puntos) puntosGuardados = JSON.parse(puntos);
  if (rutas) rutasGuardadas = JSON.parse(rutas);
  if (contadorP) contadorPuntos = parseInt(contadorP);
  if (contadorR) contadorRutas = parseInt(contadorR);

  actualizarTablaPuntos();
  actualizarTablaRutas();
  actualizarSelectPuntos();
}
