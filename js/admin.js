/* ============================================================
   Mesa Lúdica - Panel de administración (productos + usuarios)
   DSY2202 - Experiencia 1, Semana 3

   Páginas protegidas: requiere rol "admin".
   Un mismo archivo atiende ambas páginas; cada sección se
   inicializa según los elementos presentes en el DOM.
   ============================================================ */
(function () {
  'use strict';

  if (!window.Auth || !Auth.requerirAdmin()) return;

  function escapar(s) {
    var d = document.createElement('div');
    d.textContent = (s == null) ? '' : String(s);
    return d.innerHTML;
  }
  function formatear(n) {
    return '$' + Number(n).toLocaleString('es-CL');
  }
  function marcar(input, valido, mensaje) {
    input.classList.remove('is-valid', 'is-invalid');
    input.classList.add(valido ? 'is-valid' : 'is-invalid');
    if (!valido && mensaje) {
      var fb = input.parentElement.querySelector('.invalid-feedback');
      if (fb) fb.textContent = mensaje;
    }
  }

  // ============================================================
   // PANEL DE PRODUCTOS
  // ============================================================
  var formProd = document.getElementById('form-producto');
  if (formProd) {
    var inpId          = document.getElementById('prod-id');
    var inpNombre      = document.getElementById('prod-nombre');
    var inpCategoria   = document.getElementById('prod-categoria');
    var inpPrecio      = document.getElementById('prod-precio');
    var inpPrecioAnt   = document.getElementById('prod-precio-antiguo');
    var inpStock       = document.getElementById('prod-stock');
    var inpImagen      = document.getElementById('prod-imagen');
    var inpDescripcion = document.getElementById('prod-descripcion');
    var btnGuardar     = document.getElementById('btn-guardar-prod');
    var btnCancelar    = document.getElementById('btn-cancelar-prod');
    var alertaProd     = document.getElementById('alerta-prod');
    var tituloForm     = document.getElementById('titulo-form');
    var cuerpoTabla    = document.getElementById('cuerpo-tabla-prod');
    var buscador       = document.getElementById('buscador-prod');
    var totalProds     = document.getElementById('total-prods');

    function limpiarFormulario() {
      formProd.reset();
      inpId.value = '';
      [inpNombre, inpCategoria, inpPrecio, inpPrecioAnt, inpStock, inpImagen, inpDescripcion].forEach(function (i) {
        i.classList.remove('is-valid', 'is-invalid');
      });
      tituloForm.textContent = 'Agregar nuevo producto';
      btnGuardar.textContent = 'Agregar producto';
      alertaProd.className   = 'mt-3';
      alertaProd.textContent = '';
    }

    function validarProd() {
      var ok = true;
      if (!inpNombre.value.trim())      { marcar(inpNombre, false, 'Ingresa un nombre.'); ok = false; } else marcar(inpNombre, true);
      if (!inpCategoria.value)          { marcar(inpCategoria, false, 'Selecciona una categoría.'); ok = false; } else marcar(inpCategoria, true);
      var precio = parseInt(inpPrecio.value, 10);
      if (isNaN(precio) || precio < 100) { marcar(inpPrecio, false, 'Precio inválido (mínimo $100).'); ok = false; } else marcar(inpPrecio, true);
      var stock  = parseInt(inpStock.value, 10);
      if (isNaN(stock) || stock < 0)    { marcar(inpStock, false, 'Stock inválido.'); ok = false; } else marcar(inpStock, true);
      if (!inpDescripcion.value.trim()) { marcar(inpDescripcion, false, 'Ingresa una descripción.'); ok = false; } else marcar(inpDescripcion, true);
      return ok;
    }

    function renderTablaProd() {
      var filtro = (buscador.value || '').toLowerCase().trim();
      var todos = Datos.productos.obtenerTodos();
      var lista = filtro
        ? todos.filter(function (p) {
            return p.nombre.toLowerCase().indexOf(filtro) !== -1 ||
                   p.categoria.toLowerCase().indexOf(filtro) !== -1;
          })
        : todos;

      totalProds.textContent = todos.length;

      if (lista.length === 0) {
        cuerpoTabla.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">Sin resultados.</td></tr>';
        return;
      }

      var html = '';
      lista.forEach(function (p) {
        html +=
          '<tr data-id="' + escapar(p.id) + '">' +
            '<td><img src="' + escapar(p.imagen) + '" alt="' + escapar(p.nombre) + '" class="img-mini-admin"></td>' +
            '<td><strong>' + escapar(p.nombre) + '</strong><br><small class="text-muted">' + escapar(p.id) + '</small></td>' +
            '<td><span class="badge bg-secondary">' + escapar(p.categoria) + '</span></td>' +
            '<td class="text-end">' + formatear(p.precio) + '</td>' +
            '<td class="text-center">' + p.stock + '</td>' +
            '<td class="text-end">' +
              '<button class="btn btn-sm btn-outline-primary me-1 btn-editar">Editar</button>' +
              '<button class="btn btn-sm btn-outline-danger btn-eliminar">Eliminar</button>' +
            '</td>' +
          '</tr>';
      });
      cuerpoTabla.innerHTML = html;

      cuerpoTabla.querySelectorAll('tr').forEach(function (tr) {
        var id = tr.getAttribute('data-id');
        tr.querySelector('.btn-editar').addEventListener('click', function () {
          var p = Datos.productos.buscarPorId(id);
          if (!p) return;
          inpId.value          = p.id;
          inpNombre.value      = p.nombre;
          inpCategoria.value   = p.categoria;
          inpPrecio.value      = p.precio;
          inpPrecioAnt.value   = p.precio_antiguo || '';
          inpStock.value       = p.stock;
          inpImagen.value      = p.imagen;
          inpDescripcion.value = p.descripcion;
          tituloForm.textContent = 'Editando "' + p.nombre + '"';
          btnGuardar.textContent = 'Guardar cambios';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        tr.querySelector('.btn-eliminar').addEventListener('click', function () {
          var p = Datos.productos.buscarPorId(id);
          if (!p) return;
          if (confirm('¿Eliminar el producto "' + p.nombre + '"? Esta acción no se puede deshacer.')) {
            Datos.productos.eliminar(id);
            if (window.MesaLudica) MesaLudica.toast('Producto eliminado.', 'exito');
            renderTablaProd();
          }
        });
      });
    }

    formProd.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validarProd()) {
        alertaProd.className   = 'mt-3 alert alert-danger';
        alertaProd.textContent = 'Hay campos con errores.';
        return;
      }

      var producto = {
        id:             inpId.value || ('p-' + Date.now()),
        nombre:         inpNombre.value.trim(),
        categoria:      inpCategoria.value,
        precio:         parseInt(inpPrecio.value, 10),
        precio_antiguo: inpPrecioAnt.value ? parseInt(inpPrecioAnt.value, 10) : null,
        stock:          parseInt(inpStock.value, 10),
        imagen:         inpImagen.value.trim() || 'img/cat-' + inpCategoria.value + '.svg',
        descripcion:    inpDescripcion.value.trim()
      };

      if (inpId.value) {
        Datos.productos.actualizar(producto);
        if (window.MesaLudica) MesaLudica.toast('Producto actualizado.', 'exito');
      } else {
        Datos.productos.agregar(producto);
        if (window.MesaLudica) MesaLudica.toast('Producto agregado.', 'exito');
      }

      limpiarFormulario();
      renderTablaProd();
    });

    btnCancelar.addEventListener('click', limpiarFormulario);
    buscador.addEventListener('input', renderTablaProd);

    renderTablaProd();
  }

  // ============================================================
   // PANEL DE USUARIOS
  // ============================================================
  var cuerpoTablaUsr = document.getElementById('cuerpo-tabla-usr');
  if (cuerpoTablaUsr) {
    var buscadorUsr = document.getElementById('buscador-usr');
    var totalUsrs   = document.getElementById('total-usrs');
    var sesion      = Auth.sesionActual();

    function renderTablaUsr() {
      var filtro = (buscadorUsr.value || '').toLowerCase().trim();
      var todos = Datos.usuarios.obtenerTodos();
      var lista = filtro
        ? todos.filter(function (u) {
            return u.nombre.toLowerCase().indexOf(filtro)  !== -1 ||
                   u.email.toLowerCase().indexOf(filtro)   !== -1 ||
                   u.usuario.toLowerCase().indexOf(filtro) !== -1;
          })
        : todos;

      totalUsrs.textContent = todos.length;

      if (lista.length === 0) {
        cuerpoTablaUsr.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">Sin resultados.</td></tr>';
        return;
      }

      var html = '';
      lista.forEach(function (u) {
        var esYo = u.id === sesion.id;
        var badgeRol = u.rol === 'admin'
          ? '<span class="badge bg-warning text-dark">admin</span>'
          : '<span class="badge bg-info text-dark">cliente</span>';
        html +=
          '<tr data-id="' + escapar(u.id) + '">' +
            '<td>' + escapar(u.nombre) + (esYo ? ' <small class="text-muted">(tú)</small>' : '') + '</td>' +
            '<td>' + escapar(u.usuario) + '</td>' +
            '<td>' + escapar(u.email) + '</td>' +
            '<td class="text-center">' + badgeRol + '</td>' +
            '<td><small>' + escapar(u.direccion || '—') + '</small></td>' +
            '<td class="text-end">' +
              (esYo
                ? '<small class="text-muted">Sin acciones</small>'
                : '<button class="btn btn-sm btn-outline-primary me-1 btn-toggle-rol">' +
                    (u.rol === 'admin' ? 'Pasar a cliente' : 'Hacer admin') +
                  '</button>' +
                  '<button class="btn btn-sm btn-outline-danger btn-eliminar-usr">Eliminar</button>') +
            '</td>' +
          '</tr>';
      });
      cuerpoTablaUsr.innerHTML = html;

      cuerpoTablaUsr.querySelectorAll('tr').forEach(function (tr) {
        var id = tr.getAttribute('data-id');
        var btnRol = tr.querySelector('.btn-toggle-rol');
        var btnEli = tr.querySelector('.btn-eliminar-usr');
        if (btnRol) {
          btnRol.addEventListener('click', function () {
            var u = Datos.usuarios.buscarPorId(id);
            if (!u) return;
            u.rol = u.rol === 'admin' ? 'cliente' : 'admin';
            Datos.usuarios.actualizar(u);
            if (window.MesaLudica) MesaLudica.toast('Rol actualizado.', 'exito');
            renderTablaUsr();
          });
        }
        if (btnEli) {
          btnEli.addEventListener('click', function () {
            var u = Datos.usuarios.buscarPorId(id);
            if (!u) return;
            if (confirm('¿Eliminar al usuario "' + u.nombre + '" (' + u.usuario + ')?')) {
              Datos.usuarios.eliminar(id);
              if (window.MesaLudica) MesaLudica.toast('Usuario eliminado.', 'exito');
              renderTablaUsr();
            }
          });
        }
      });
    }

    buscadorUsr.addEventListener('input', renderTablaUsr);
    renderTablaUsr();
  }
})();
