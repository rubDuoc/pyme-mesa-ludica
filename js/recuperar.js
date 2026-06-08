/* ============================================================
   Mesa Lúdica - Recuperación de contraseña (2 pasos)
   DSY2202 - Experiencia 1, Semana 3

   Paso 1: validar que el correo existe en localStorage.
   Paso 2: pedir nueva contraseña con las mismas 4 reglas que el registro.
   ============================================================ */
(function () {
  'use strict';

  var formPaso1 = document.getElementById('form-recuperar-paso1');
  var formPaso2 = document.getElementById('form-recuperar-paso2');
  if (!formPaso1 || !formPaso2) return;

  var bloque1 = document.getElementById('bloque-paso1');
  var bloque2 = document.getElementById('bloque-paso2');
  var inpEmail     = document.getElementById('email');
  var inpPassword  = document.getElementById('password');
  var inpPassword2 = document.getElementById('password2');
  var alertaP1 = document.getElementById('alerta-paso1');
  var alertaP2 = document.getElementById('alerta-paso2');
  var cuentaDetectada = document.getElementById('cuenta-detectada');
  var btnTogglePwd = document.getElementById('toggle-password');
  var btnVolver    = document.getElementById('btn-volver-paso1');

  var REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var REGEX_PASS  = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]).{6,18}$/;

  var emailVerificado = null;

  // ---- Mostrar/ocultar contraseña ----
  if (btnTogglePwd) {
    btnTogglePwd.addEventListener('click', function () {
      var t = inpPassword.getAttribute('type') === 'password' ? 'text' : 'password';
      inpPassword.setAttribute('type', t);
      btnTogglePwd.textContent = t === 'password' ? 'Mostrar' : 'Ocultar';
    });
  }

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

  // ----------------- PASO 1 -----------------
  inpEmail.addEventListener('blur', function () {
    var v = inpEmail.value.trim();
    if (!v) marcar(inpEmail, false, 'Ingresa tu correo.');
    else if (!REGEX_EMAIL.test(v)) marcar(inpEmail, false, 'Correo con formato inválido.');
    else marcar(inpEmail, true);
  });

  formPaso1.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = inpEmail.value.trim();
    if (!v) { marcar(inpEmail, false, 'Ingresa tu correo.'); return; }
    if (!REGEX_EMAIL.test(v)) { marcar(inpEmail, false, 'Correo con formato inválido.'); return; }

    var u = Datos.usuarios.buscarPorEmail(v);
    if (!u) {
      marcar(inpEmail, false, 'No existe una cuenta con ese correo.');
      alertaP1.className = 'mt-4 alert alert-danger';
      alertaP1.textContent = 'No existe una cuenta con ese correo.';
      return;
    }

    emailVerificado = v;
    cuentaDetectada.textContent = u.nombre + ' (' + u.usuario + ')';
    bloque1.classList.add('d-none');
    bloque2.classList.remove('d-none');
    alertaP1.className = '';
    alertaP1.textContent = '';
  });

  // ----------------- PASO 2 -----------------
  btnVolver.addEventListener('click', function () {
    bloque2.classList.add('d-none');
    bloque1.classList.remove('d-none');
    emailVerificado = null;
    formPaso2.reset();
    [inpPassword, inpPassword2].forEach(function (i) {
      i.classList.remove('is-valid', 'is-invalid');
    });
    alertaP2.className = '';
    alertaP2.textContent = '';
  });

  inpPassword.addEventListener('blur', function () {
    var v = inpPassword.value;
    if (!v) marcar(inpPassword, false, 'Ingresa una contraseña.');
    else if (!REGEX_PASS.test(v)) marcar(inpPassword, false, 'Entre 6 y 18 caracteres, con mayúscula, número y símbolo.');
    else marcar(inpPassword, true);
  });

  inpPassword2.addEventListener('blur', function () {
    if (!inpPassword2.value) marcar(inpPassword2, false, 'Repite la contraseña.');
    else if (inpPassword2.value !== inpPassword.value) marcar(inpPassword2, false, 'Las contraseñas no coinciden.');
    else marcar(inpPassword2, true);
  });

  formPaso2.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!emailVerificado) {
      alertaP2.className = 'mt-4 alert alert-danger';
      alertaP2.textContent = 'Primero verifica tu correo.';
      return;
    }

    var p  = inpPassword.value;
    var p2 = inpPassword2.value;
    var ok = true;
    if (!REGEX_PASS.test(p)) { marcar(inpPassword, false, 'Entre 6 y 18 caracteres, con mayúscula, número y símbolo.'); ok = false; }
    else { marcar(inpPassword, true); }
    if (p2 !== p) { marcar(inpPassword2, false, 'Las contraseñas no coinciden.'); ok = false; }
    else if (!p2) { marcar(inpPassword2, false, 'Repite la contraseña.'); ok = false; }
    else { marcar(inpPassword2, true); }

    if (!ok) {
      alertaP2.className = 'mt-4 alert alert-danger';
      alertaP2.textContent = 'Revisa los campos marcados.';
      return;
    }

    var r = Auth.recuperarPassword(emailVerificado, p);
    if (!r.ok) {
      alertaP2.className = 'mt-4 alert alert-danger';
      alertaP2.textContent = r.mensaje;
      return;
    }

    var modalEl = document.getElementById('modalExito');
    if (modalEl && window.bootstrap) {
      window.bootstrap.Modal.getOrCreateInstance(modalEl).show();
    }

    formPaso2.reset();
    [inpPassword, inpPassword2].forEach(function (i) {
      i.classList.remove('is-valid', 'is-invalid');
    });
  });
})();
