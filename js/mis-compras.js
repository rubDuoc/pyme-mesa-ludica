/* ============================================================
   Mesa Lúdica - Historial de compras del usuario
   DSY2202 - Experiencia 1, Semana 3
   ============================================================ */
(function () {
  'use strict';

  if (!window.Auth || !Auth.requerirSesion()) return;

  var sesion = Auth.sesionActual();
  var sinCompras = document.getElementById('sin-compras');
  var listado    = document.getElementById('listado-compras');

  function formatear(n) {
    return '$' + Number(n).toLocaleString('es-CL');
  }
  function formatearFecha(iso) {
    try {
      var d = new Date(iso);
      return d.toLocaleString('es-CL', { dateStyle: 'long', timeStyle: 'short' });
    } catch (e) { return iso; }
  }
  function escapar(s) {
    var d = document.createElement('div');
    d.textContent = (s == null) ? '' : String(s);
    return d.innerHTML;
  }

  var compras = Datos.compras.obtenerDeUsuario(sesion.id);
  // Más recientes arriba
  compras.sort(function (a, b) { return b.fecha.localeCompare(a.fecha); });

  if (compras.length === 0) {
    sinCompras.classList.remove('d-none');
    return;
  }

  var html = '';
  compras.forEach(function (c) {
    var filas = '';
    c.items.forEach(function (it) {
      filas +=
        '<tr>' +
          '<td>' +
            '<div class="d-flex align-items-center gap-2">' +
              '<img src="' + escapar(it.imagen) + '" alt="' + escapar(it.nombre) + '" class="img-mini-compra">' +
              '<span>' + escapar(it.nombre) + '</span>' +
            '</div>' +
          '</td>' +
          '<td class="text-center">' + it.cantidad + '</td>' +
          '<td class="text-end">' + formatear(it.precio) + '</td>' +
          '<td class="text-end">' + formatear(it.precio * it.cantidad) + '</td>' +
        '</tr>';
    });

    html +=
      '<div class="formulario-card mb-4">' +
        '<div class="d-flex flex-wrap justify-content-between align-items-center mb-3">' +
          '<div>' +
            '<h2 class="h5 mb-1">Compra ' + escapar(c.id.toUpperCase()) + '</h2>' +
            '<small class="text-muted">' + escapar(formatearFecha(c.fecha)) + '</small>' +
          '</div>' +
          '<span class="badge bg-success">' + escapar((c.estado || 'pagado').toUpperCase()) + '</span>' +
        '</div>' +
        '<div class="table-responsive">' +
          '<table class="table table-sm align-middle">' +
            '<thead><tr>' +
              '<th>Producto</th>' +
              '<th class="text-center">Cantidad</th>' +
              '<th class="text-end">Precio</th>' +
              '<th class="text-end">Subtotal</th>' +
            '</tr></thead>' +
            '<tbody>' + filas + '</tbody>' +
          '</table>' +
        '</div>' +
        '<div class="row g-2 mt-2">' +
          '<div class="col-12 col-md-4 text-md-end"><span class="text-muted">Subtotal:</span> ' + formatear(c.subtotal) + '</div>' +
          '<div class="col-12 col-md-4 text-md-end"><span class="text-muted">Envío:</span> ' + formatear(c.envio) + '</div>' +
          '<div class="col-12 col-md-4 text-md-end fw-bold fs-5">Total: <span class="text-primary">' + formatear(c.total) + '</span></div>' +
        '</div>' +
      '</div>';
  });

  listado.innerHTML = html;
})();
