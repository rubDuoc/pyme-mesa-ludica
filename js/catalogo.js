/* ============================================================
   Mesa Lúdica - Render dinámico del catálogo de juegos
   DSY2202 - Experiencia 1, Semana 3

   Renderiza las fichas de productos leyendo desde Datos.productos
   (localStorage), filtradas por la categoría declarada en
   <body data-categoria="estrategia | familiares | fiesta | cartas">.
   Así, los cambios hechos desde el panel de administración se
   reflejan inmediatamente en el catálogo público.
   ============================================================ */
(function () {
  'use strict';

  var categoria = document.body.getAttribute('data-categoria');
  var contenedor = document.getElementById('contenedor-juegos');

  if (!categoria || !contenedor || !window.Datos) return;

  // ----- Helpers -----
  function formatearPrecio(n) {
    return '$' + Number(n).toLocaleString('es-CL');
  }

  function escapar(s) {
    var div = document.createElement('div');
    div.textContent = (s == null) ? '' : String(s);
    return div.innerHTML;
  }

  // ----- Render principal -----
  function render() {
    var productos = Datos.productos.obtenerTodos().filter(function (p) {
      return p.categoria === categoria;
    });

    if (productos.length === 0) {
      contenedor.innerHTML =
        '<div class="col-12">' +
          '<p class="text-center text-muted py-5">' +
            'No hay productos disponibles en esta categoría por el momento.' +
          '</p>' +
        '</div>';
      return;
    }

    contenedor.innerHTML = productos.map(function (p) {
      var tieneDescuento = p.precio_antiguo && p.precio_antiguo > p.precio;
      var porcentaje = tieneDescuento
        ? Math.round((1 - p.precio / p.precio_antiguo) * 100)
        : 0;

      var etiqueta = tieneDescuento
        ? '<span class="etiqueta-descuento">-' + porcentaje + '%</span>'
        : '';

      var bloquePrecio = tieneDescuento
        ? '<div>' +
            '<span class="precio-antiguo">' + formatearPrecio(p.precio_antiguo) + '</span>' +
            '<span class="precio">' + formatearPrecio(p.precio) + '</span>' +
          '</div>'
        : '<span class="precio">' + formatearPrecio(p.precio) + '</span>';

      var nombreEscapado = escapar(p.nombre);
      var imagenEscapada = escapar(p.imagen);

      return (
        '<article class="col-12 col-md-6 col-lg-4">' +
          '<div class="ficha h-100">' +
            etiqueta +
            '<img src="' + imagenEscapada + '" alt="Juego ' + nombreEscapado + '">' +
            '<div class="cuerpo">' +
              '<h3>' + nombreEscapado + '</h3>' +
              '<p class="descripcion">' + escapar(p.descripcion) + '</p>' +
              '<div class="pie">' +
                bloquePrecio +
                '<button type="button" class="boton boton-agregar" ' +
                        'data-agregar-carrito ' +
                        'data-id="' + escapar(p.id) + '" ' +
                        'data-nombre="' + nombreEscapado + '" ' +
                        'data-precio="' + Number(p.precio) + '" ' +
                        'data-imagen="' + imagenEscapada + '">' +
                  'Agregar 🛒' +
                '</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  render();
})();
