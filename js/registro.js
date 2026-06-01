/* ============================================================
   Mesa Lúdica - Validaciones del formulario de registro
   DSY2202 - Experiencia 1, Semana 2

   Reglas (según instrucciones específicas):
   - Todos los campos son obligatorios excepto "dirección de despacho".
   - Correo electrónico con formato válido.
   - Contraseñas iguales.
   - Contraseña entre 6 y 18 caracteres, con al menos un número y una mayúscula.
   - Edad mínima de 13 años.
   - Botones: Enviar y Limpiar.
   ============================================================ */
(function () {
  'use strict';

  const form = document.getElementById('form-registro');
  if (!form) return; // este script solo aplica en la página de registro

  // ---- Referencias a los campos ----
  const campos = {
    nombre:     document.getElementById('nombre'),
    usuario:    document.getElementById('usuario'),
    email:      document.getElementById('email'),
    password:   document.getElementById('password'),
    password2:  document.getElementById('password2'),
    nacimiento: document.getElementById('nacimiento'),
    direccion:  document.getElementById('direccion')
  };

  const alerta       = document.getElementById('alerta-resultado');
  const btnTogglePwd = document.getElementById('toggle-password');

  // ---- Expresiones regulares ----
  const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Al menos una mayúscula, al menos un número, longitud 6 a 18.
  const REGEX_PASS  = /^(?=.*[A-Z])(?=.*\d).{6,18}$/;

  // ---- 1. Mostrar / ocultar contraseña (manipulación dinámica de atributo HTML) ----
  if (btnTogglePwd) {
    btnTogglePwd.addEventListener('click', function () {
      const tipoActual = campos.password.getAttribute('type');
      const nuevoTipo  = tipoActual === 'password' ? 'text' : 'password';
      campos.password.setAttribute('type', nuevoTipo);
      btnTogglePwd.textContent = nuevoTipo === 'password' ? 'Mostrar' : 'Ocultar';
    });
  }

  // ---- 2. Helpers ----
  function calcularEdad(fechaTexto) {
    if (!fechaTexto) return -1;
    const hoy = new Date();
    const nac = new Date(fechaTexto);
    if (isNaN(nac.getTime())) return -1;
    let edad = hoy.getFullYear() - nac.getFullYear();
    const diffMes = hoy.getMonth() - nac.getMonth();
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
      // el .invalid-feedback puede estar como hermano directo o dentro del input-group
      let fb = input.parentElement.querySelector('.invalid-feedback');
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
    const v = campos.nombre.value.trim();
    if (!v) { marcar(campos.nombre, false, 'Ingresa tu nombre completo.'); return false; }
    marcar(campos.nombre, true); return true;
  }

  function validarUsuario() {
    const v = campos.usuario.value.trim();
    if (!v) { marcar(campos.usuario, false, 'Ingresa un nombre de usuario.'); return false; }
    marcar(campos.usuario, true); return true;
  }

  function validarEmail() {
    const v = campos.email.value.trim();
    if (!v) { marcar(campos.email, false, 'Ingresa tu correo electrónico.'); return false; }
    if (!REGEX_EMAIL.test(v)) { marcar(campos.email, false, 'Ingresa un correo válido (ej: nombre@dominio.cl).'); return false; }
    marcar(campos.email, true); return true;
  }

  function validarPassword() {
    const v = campos.password.value;
    if (!v) { marcar(campos.password, false, 'Ingresa una contraseña.'); return false; }
    if (!REGEX_PASS.test(v)) {
      marcar(campos.password, false, 'Entre 6 y 18 caracteres, con al menos una mayúscula y un número.');
      return false;
    }
    marcar(campos.password, true); return true;
  }

  function validarPassword2() {
    const v  = campos.password2.value;
    const v1 = campos.password.value;
    if (!v) { marcar(campos.password2, false, 'Repite la contraseña.'); return false; }
    if (v !== v1) { marcar(campos.password2, false, 'Las contraseñas no coinciden.'); return false; }
    marcar(campos.password2, true); return true;
  }

  function validarNacimiento() {
    const v = campos.nacimiento.value;
    if (!v) { marcar(campos.nacimiento, false, 'Ingresa tu fecha de nacimiento.'); return false; }
    const edad = calcularEdad(v);
    if (edad < 13) {
      marcar(campos.nacimiento, false, 'Debes tener al menos 13 años para registrarte.');
      return false;
    }
    marcar(campos.nacimiento, true); return true;
  }

  function validarTodos() {
    // Se ejecutan todas para que el usuario vea todos los errores juntos.
    const r1 = validarNombre();
    const r2 = validarUsuario();
    const r3 = validarEmail();
    const r4 = validarPassword();
    const r5 = validarPassword2();
    const r6 = validarNacimiento();
    return r1 && r2 && r3 && r4 && r5 && r6;
  }

  // ---- 4. Validación en vivo: al salir de cada campo ----
  campos.nombre    .addEventListener('blur',  validarNombre);
  campos.usuario   .addEventListener('blur',  validarUsuario);
  campos.email     .addEventListener('blur',  validarEmail);
  campos.password  .addEventListener('blur',  validarPassword);
  campos.password2 .addEventListener('blur',  validarPassword2);
  campos.password2 .addEventListener('input', function () {
    // si ya estaba marcado como inválido, revalida en vivo
    if (campos.password2.classList.contains('is-invalid')) validarPassword2();
  });
  campos.nacimiento.addEventListener('blur',  validarNacimiento);

  // ---- 5. Envío del formulario ----
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (validarTodos()) {
      // Construir el mensaje personalizado dentro del modal
      const mensajeModal = document.getElementById('modal-mensaje');
      if (mensajeModal) {
        mensajeModal.textContent =
          '¡Bienvenido/a, ' + campos.nombre.value.trim() + '! ' +
          'Tu cuenta fue creada y te enviaremos la confirmación a ' +
          campos.email.value.trim() + '.';
      }

      // Mostrar el modal de Bootstrap
      const modalEl = document.getElementById('modalExito');
      if (modalEl && window.bootstrap) {
        const modal = window.bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
      }

      // Limpiar el formulario después de mostrar el modal
      form.reset();
      Object.keys(campos).forEach(function (k) { limpiarMarcado(campos[k]); });
      if (campos.password) campos.password.setAttribute('type', 'password');
      if (btnTogglePwd)    btnTogglePwd.textContent = 'Mostrar';
      alerta.className   = 'mt-4';
      alerta.textContent = '';
    } else {
      alerta.className   = 'mt-4 alert alert-danger';
      alerta.textContent = 'Hay campos con errores. Revisa los recuadros marcados en rojo.';
      const primerError = form.querySelector('.is-invalid');
      if (primerError) primerError.focus();
    }
  });

  // ---- 6. Botón limpiar: borra marcadores y el cuadro de alerta ----
  form.addEventListener('reset', function () {
    Object.keys(campos).forEach(function (k) { limpiarMarcado(campos[k]); });
    alerta.className   = 'mt-4';
    alerta.textContent = '';
    if (campos.password) campos.password.setAttribute('type', 'password');
    if (btnTogglePwd)    btnTogglePwd.textContent = 'Mostrar';
  });
})();
