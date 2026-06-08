/* ============================================================
   Mesa Lúdica - Lógica del carrito
   DSY2202 - Experiencia 1, Semana 3

   - Página protegida: requiere sesión (cliente).
   - Lista los items del usuario, permite cambiar cantidades,
     eliminar líneas o vaciar el carrito.
   - "Pagar" simula la compra: registra una compra en localStorage
     y vacía el carrito.
   ============================================================ */
(function () {
  'use strict';

  if (!window.Auth || !Auth.requerirSesion()) return;

  // Si es admin, no puede comprar
  if (Auth.esAdmin()) {
    window.location.href = 'admin-productos.html';
    return;
  }

  var sesion = Auth.sesionActual();

  var bloqueVacio = document.getElementById('carrito-vacio');
  var bloqueLleno = document.getElementById('carrito-lleno');
  var cuerpo      = document.getElementById('cuerpo-carrito');
  var resSubtotal = document.getElementById('resumen-subtotal');
  var resEnvio    = document.getElementById('resumen-envio');
  var resTotal    = document.getElementById('resumen-total');
  var btnVaciar   = document.getElementById('btn-vaciar');
  var btnPagar    = document.getElementById('btn-pagar');

  var ENVIO = 3990;

  function formatear(n) {
    return '$' + Number(n).toLocaleString('es-CL');
  }

  function escapar(s) {
    var d = document.createElement('div');
    d.textContent = (s == null) ? '' : String(s);
    return d.innerHTML;
  }

  function calcularSubtotal(items) {
    return items.reduce(function (acc, it) {
      return acc + (it.precio * it.cantidad);
    }, 0);
  }

  function render() {
    var items = Datos.carrito.obtener(sesion.id);

    if (items.length === 0) {
      bloqueVacio.classList.remove('d-none');
      bloqueLleno.classList.add('d-none');
      if (window.MesaLudica) MesaLudica.refrescarNavbar();
      return;
    }

    bloqueVacio.classList.add('d-none');
    bloqueLleno.classList.remove('d-none');

    var html = '';
    items.forEach(function (it, idx) {
      html +=
        '<tr data-idx="' + idx + '">' +
          '<td>' +
            '<div class="d-flex align-items-center gap-3">' +
              '<img src="' + escapar(it.imagen) + '" alt="' + escapar(it.nombre) + '" class="img-carrito">' +
              '<div><strong>' + escapar(it.nombre) + '</strong></div>' +
            '</div>' +
          '</td>' +
          '<td class="text-end">' + formatear(it.precio) + '</td>' +
          '<td class="text-center">' +
            '<div class="input-group input-group-sm justify-content-center" style="max-width:140px; margin:0 auto;">' +
              '<button type="button" class="btn btn-outline-secondary btn-restar" aria-label="Restar uno">−</button>' +
              '<input type="number" class="form-control text-center input-cantidad" value="' + it.cantidad + '" min="1" max="99">' +
              '<button type="button" class="btn btn-outline-secondary btn-sumar" aria-label="Sumar uno">+</button>' +
            '</div>' +
          '</td>' +
          '<td class="text-end">' + formatear(it.precio * it.cantidad) + '</td>' +
          '<td class="text-end">' +
            '<button type="button" class="btn btn-sm btn-outline-danger btn-quitar" aria-label="Quitar producto">✕</button>' +
          '</td>' +
        '</tr>';
    });
    cuerpo.innerHTML = html;

    var sub = calcularSubtotal(items);
    resSubtotal.textContent = formatear(sub);
    resEnvio.textContent    = formatear(ENVIO);
    resTotal.textContent    = formatear(sub + ENVIO);

    conectarFilas(items);
    if (window.MesaLudica) MesaLudica.refrescarNavbar();
  }

  function conectarFilas(items) {
    cuerpo.querySelectorAll('tr').forEach(function (tr) {
      var idx = parseInt(tr.getAttribute('data-idx'), 10);
      var inp = tr.querySelector('.input-cantidad');

      tr.querySelector('.btn-restar').addEventListener('click', function () {
        if (items[idx].cantidad > 1) {
          items[idx].cantidad--;
          Datos.carrito.guardar(sesion.id, items);
          render();
        }
      });
      tr.querySelector('.btn-sumar').addEventListener('click', function () {
        if (items[idx].cantidad < 99) {
          items[idx].cantidad++;
          Datos.carrito.guardar(sesion.id, items);
          render();
        }
      });
      inp.addEventListener('change', function () {
        var n = parseInt(inp.value, 10);
        if (isNaN(n) || n < 1) n = 1;
        if (n > 99) n = 99;
        items[idx].cantidad = n;
        Datos.carrito.guardar(sesion.id, items);
        render();
      });
      tr.querySelector('.btn-quitar').addEventListener('click', function () {
        items.splice(idx, 1);
        Datos.carrito.guardar(sesion.id, items);
        if (window.MesaLudica) MesaLudica.toast('Producto removido del carrito.', 'exito');
        render();
      });
    });
  }

  btnVaciar.addEventListener('click', function () {
    if (confirm('¿Vaciar todo el carrito?')) {
      Datos.carrito.vaciar(sesion.id);
      render();
    }
  });

  btnPagar.addEventListener('click', function () {
    var items = Datos.carrito.obtener(sesion.id);
    if (items.length === 0) return;
    var sub = calcularSubtotal(items);

    var compra = {
      id:        'c-' + Date.now(),
      idUsuario: sesion.id,
      fecha:     new Date().toISOString(),
      items:     items,
      subtotal:  sub,
      envio:     ENVIO,
      total:     sub + ENVIO,
      estado:    'pagado'
    };
    Datos.compras.registrar(compra);
    Datos.carrito.vaciar(sesion.id);

    document.getElementById('modal-numero-compra').textContent = compra.id.toUpperCase();
    if (window.bootstrap) {
      window.bootstrap.Modal.getOrCreateInstance(document.getElementById('modalPago')).show();
    }
    render();
  });

  render();
})();
