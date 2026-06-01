/* ============================================================
   Mesa Lúdica - Script global
   DSY2202 - Experiencia 1, Semana 2
   Manipulación del DOM y CSS dinámica (común a todas las páginas)
   ============================================================ */
(function () {
  'use strict';

  // ---- 1. Marcar el enlace activo en la barra de navegación ----
  // Toma el nombre del archivo actual y le agrega la clase "active"
  // al <a> del menú que apunte a esa misma página.
  const archivoActual = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const enlaces = document.querySelectorAll('.navbar-nav .nav-link');
  enlaces.forEach(function (a) {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (href === archivoActual || (archivoActual === '' && href === 'index.html')) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
  });

  // ---- 2. Efecto de scroll en el header ----
  // Cuando el usuario hace scroll, agregamos una clase que reduce el
  // tamaño de la cabecera (transición CSS gestionada en styles.css).
  const cabecera = document.querySelector('.cabecera');
  if (cabecera) {
    const onScroll = function () {
      if (window.scrollY > 30) {
        cabecera.classList.add('cabecera-scrolled');
      } else {
        cabecera.classList.remove('cabecera-scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---- 3. Cerrar el menú hamburguesa al hacer click en un enlace ----
  // En mobile, después de tocar un link la navbar queda abierta. Forzamos el
  // colapso para que la navegación se sienta fluida.
  const menuColapsable = document.getElementById('navMenu');
  if (menuColapsable && window.bootstrap) {
    document.querySelectorAll('#navMenu .nav-link').forEach(function (a) {
      a.addEventListener('click', function () {
        if (menuColapsable.classList.contains('show')) {
          const instancia = window.bootstrap.Collapse.getOrCreateInstance(menuColapsable, { toggle: false });
          instancia.hide();
        }
      });
    });
  }

  // ---- 4. Año dinámico en el pie de página ----
  // Crea dinámicamente un nodo de texto con el año actual si existe el footer.
  const pie = document.querySelector('.pie-pagina p');
  if (pie && pie.textContent.indexOf('2026') !== -1) {
    const anio = new Date().getFullYear();
    pie.textContent = pie.textContent.replace('2026', String(anio));
  }
})();
