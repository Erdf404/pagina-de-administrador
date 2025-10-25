// script2.js
document.addEventListener('DOMContentLoaded', function () {
    const accesoPermitido = sessionStorage.getItem('accesoPermitido');
    const desdeLogin = document.referrer.includes('Inicio_Sesion.php') // Verificar si la página anterior fue el login
    || document.referrer.includes('Agregar-Usuario.php') // Verificar si la página anterior fue la de agregar usuario
    || document.referrer.includes('Modificar-usuario.php') // Verificar si la página anterior fue la de modificar usuario
    || document.referrer.includes('Eliminar-usuario.php') // Verificar si la página anterior fue la de eliminar usuario
    || document.referrer.includes('Busqueda-guardia.php') // Verificar si la página anterior fue la de búsqueda de guardias
    || document.referrer.includes('Rondines.php') // Verificar si la página anterior fue la de rondines
    || document.referrer.includes('Rutas.php') // Verificar si la página anterior fue la de rutas
    || document.referrer.includes('Asignar-rutas.php'); // Verificar si la página anterior fue la de asignar rutas

    // Permitir el acceso si se vino del login o por botón
    if (!accesoPermitido && !desdeLogin) {
        window.location.href = 'Inicio_Sesion.php';
    }

    // Limpiar la bandera
    sessionStorage.removeItem('accesoPermitido');
});
// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------//