/* ============================================================
   Mesa Lúdica - Validaciones del formulario de registro
   DSY2202 - Experiencia 1, Semana 3

   Reglas (según instrucciones específicas):
   - Todos los campos son obligatorios excepto "dirección de despacho".
   - Correo electrónico con formato válido.
   - Contraseñas iguales.
   - Contraseña con 4 validaciones de seguridad:
       1) Longitud entre 6 y 18 caracteres
       2) Al menos una letra mayúscula
       3) Al menos un número
       4) Al menos un carácter especial (!@#$%^&*...)
   - Edad mínima de 13 años.
   - Botones: Enviar y Limpiar.
   ============================================================ */
(function () {
  'use strict';

  var form = document.getElementById('form-registro');
  if (!form) return;

  // ---- Si ya hay sesión activa, redirige al inicio ----
  if (window.Auth && Auth.sesionActual()) {
    window.location.href = 'index.html';
    return;
  }

  // ---- Referencias a los campos ----
  var campos = {
    nombre:     document.getElementById('nombre'),
    usuario:    document.getElementById('usuario'),
    email:      document.getElementById('email'),
    password:   document.getElementById('password'),
    password2:  document.getElementById('password2'),
    nacimiento: document.getElementById('nacimiento'),
    direccion:  document.getElementById('direccion')
  };

  var alerta       = document.getElementById('alerta-resultado');
  var btnTogglePwd = document.getElementById('toggle-password');

  // ---- Expresiones regulares ----
  var REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Contraseña: longitud 6-18, al menos una mayúscula, un número y un carácter especial.
  var REGEX_PASS  = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]).{6,18}$/;

  // ---- 1. Mostrar / ocultar contraseña (manipulación dinámica del atributo type) ----
  if (btnTogglePwd) {
    btnTogglePwd.addEventListener('click', function () {
      var tipoActual = campos.password.getAttribute('type');
      var nuevoTipo  = tipoActual === 'password' ? 'text' : 'password';
      campos.password.setAttribute('type', nuevoTipo);
      btnTogglePwd.textContent = nuevoTipo === 'password' ? 'Mostrar' : 'Ocultar';
    });
  }

  // ---- 2. Helpers ----
  function calcularEdad(fechaTexto) {
    if (!fechaTexto) return -1;
    var hoy = new Date();
    var nac = new Date(fechaTexto);
    if (isNaN(nac.getTime())) return -1;
    var edad = hoy.getFullYear() - nac.getFullYear();
    var diffMes = hoy.getMonth() - nac.getMonth();
    if (diffMes < 0 || (diffMes === 0 && hoy.getDate() < nac.getDate())) {
      edad--;
    }
    return edad;
  }

  function marcar(input, valido, mensaje) {
    if (!input) return;
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

  function limpiarMarcado(input) {
    if (!input) return;
    input.classList.remove('is-valid', 'is-invalid');
  }

  // ---- 3. Validaciones campo a campo ----
  function validarNombre() {
    var v = campos.nombre.value.trim();
    if (!v) { marcar(campos.nombre, false, 'Ingresa tu nombre completo.'); return false; }
    marcar(campos.nombre, true); return true;
  }

  function validarUsuario() {
    var v = campos.usuario.value.trim();
    if (!v) { marcar(campos.usuario, false, 'Ingresa un nombre de usuario.'); return false; }
    if (v.length < 3) { marcar(campos.usuario, false, 'Mínimo 3 caracteres.'); return false; }
    marcar(campos.usuario, true); return true;
  }

  function validarEmail() {
    var v = campos.email.value.trim();
    if (!v) { marcar(campos.email, false, 'Ingresa tu correo electrónico.'); return false; }
    if (!REGEX_EMAIL.test(v)) { marcar(campos.email, false, 'Ingresa un correo válido (ej: nombre@dominio.cl).'); return false; }
    marcar(campos.email, true); return true;
  }

  function validarPassword() {
    var v = campos.password.value;
    if (!v) { marcar(campos.password, false, 'Ingresa una contraseña.'); return false; }
    if (!REGEX_PASS.test(v)) {
      marcar(campos.password, false, 'Entre 6 y 18 caracteres, con mayúscula, número y un símbolo especial.');
      return false;
    }
    marcar(campos.password, true); return true;
  }

  function validarPassword2() {
    var v  = campos.password2.value;
    var v1 = campos.password.value;
    if (!v) { marcar(campos.password2, false, 'Repite la contraseña.'); return false; }
    if (v !== v1) { marcar(campos.password2, false, 'Las contraseñas no coinciden.'); return false; }
    marcar(campos.password2, true); return true;
  }

  function validarNacimiento() {
    var v = campos.nacimiento.value;
    if (!v) { marcar(campos.nacimiento, false, 'Ingresa tu fecha de nacimiento.'); return false; }
    var edad = calcularEdad(v);
    if (edad < 13) {
      marcar(campos.nacimiento, false, 'Debes tener al menos 13 años para registrarte.');
      return false;
    }
    marcar(campos.nacimiento, true); return true;
  }

  function validarTodos() {
    var r1 = validarNombre();
    var r2 = validarUsuario();
    var r3 = validarEmail();
    var r4 = validarPassword();
    var r5 = validarPassword2();
    var r6 = validarNacimiento();
    return r1 && r2 && r3 && r4 && r5 && r6;
  }

  // ---- 4. Validación en vivo (blur) ----
  campos.nombre    .addEventListener('blur',  validarNombre);
  campos.usuario   .addEventListener('blur',  validarUsuario);
  campos.email     .addEventListener('blur',  validarEmail);
  campos.password  .addEventListener('blur',  validarPassword);
  campos.password2 .addEventListener('blur',  validarPassword2);
  campos.password2 .addEventListener('input', function () {
    if (campos.password2.classList.contains('is-invalid')) validarPassword2();
  });
  campos.nacimiento.addEventListener('blur',  validarNacimiento);

  // ---- 5. Envío del formulario ----
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!validarTodos()) {
      alerta.className   = 'mt-4 alert alert-danger';
      alerta.textContent = 'Hay campos con errores. Revisa los recuadros marcados en rojo.';
      var primerError = form.querySelector('.is-invalid');
      if (primerError) primerError.focus();
      return;
    }

    // Conexión con Auth: registra al usuario en localStorage
    if (!window.Auth) {
      alerta.className   = 'mt-4 alert alert-danger';
      alerta.textContent = 'No se pudo cargar el sistema de autenticación. Recarga la página.';
      return;
    }

    var resultado = Auth.registrar({
      nombre:     campos.nombre.value.trim(),
      usuario:    campos.usuario.value.trim(),
      email:      campos.email.value.trim(),
      password:   campos.password.value,
      nacimiento: campos.nacimiento.value,
      direccion:  campos.direccion.value.trim()
    });

    if (!resultado.ok) {
      alerta.className   = 'mt-4 alert alert-danger';
      alerta.textContent = resultado.mensaje;
      return;
    }

    // Mensaje personalizado en el modal de éxito
    var mensajeModal = document.getElementById('modal-mensaje');
    if (mensajeModal) {
      mensajeModal.textContent =
        '¡Bienvenido/a, ' + resultado.usuario.nombre + '! ' +
        'Tu cuenta fue creada con éxito. Ya puedes iniciar sesión con el usuario "' +
        resultado.usuario.usuario + '".';
    }

    var modalEl = document.getElementById('modalExito');
    if (modalEl && window.bootstrap) {
      var modal = window.bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    }

    // Limpiar formulario tras mostrar el modal
    form.reset();
    Object.keys(campos).forEach(function (k) { limpiarMarcado(campos[k]); });
    if (campos.password) campos.password.setAttribute('type', 'password');
    if (btnTogglePwd)    btnTogglePwd.textContent = 'Mostrar';
    alerta.className   = 'mt-4';
    alerta.textContent = '';
  });

  // ---- 6. Botón limpiar: borra marcadores y la alerta ----
  form.addEventListener('reset', function () {
    Object.keys(campos).forEach(function (k) { limpiarMarcado(campos[k]); });
    alerta.className   = 'mt-4';
    alerta.textContent = '';
    if (campos.password) campos.password.setAttribute('type', 'password');
    if (btnTogglePwd)    btnTogglePwd.textContent = 'Mostrar';
  });
})();
