/* ============================================================
   Mesa Lúdica - Script global
   DSY2202 - Experiencia 1, Semana 3

   Manipulación del DOM común a todas las páginas:
   - Renderizado dinámico de la navbar según sesión y rol
   - Efecto de scroll en el header
   - Cierre del menú hamburguesa al navegar
   - Año dinámico en el pie de página
   - Botón "Agregar al carrito" en las fichas de juego
   ============================================================ */
(function () {
  'use strict';

  // ----- Helper: escapar texto para insertar como HTML -----
  function escapar(s) {
    var div = document.createElement('div');
    div.textContent = (s == null) ? '' : String(s);
    return div.innerHTML;
  }

  // ============================================================
   // 1. RENDERIZADO DINÁMICO DE LA NAVBAR
   // Construye la lista de enlaces en función del usuario logueado
  // ============================================================
  function renderizarNavbar() {
    var ul = document.querySelector('.cabecera .navbar-nav');
    if (!ul) return;

    var sesion = (window.Auth && Auth.sesionActual()) ? Auth.sesionActual() : null;

    // ---- Enlaces comunes (siempre visibles) ----
    var html =
      '<li class="nav-item"><a class="nav-link" href="index.html">Inicio</a></li>' +
      '<li class="nav-item"><a class="nav-link" href="estrategia.html">Estrategia</a></li>' +
      '<li class="nav-item"><a class="nav-link" href="familiares.html">Familiares</a></li>' +
      '<li class="nav-item"><a class="nav-link" href="fiesta.html">Fiesta</a></li>' +
      '<li class="nav-item"><a class="nav-link" href="cartas.html">Cartas</a></li>';

    if (!sesion) {
      // ---- Visitante (sin sesión) ----
      html +=
        '<li class="nav-item ms-lg-2"><a class="nav-link" href="login.html">Iniciar sesión</a></li>' +
        '<li class="nav-item"><a class="nav-link nav-cta" href="registro.html">Registrarse</a></li>';
    } else if (sesion.rol === 'admin') {
      // ---- Administrador ----
      html +=
        '<li class="nav-item dropdown ms-lg-2">' +
          '<a class="nav-link dropdown-toggle" href="#" id="ddAdmin" role="button" data-bs-toggle="dropdown" aria-expanded="false">Administración</a>' +
          '<ul class="dropdown-menu" aria-labelledby="ddAdmin">' +
            '<li><a class="dropdown-item" href="admin-productos.html">Productos</a></li>' +
            '<li><a class="dropdown-item" href="admin-usuarios.html">Usuarios</a></li>' +
          '</ul>' +
        '</li>' +
        '<li class="nav-item dropdown">' +
          '<a class="nav-link dropdown-toggle" href="#" id="ddUser" role="button" data-bs-toggle="dropdown" aria-expanded="false">👤 ' + escapar(sesion.nombre.split(' ')[0]) + '</a>' +
          '<ul class="dropdown-menu dropdown-menu-end" aria-labelledby="ddUser">' +
            '<li><a class="dropdown-item" href="perfil.html">Mi perfil</a></li>' +
            '<li><hr class="dropdown-divider"></li>' +
            '<li><a class="dropdown-item" href="#" id="link-logout">Cerrar sesión</a></li>' +
          '</ul>' +
        '</li>';
    } else {
      // ---- Cliente ----
      var cant = (window.Datos) ? Datos.carrito.cantidadTotal(sesion.id) : 0;
      var badge = cant > 0 ? ' <span class="badge bg-warning text-dark ms-1">' + cant + '</span>' : '';
      html +=
        '<li class="nav-item ms-lg-2"><a class="nav-link" href="carrito.html">🛒 Carrito' + badge + '</a></li>' +
        '<li class="nav-item dropdown">' +
          '<a class="nav-link dropdown-toggle" href="#" id="ddUser" role="button" data-bs-toggle="dropdown" aria-expanded="false">👤 ' + escapar(sesion.nombre.split(' ')[0]) + '</a>' +
          '<ul class="dropdown-menu dropdown-menu-end" aria-labelledby="ddUser">' +
            '<li><a class="dropdown-item" href="perfil.html">Mi perfil</a></li>' +
            '<li><a class="dropdown-item" href="mis-compras.html">Mis compras</a></li>' +
            '<li><hr class="dropdown-divider"></li>' +
            '<li><a class="dropdown-item" href="#" id="link-logout">Cerrar sesión</a></li>' +
          '</ul>' +
        '</li>';
    }

    ul.innerHTML = html;

    // ---- Marcar enlace activo según la URL ----
    var actual = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    ul.querySelectorAll('.nav-link, .dropdown-item').forEach(function (a) {
      var href = (a.getAttribute('href') || '').toLowerCase();
      if (href === actual) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      }
    });

    // ---- Conectar logout ----
    var btnLogout = document.getElementById('link-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', function (e) {
        e.preventDefault();
        Auth.logout();
        window.location.href = 'index.html';
      });
    }

    // ---- Cerrar hamburguesa al elegir un enlace (no aplica al toggle de dropdown) ----
    var menuColapsable = document.getElementById('navMenu');
    if (menuColapsable && window.bootstrap) {
      ul.querySelectorAll('.nav-link:not(.dropdown-toggle), .dropdown-item').forEach(function (a) {
        a.addEventListener('click', function () {
          if (menuColapsable.classList.contains('show')) {
            var inst = window.bootstrap.Collapse.getOrCreateInstance(menuColapsable, { toggle: false });
            inst.hide();
          }
        });
      });
    }
  }

  // ============================================================
   // 2. EFECTO DE SCROLL EN EL HEADER
  // ============================================================
  function configurarScroll() {
    var cabecera = document.querySelector('.cabecera');
    if (!cabecera) return;
    var onScroll = function () {
      if (window.scrollY > 30) {
        cabecera.classList.add('cabecera-scrolled');
      } else {
        cabecera.classList.remove('cabecera-scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ============================================================
   // 3. AÑO DINÁMICO EN EL PIE DE PÁGINA
  // ============================================================
  function actualizarAnio() {
    var pie = document.querySelector('.pie-pagina p');
    if (pie && pie.textContent.indexOf('2026') !== -1) {
      var anio = new Date().getFullYear();
      pie.textContent = pie.textContent.replace('2026', String(anio));
    }
  }

  // ============================================================
   // 4. BOTÓN "AGREGAR AL CARRITO" EN LAS FICHAS DE JUEGO
   // Detecta cualquier elemento con data-agregar-carrito y conecta el click.
  // ============================================================
  function configurarAgregarCarrito() {
    document.querySelectorAll('[data-agregar-carrito]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        if (!window.Auth || !window.Datos) return;

        var sesion = Auth.sesionActual();
        if (!sesion) {
          var actual = (location.pathname.split('/').pop() || '');
          window.location.href = 'login.html?redirect=' + encodeURIComponent(actual);
          return;
        }
        if (Auth.esAdmin()) {
          mostrarToast('Los administradores no pueden comprar.', 'error');
          return;
        }

        var id = btn.getAttribute('data-id');
        var producto = Datos.productos.buscarPorId(id);
        // Si no está en la "base de datos", reconstruyo desde el HTML como respaldo
        if (!producto) {
          producto = {
            id:     id,
            nombre: btn.getAttribute('data-nombre'),
            precio: parseInt(btn.getAttribute('data-precio'), 10) || 0,
            imagen: btn.getAttribute('data-imagen')
          };
        }
        Datos.carrito.agregar(sesion.id, producto, 1);
        mostrarToast('✓ ' + producto.nombre + ' añadido al carrito', 'exito');

        // Actualizar el badge del carrito en la navbar sin recargar
        renderizarNavbar();
      });
    });
  }

  // ----- Toast flotante reutilizable -----
  function mostrarToast(mensaje, tipo) {
    var existente = document.getElementById('toast-flotante');
    if (existente) existente.remove();
    var div = document.createElement('div');
    div.id = 'toast-flotante';
    div.className = 'toast-flotante' + (tipo === 'error' ? ' toast-error' : ' toast-exito');
    div.textContent = mensaje;
    document.body.appendChild(div);
    setTimeout(function () { div.classList.add('visible'); }, 10);
    setTimeout(function () {
      div.classList.remove('visible');
      setTimeout(function () { div.remove(); }, 400);
    }, 2200);
  }

  // ============================================================
   // INICIALIZACIÓN
  // ============================================================
  renderizarNavbar();
  configurarScroll();
  actualizarAnio();
  configurarAgregarCarrito();

  // Expongo helpers por si otros scripts los necesitan
  window.MesaLudica = {
    toast: mostrarToast,
    refrescarNavbar: renderizarNavbar
  };
})();
