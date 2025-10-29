// Script para prevenir el uso de F12 (Inspeccionar elemento) en la página
document.addEventListener("keydown", e => {
// Prevenir el uso de F12 para inspeccionar el elemento
if (e.key === "F12"){
    alert("🔐 Inspeccion boqueada");
    e.preventDefault();
}
//prevenir el uso de ctrl+u para inspeccionar el código fuente
if (e.ctrlKey && e.key === "u"){
    alert("Inspección bloqueada");
    e.preventDefault();
}
// Prevenir el uso de Ctrl+Shift+I para inspeccionar el elemento
if (e.ctrlKey && e.shiftKey && e.key === "I") {
    alert("🔐 Inspección bloqueada");
    e.preventDefault();
}
// Prevenir el uso de Ctrl+Shift+C para inspeccionar el elemento
if (e.ctrlKey && e.shiftKey && e.key === "C") {
    alert("🔐 Inspección bloqueada");
    e.preventDefault();
}
// Prevenir el uso de Ctrl+Shift+J para abrir la consola
if (e.ctrlKey && e.shiftKey && e.key === "J") {
    alert("🔐 Inspección bloqueada");
    e.preventDefault();
}
});

// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
// Script para manejar el login y la visibilidad de la contraseña
document.addEventListener('DOMContentLoaded', function() {
    // Para página de login
    if (document.getElementById('password')) {
        initLogin();
    }
    
    // Para página con dropdown de usuario
    if (document.querySelector('.user-dropdown')) {
        initUserDropdown();
    }
});

//función para inicializar el login
function initLogin() {
    // Hacer las funciones globales para que puedan ser llamadas desde HTML
    window.togglePassword = togglePassword;
    window.openModal = openModal;
    window.closeModal = closeModal;
}

function togglePassword() {
    // Función para alternar la visibilidad de la contraseña
    const passwordInput = document.getElementById('password');
    // Obtiene el campo de entrada de contraseña
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    // Cambia el tipo de entrada entre 'password' y 'text'
    passwordInput.type = type;
    // Actualiza el tipo de entrada del campo de contraseña
}

function openModal() {
    // Función para abrir la ventana modal de recuperación de usuario
    document.getElementById('recoverModal').style.display = 'flex';
    // Muestra la ventana modal estableciendo su estilo de visualización a 'flex'
}

function closeModal() {
    // Función para cerrar la ventana modal de recuperación de usuario
    document.getElementById('recoverModal').style.display = 'none';
    // Oculta la ventana modal estableciendo su estilo de visualización a 'none'
}
// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
//script para manejar el dropdown del usuario
function initUserDropdown() {
    const userDropdown = document.querySelector('.user-dropdown');
    const userButton = document.querySelector('.user-button');

    if (userButton && userDropdown) {
        userButton.addEventListener('click', () => {
            userDropdown.classList.toggle('active');
        });

        // Cierra el menú si haces clic fuera
        document.addEventListener('click', function(e) {
            if (!userDropdown.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });
    }
}
// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
// Script para mostrar u ocultar el campo de tipo de administrador según el tipo de usuario seleccionado
function mostrarTipoAdmin(selectElement) {
const fila = selectElement.closest('tr');
const tipoAdminSelect = fila.querySelector('.tipo-admin');
if (selectElement.value === 'administrador') {
        tipoAdminSelect.style.display = 'block';
} else {
        tipoAdminSelect.style.display = 'none';
}
    }
// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
// Script para mostrar u ocultar las opciones de administrador según la selección del tipo de usuario
function mostrarOpcionesAdministrador() {
            const tipoUsuario = document.getElementById('tipo-usuario').value;
            const adminOptions = document.getElementById('admin-options');

            if (tipoUsuario === 'administrador') {
                adminOptions.style.display = 'block';
            } else {
                adminOptions.style.display = 'none';
            }
        }
// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
// Script para manejar el cierre de sesión con confirmación
document.addEventListener('DOMContentLoaded', function() {
    const btnsCerrarSesion = document.querySelectorAll('.dropdown-menu button');
    
    btnsCerrarSesion.forEach(btn => {
        if (btn.textContent.includes('Cerrar sesión') || btn.textContent.includes('Cerrar sesiÃ³n')) {
            btn.removeAttribute('onclick');
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                if (confirm('¿Deseas cerrar sesión?')) {
                    sessionStorage.clear();
                    window.location.href = 'cerrar_sesion.php';
                }
            });
        }
    });
});