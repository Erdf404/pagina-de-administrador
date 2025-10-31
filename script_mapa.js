// script_mapa_qr.js - Sistema integrado de GPS y QR

// Variables globales
const map = L.map("map").setView([20.702314, -103.473337], 17);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
  maxZoom: 19,
}).addTo(map);

let marcadorTemporal = null;
let puntosGuardados = [];
let qrsGuardados = [];
let rutasGuardadas = [];
let rutaTemporal = [];
let rutaActualPolyline = null;
let marcadoresRuta = [];
let qrActual = null;

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', async function() {
  await cargarDatos();
});

// Event listeners del mapa
map.on("click", function (e) {
  crearMarcadorTemporal(e.latlng.lat, e.latlng.lng);
});

// ==================== GESTIÓN DE PESTAÑAS ====================
function cambiarTab(tab) {
  // Ocultar todos los tabs
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
  
  // Mostrar tab seleccionado
  document.getElementById(`tab-${tab}`).classList.add('active');
  
  // Activar el botón correspondiente
  const buttons = document.querySelectorAll('.tab-button');
  const tabNames = ['gps', 'qr', 'rutas'];
  const tabIndex = tabNames.indexOf(tab);
  if (tabIndex >= 0 && buttons[tabIndex]) {
    buttons[tabIndex].classList.add('active');
  }
  
  // Actualizar mapa si es necesario
  if (tab === 'gps') {
    setTimeout(() => map.invalidateSize(), 100);
  }
}

// ==================== FUNCIONES DE CARGA DE DATOS ====================
async function cargarDatos() {
  await cargarPuntosGPS();
  await cargarPuntosQR();
  await cargarRutas();
  actualizarSelectPuntos();
}

async function cargarPuntosGPS() {
  try {
    const response = await fetch('api_coordenadas.php?accion=obtener_gps');
    const resultado = await response.json();

    if (resultado.exito) {
      puntosGuardados = resultado.datos;
      actualizarTablaPuntos();
      console.log('✅ Puntos GPS cargados:', puntosGuardados.length);
    } else {
      console.error('Error al cargar puntos GPS:', resultado.mensaje);
      puntosGuardados = [];
    }
  } catch (error) {
    console.error('Error:', error);
    puntosGuardados = [];
  }
}

async function cargarPuntosQR() {
  try {
    const response = await fetch('api_coordenadas.php?accion=obtener_qr');
    const resultado = await response.json();

    if (resultado.exito) {
      qrsGuardados = resultado.datos;
      actualizarTablaQRs();
      console.log('✅ Puntos QR cargados:', qrsGuardados.length);
    } else {
      console.error('Error al cargar QRs:', resultado.mensaje);
      qrsGuardados = [];
    }
  } catch (error) {
    console.error('Error:', error);
    qrsGuardados = [];
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

// ==================== GESTIÓN DE PUNTOS GPS ====================
function crearMarcadorTemporal(lat, lng) {
  if (marcadorTemporal) {
    map.removeLayer(marcadorTemporal);
  }

  marcadorTemporal = L.marker([lat, lng]).addTo(map);
  marcadorTemporal
    .bindPopup(`
      <b>Nuevo Punto GPS</b><br>
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
      mostrarMensaje("✅ Punto GPS guardado exitosamente", "success");
      document.getElementById("nombre_punto").value = "";
      limpiarMarcadorTemporal();
      await cargarPuntosGPS();
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
          No hay puntos GPS guardados aún
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
        <small>Tipo: GPS</small>
      `)
      .openPopup();
  }, 100);
}

async function eliminarPunto(idPunto) {
  const punto = puntosGuardados.find((p) => p.id === idPunto);
  if (!punto) return;

  if (!confirm(`¿Eliminar el punto GPS "${punto.nombre}"?`)) return;

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
      mostrarMensaje("🗑 Punto GPS eliminado correctamente", "success");
      await cargarPuntosGPS();
      actualizarSelectPuntos();
    } else {
      alert("⚠️ " + resultado.mensaje);
    }
  } catch (error) {
    console.error('Error:', error);
    alert("❌ Error al eliminar el punto");
  }
}

// ==================== GESTIÓN DE CÓDIGOS QR ====================
function generarQR() {
  const nombre = document.getElementById('nombre_qr').value.trim();

  if (!nombre) {
    alert('⚠️ Por favor, ingresa un nombre para el código QR');
    return;
  }

  // Generar código QR automáticamente con formato correcto
  const timestamp = Date.now();
  const nombreLimpio = nombre.toUpperCase()
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9_]/g, '')
    .substring(0, 20);
  
  const numeroAleatorio = Math.floor(Math.random() * 900) + 100;
  const codigoQR = `QR_${nombreLimpio}_${numeroAleatorio}`;

  const preview = document.getElementById('qr-preview');
  const canvas = document.getElementById('qr-canvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  canvas.width = 300;
  canvas.height = 300;

  const qrDiv = document.createElement('div');
  const qr = new QRCode(qrDiv, {
    text: codigoQR,
    width: 300,
    height: 300,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H
  });

  setTimeout(() => {
    const qrImg = qrDiv.querySelector('img');
    if (qrImg) {
      ctx.drawImage(qrImg, 0, 0, 300, 300);
      
      qrActual = {
        nombre: nombre,
        codigo: codigoQR
      };

      document.getElementById('qr-nombre-preview').textContent = nombre;
      document.getElementById('qr-codigo-preview').textContent = codigoQR;
      preview.style.display = 'block';
      mostrarMensaje('✅ Código QR generado. Descárgalo o guárdalo.', 'success');
    }
  }, 100);
}

function descargarQR() {
  if (!qrActual) {
    alert('⚠️ No hay un código QR generado');
    return;
  }

  const canvas = document.getElementById('qr-canvas');
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = 400;
  finalCanvas.height = 480;
  const ctx = finalCanvas.getContext('2d');

  // Fondo blanco
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

  // Dibujar QR
  ctx.drawImage(canvas, 50, 60, 300, 300);

  // Nombre del punto
  ctx.fillStyle = '#0044cc';
  ctx.font = 'bold 22px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(qrActual.nombre, 200, 35);

  // Código QR
  ctx.fillStyle = '#333';
  ctx.font = 'bold 14px Courier New';
  ctx.fillText(qrActual.codigo, 200, 385);

  // Instrucciones
  ctx.font = '12px Arial';
  ctx.fillStyle = '#666';
  ctx.fillText('Escanea este código durante tu ronda', 200, 410);

  // Footer
  ctx.font = '10px Arial';
  ctx.fillStyle = '#999';
  ctx.fillText('🔳 Sistema de Rondines - TSJ', 200, 465);

  const link = document.createElement('a');
  link.download = `QR-${qrActual.nombre.replace(/\s+/g, '_')}.png`;
  link.href = finalCanvas.toDataURL('image/png');
  link.click();

  mostrarMensaje('✅ Código QR descargado', 'success');
}

async function guardarQR() {
  if (!qrActual) {
    alert('⚠️ No hay un código QR generado');
    return;
  }

  try {
    const response = await fetch('api_coordenadas.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accion: 'crear_qr',
        nombre: qrActual.nombre,
        codigo_qr: qrActual.codigo
      })
    });

    const resultado = await response.json();

    if (resultado.exito) {
      mostrarMensaje('✅ Código QR guardado correctamente', 'success');
      limpiarFormularioQR();
      await cargarPuntosQR();
      actualizarSelectPuntos();
    } else {
      alert('⚠️ ' + resultado.mensaje);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error al guardar');
  }
}

function limpiarFormularioQR() {
  document.getElementById('nombre_qr').value = '';
  document.getElementById('qr-preview').style.display = 'none';
  
  const canvas = document.getElementById('qr-canvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  qrActual = null;
}

function actualizarTablaQRs() {
  const tbody = document.getElementById('tbody-qrs');

  if (qrsGuardados.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="sin-datos">
          No hay códigos QR guardados aún
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  qrsGuardados.forEach((qr) => {
    html += `
      <tr>
        <td><strong>${qr.nombre}</strong></td>
        <td><code style="font-size: 11px;">${qr.codigo_qr}</code></td>
        <td>${qr.fecha}</td>
        <td>
          <button class="btn-accion btn-ver" onclick="verQR(${qr.id})">👁 Ver</button>
          <button class="btn-accion btn-eliminar" onclick="eliminarQR(${qr.id})">🗑</button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function verQR(idQR) {
  const qr = qrsGuardados.find(q => q.id === idQR);
  if (!qr) return;

  const modal = document.createElement('div');
  modal.style.cssText = 'display: flex; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); justify-content: center; align-items: center;';
  
  modal.innerHTML = `
    <div style="background: white; padding: 30px; border-radius: 12px; max-width: 500px; text-align: center; position: relative;">
      <span onclick="this.parentElement.parentElement.remove()" style="position: absolute; right: 15px; top: 10px; font-size: 28px; cursor: pointer; color: #999;">&times;</span>
      <h2 style="color: #0044cc;">🔳 ${qr.nombre}</h2>
      <p><strong>Código:</strong> <code style="font-size: 12px; word-break: break-all; background: #f0f0f0; padding: 5px 10px; border-radius: 4px;">${qr.codigo_qr}</code></p>
      <div id="qr-modal-canvas" style="margin: 20px 0;"></div>
      <button onclick="descargarQRGuardado(${qr.id})" class="success" style="padding: 12px 24px; margin: 5px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; background: #28a745; color: white;">💾 Descargar</button>
      <button onclick="this.parentElement.parentElement.remove()" style="padding: 12px 24px; margin: 5px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; background: #6c757d; color: white;">Cerrar</button>
    </div>
  `;
  
  document.body.appendChild(modal);

  setTimeout(() => {
    new QRCode(document.getElementById('qr-modal-canvas'), {
      text: qr.codigo_qr,
      width: 300,
      height: 300,
      correctLevel: QRCode.CorrectLevel.H
    });
  }, 100);
}

function descargarQRGuardado(idQR) {
  const qr = qrsGuardados.find(q => q.id === idQR);
  if (!qr) return;

  const tempDiv = document.createElement('div');
  new QRCode(tempDiv, {
    text: qr.codigo_qr,
    width: 300,
    height: 300,
    correctLevel: QRCode.CorrectLevel.H
  });

  setTimeout(() => {
    const qrImg = tempDiv.querySelector('img');
    if (qrImg) {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 400, 480);
      ctx.drawImage(qrImg, 50, 60, 300, 300);

      ctx.fillStyle = '#0044cc';
      ctx.font = 'bold 22px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(qr.nombre, 200, 35);

      ctx.fillStyle = '#333';
      ctx.font = 'bold 14px Courier New';
      ctx.fillText(qr.codigo_qr, 200, 385);

      ctx.font = '12px Arial';
      ctx.fillStyle = '#666';
      ctx.fillText('Escanea este código durante tu ronda', 200, 410);

      ctx.font = '10px Arial';
      ctx.fillStyle = '#999';
      ctx.fillText('🔳 Sistema de Rondines - TSJ', 200, 465);

      const link = document.createElement('a');
      link.download = `QR-${qr.nombre.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      mostrarMensaje('✅ Descargado', 'success');
    }
  }, 100);
}

async function eliminarQR(idQR) {
  const qr = qrsGuardados.find(q => q.id === idQR);
  if (!qr || !confirm(`¿Eliminar el código QR "${qr.nombre}"?`)) return;

  try {
    const response = await fetch('api_coordenadas.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'eliminar', id: idQR })
    });

    const resultado = await response.json();

    if (resultado.exito) {
      mostrarMensaje('🗑️ QR eliminado', 'success');
      await cargarPuntosQR();
      actualizarSelectPuntos();
    } else {
      alert('⚠️ ' + resultado.mensaje);
    }
  } catch (error) {
    alert('❌ Error al eliminar');
  }
}

// ==================== GESTIÓN DE RUTAS ====================
function actualizarSelectPuntos() {
  const select = document.getElementById('select_punto');
  const filtro = document.getElementById('filtro-tipo-punto').value;
  
  select.innerHTML = '<option value="">-- Selecciona un punto --</option>';

  // Combinar puntos GPS y QR según filtro
  let puntosDisponibles = [];
  
  if (filtro === 'todos' || filtro === 'GPS') {
    puntosDisponibles = puntosDisponibles.concat(
      puntosGuardados.map(p => ({...p, tipoDisplay: '📍 GPS'}))
    );
  }
  
  if (filtro === 'todos' || filtro === 'QR') {
    puntosDisponibles = puntosDisponibles.concat(
      qrsGuardados.map(q => ({...q, tipoDisplay: '🔳 QR'}))
    );
  }

  puntosDisponibles.forEach(punto => {
    select.innerHTML += `<option value="${punto.id}">${punto.tipoDisplay} - ${punto.nombre}</option>`;
  });

  if (puntosDisponibles.length === 0) {
    select.innerHTML = '<option value="">No hay puntos disponibles</option>';
  }
}

function agregarPuntoRuta() {
  const selectPunto = document.getElementById('select_punto');
  const puntoId = parseInt(selectPunto.value);

  if (!puntoId) {
    alert('⚠️ Selecciona un punto');
    return;
  }

  // Buscar en GPS o QR
  let punto = puntosGuardados.find(p => p.id === puntoId);
  if (!punto) {
    punto = qrsGuardados.find(q => q.id === puntoId);
    if (punto) {
      punto.tipo = 'QR';
    }
  } else {
    punto.tipo = 'GPS';
  }

  if (!punto) return;

  if (rutaTemporal.some(p => p.id === puntoId)) {
    alert('⚠️ Este punto ya está en la ruta');
    return;
  }

  rutaTemporal.push(punto);
  actualizarListaPuntosRuta();
  actualizarRutaEnMapa();
  selectPunto.value = '';
}

function actualizarListaPuntosRuta() {
  const contenedor = document.getElementById('lista-puntos-ruta');

  if (rutaTemporal.length === 0) {
    contenedor.innerHTML = '<p class="sin-datos">No hay puntos seleccionados</p>';
    return;
  }

  let html = '';
  rutaTemporal.forEach((punto, index) => {
    const icono = punto.tipo === 'QR' ? '🔳' : '📍';
    html += `
      <div class="punto-seleccionado">
        <span class="orden-numero">${index + 1}</span>
        <strong>${icono} ${punto.nombre}</strong>
        <span style="font-size: 11px; color: #666;">${punto.tipo}</span>
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

  // Solo dibujar si hay puntos GPS
  const puntosGPS = rutaTemporal.filter(p => p.tipo === 'GPS' && p.lat && p.lng);
  
  if (puntosGPS.length < 2) return;

  const coordenadas = puntosGPS.map(punto => [punto.lat, punto.lng]);
  rutaActualPolyline = L.polyline(coordenadas, {
    color: "#ff0000",
    weight: 4,
    opacity: 0.7,
    dashArray: "10, 10",
  }).addTo(map);

  map.fitBounds(rutaActualPolyline.getBounds(), { padding: [20, 20] });
}

async function guardarRuta() {
  const nombreRuta = document.getElementById('nombre_ruta').value.trim();

  if (!nombreRuta) {
    alert('⚠️ Ingresa un nombre para la ruta');
    return;
  }

  if (rutaTemporal.length < 2) {
    alert('⚠️ Una ruta debe tener al menos 2 puntos');
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
      mostrarMensaje('✅ Ruta guardada exitosamente', 'success');
      limpiarRutaTemporal();
      await cargarRutas();
    } else {
      alert('⚠️ ' + resultado.mensaje);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error al guardar la ruta');
  }
}

function limpiarRutaTemporal() {
  rutaTemporal = [];
  document.getElementById('nombre_ruta').value = '';
  actualizarListaPuntosRuta();
  limpiarRutaActual();
}

function actualizarTablaRutas() {
  const tbody = document.getElementById('tbody-rutas');

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

  let html = '';
  rutasGuardadas.forEach(ruta => {
    const puntosList = ruta.puntos.map(p => {
      const icono = p.codigo_qr ? '🔳' : '📍';
      return `${icono} ${p.nombre}`;
    }).join(', ');
    
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
  const ruta = rutasGuardadas.find(r => r.id === idRuta);
  if (!ruta) return;

  // Verificar si la ruta tiene puntos GPS
  const puntosGPS = ruta.puntos.filter(p => p.lat !== null && p.lng !== null);
  
  // Si NO tiene puntos GPS (solo QR), mostrar alerta
  if (puntosGPS.length === 0) {
    alert('⚠️ Esta ruta solo contiene códigos QR.\n\nLos códigos QR no tienen coordenadas GPS y no se pueden visualizar en el mapa.');
    return;
  }

  // SI tiene puntos GPS, cambiar al tab GPS
  cambiarTab('gps');
  
  // Esperar a que el tab cambie
  setTimeout(() => {
    limpiarMarcadorTemporal();
    limpiarRutaActual();

    // Dibujar línea con puntos GPS
    if (puntosGPS.length >= 2) {
      const coordenadas = puntosGPS.map(punto => [parseFloat(punto.lat), parseFloat(punto.lng)]);
      rutaActualPolyline = L.polyline(coordenadas, {
        color: "#2196f3",
        weight: 5,
        opacity: 0.8,
      }).addTo(map);
    }

    // Agregar marcadores
    puntosGPS.forEach((punto, index) => {
      const marcador = L.marker([parseFloat(punto.lat), parseFloat(punto.lng)], {
        icon: L.divIcon({
          className: "custom-div-icon",
          html: `<div style="background-color: #2196f3; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${index + 1}</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        }),
      }).addTo(map);

      marcador.bindPopup(`
        <b>📍 ${punto.nombre}</b><br>
        Orden: ${index + 1}<br>
        Tipo: GPS<br>
        Ruta: ${ruta.nombre}
      `);

      marcadoresRuta.push(marcador);
    });

    // Ajustar vista
    if (puntosGPS.length >= 2 && rutaActualPolyline) {
      map.fitBounds(rutaActualPolyline.getBounds(), { padding: [50, 50] });
    } else if (puntosGPS.length === 1) {
      map.setView([parseFloat(puntosGPS[0].lat), parseFloat(puntosGPS[0].lng)], 17);
    }
    
    mostrarMensaje(`📍 Mostrando ruta: ${ruta.nombre}`, 'success');
  }, 100);
}

async function eliminarRuta(idRuta) {
  const ruta = rutasGuardadas.find(r => r.id === idRuta);
  if (!ruta || !confirm(`¿Eliminar la ruta "${ruta.nombre}"?`)) return;

  try {
    const response = await fetch('api_rutas.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'eliminar', id: idRuta })
    });

    const resultado = await response.json();

    if (resultado.exito) {
      mostrarMensaje('🗑️ Ruta eliminada', 'success');
      await cargarRutas();
    } else {
      alert('⚠️ ' + resultado.mensaje);
    }
  } catch (error) {
    alert('❌ Error');
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
  const div = document.getElementById('mensaje-exito');
  div.textContent = mensaje;
  div.className = tipo === 'success' ? 'mensaje-exito' : 'mensaje-error';
  div.style.display = 'block';
  setTimeout(() => div.style.display = 'none', 4000);
}

// Hacer funciones globales
window.cambiarTab = cambiarTab;
window.guardarPunto = guardarPunto;
window.limpiarMarcadorTemporal = limpiarMarcadorTemporal;
window.verPunto = verPunto;
window.eliminarPunto = eliminarPunto;
window.generarQR = generarQR;
window.descargarQR = descargarQR;
window.guardarQR = guardarQR;
window.limpiarFormularioQR = limpiarFormularioQR;
window.verQR = verQR;
window.descargarQRGuardado = descargarQRGuardado;
window.eliminarQR = eliminarQR;
window.agregarPuntoRuta = agregarPuntoRuta;
window.quitarPuntoRuta = quitarPuntoRuta;
window.guardarRuta = guardarRuta;
window.limpiarRutaTemporal = limpiarRutaTemporal;
window.verRuta = verRuta;
window.eliminarRuta = eliminarRuta;
window.actualizarSelectPuntos = actualizarSelectPuntos;