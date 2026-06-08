/* ============================================================
   Mesa Lúdica - Lógica de inicio de sesión
   DSY2202 - Experiencia 1, Semana 3
   ============================================================ */
(function () {
  'use strict';

  var form = document.getElementById('form-login');
  if (!form) return;

  // Si ya hay sesión, redirige al inicio
  if (window.Auth && Auth.sesionActual()) {
    window.location.href = 'index.html';
    return;
  }

  var inpUsuario   = document.getElementById('usuario');
  var inpPassword  = document.getElementById('password');
  var alerta       = document.getElementById('alerta-resultado');
  var btnTogglePwd = document.getElementById('toggle-password');

  // ---- Mostrar/ocultar contraseña ----
  if (btnTogglePwd) {
    btnTogglePwd.addEventListener('click', function () {
      var t = inpPassword.getAttribute('type') === 'password' ? 'text' : 'password';
      inpPassword.setAttribute('type', t);
      btnTogglePwd.textContent = t === 'password' ? 'Mostrar' : 'Ocultar';
    });
  }

  // ---- Helper de marcado ----
  function marcar(input, valido, mensaje) {
    input.classList.remove('is-valid', 'is-invalid');
    input.classList.add(valido ? 'is-valid' : 'is-invalid');
    if (!valido && mensaje) {
      var fb = input.parentElement.querySelector('.invalid-feedback');
      if (!fb && input.parentElement.parentElement) {
        fb = input.parentElement.parentElement.querySelector('.invalid-feedback');
      }
      if (fb) fb.textContent = mensaje;
    }
  }

  // ---- Validación en vivo ----
  inpUsuario.addEventListener('blur', function () {
    if (!inpUsuario.value.trim()) marcar(inpUsuario, false, 'Ingresa tu usuario o correo.');
    else marcar(inpUsuario, true);
  });
  inpPassword.addEventListener('blur', function () {
    if (!inpPassword.value) marcar(inpPassword, false, 'Ingresa tu contraseña.');
    else marcar(inpPassword, true);
  });

  // ---- Submit ----
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var u = inpUsuario.value.trim();
    var p = inpPassword.value;

    var okBasico = true;
    if (!u) { marcar(inpUsuario, false, 'Ingresa tu usuario o correo.'); okBasico = false; }
    else    { marcar(inpUsuario, true); }
    if (!p) { marcar(inpPassword, false, 'Ingresa tu contraseña.'); okBasico = false; }
    else    { marcar(inpPassword, true); }

    if (!okBasico) {
      alerta.className   = 'mt-4 alert alert-danger';
      alerta.textContent = 'Completa los campos requeridos.';
      return;
    }

    var resultado = Auth.login(u, p);
    if (!resultado.ok) {
      marcar(inpUsuario, false, ' ');
      marcar(inpPassword, false, resultado.mensaje);
      alerta.className   = 'mt-4 alert alert-danger';
      alerta.textContent = resultado.mensaje;
      return;
    }

    // Éxito: redirigir
    alerta.className   = 'mt-4 alert alert-success';
    alerta.textContent = '¡Bienvenido/a, ' + resultado.usuario.nombre + '!';

    // Si venía de una página privada, vuelve allá (parámetro ?redirect=)
    var params = new URLSearchParams(location.search);
    var redirect = params.get('redirect');
    var destino = redirect && /^[a-z0-9_\-]+\.html$/i.test(redirect)
      ? redirect
      : (resultado.usuario.rol === 'admin' ? 'admin-productos.html' : 'index.html');

    setTimeout(function () {
      window.location.href = destino;
    }, 600);
  });

  // ---- Botón limpiar (si se agregara en un futuro) ----
  form.addEventListener('reset', function () {
    [inpUsuario, inpPassword].forEach(function (i) {
      i.classList.remove('is-valid', 'is-invalid');
    });
    alerta.className   = '';
    alerta.textContent = '';
  });
})();
