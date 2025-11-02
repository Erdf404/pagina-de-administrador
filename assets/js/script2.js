// script2.js
document.addEventListener('DOMContentLoaded', function () {
    const accesoPermitido = sessionStorage.getItem('accesoPermitido');
    const desdeLogin = document.referrer.includes('../pages/Inicio_Sesion.php') // Verificar si la página anterior fue el login
    || document.referrer.includes('../pages/Agregar-Usuario.php') // Verificar si la página anterior fue la de agregar usuario
    || document.referrer.includes('../pages/Modificar-usuario.php') // Verificar si la página anterior fue la de modificar usuario
    || document.referrer.includes('../pages/Eliminar-usuario.php') // Verificar si la página anterior fue la de eliminar usuario
    || document.referrer.includes('../pages/Busqueda-guardia.php') // Verificar si la página anterior fue la de búsqueda de guardias
    || document.referrer.includes('../pages/Rondines.php') // Verificar si la página anterior fue la de rondines
    || document.referrer.includes('../pages/Rutas.php') // Verificar si la página anterior fue la de rutas
    || document.referrer.includes('../pages/Asignar-rutas.php'); // Verificar si la página anterior fue la de asignar rutas

    // Permitir el acceso si se vino del login o por botón
    if (!accesoPermitido && !desdeLogin) {
        window.location.href = '../pages/Inicio_Sesion.php';
    }

    // Limpiar la bandera
    sessionStorage.removeItem('accesoPermitido');
});
// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------//