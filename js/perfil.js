/* ============================================================
   Mesa Lúdica - Modificación de perfil
   DSY2202 - Experiencia 1, Semana 3

   - Página protegida: requiere sesión.
   - Precarga los datos del usuario actual.
   - Reutiliza las mismas validaciones del registro.
   - Cambio de contraseña opcional: si los campos están vacíos
     no se modifica la contraseña.
   ============================================================ */
(function () {
  'use strict';

  // Guard: si no hay sesión, redirige al login (vuelve aquí al loguearse)
  if (!window.Auth || !Auth.requerirSesion()) return;

  var form = document.getElementById('form-perfil');
  if (!form) return;

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
  var btnRestaurar = document.getElementById('btn-restaurar');
  var rolActualEl  = document.getElementById('rol-actual');

  var REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var REGEX_PASS  = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]).{6,18}$/;

  // ---- Cargar datos del usuario actual ----
  var sesion = Auth.sesionActual();
  var usuarioCompleto = Datos.usuarios.buscarPorId(sesion.id);
  if (!usuarioCompleto) {
    Auth.logout();
    window.location.href = 'login.html';
    return;
  }

  function rellenarFormulario() {
    campos.nombre.value     = usuarioCompleto.nombre;
    campos.usuario.value    = usuarioCompleto.usuario;
    campos.email.value      = usuarioCompleto.email;
    campos.nacimiento.value = usuarioCompleto.nacimiento;
    campos.direccion.value  = usuarioCompleto.direccion || '';
    campos.password.value   = '';
    campos.password2.value  = '';
    Object.keys(campos).forEach(function (k) {
      if (campos[k]) campos[k].classList.remove('is-valid', 'is-invalid');
    });
    if (rolActualEl) {
      rolActualEl.textContent = usuarioCompleto.rol === 'admin' ? 'Administrador' : 'Cliente';
    }
  }

  rellenarFormulario();

  // ---- Mostrar/ocultar contraseña ----
  if (btnTogglePwd) {
    btnTogglePwd.addEventListener('click', function () {
      var t = campos.password.getAttribute('type') === 'password' ? 'text' : 'password';
      campos.password.setAttribute('type', t);
      btnTogglePwd.textContent = t === 'password' ? 'Mostrar' : 'Ocultar';
    });
  }

  // ---- Helpers ----
  function calcularEdad(fechaTexto) {
    if (!fechaTexto) return -1;
    var hoy = new Date();
    var nac = new Date(fechaTexto);
    if (isNaN(nac.getTime())) return -1;
    var edad = hoy.getFullYear() - nac.getFullYear();
    var d = hoy.getMonth() - nac.getMonth();
    if (d < 0 || (d === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
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

  // ---- Validaciones ----
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
    if (!v) { marcar(campos.email, false, 'Ingresa tu correo.'); return false; }
    if (!REGEX_EMAIL.test(v)) { marcar(campos.email, false, 'Correo con formato inválido.'); return false; }
    marcar(campos.email, true); return true;
  }
  function validarNacimiento() {
    var v = campos.nacimiento.value;
    if (!v) { marcar(campos.nacimiento, false, 'Ingresa tu fecha de nacimiento.'); return false; }
    if (calcularEdad(v) < 13) { marcar(campos.nacimiento, false, 'Debes tener al menos 13 años.'); return false; }
    marcar(campos.nacimiento, true); return true;
  }
  function validarPasswords() {
    var p  = campos.password.value;
    var p2 = campos.password2.value;
    // Si ambos están vacíos, no se cambia la contraseña (válido)
    if (!p && !p2) {
      campos.password.classList.remove('is-valid', 'is-invalid');
      campos.password2.classList.remove('is-valid', 'is-invalid');
      return true;
    }
    var ok = true;
    if (!REGEX_PASS.test(p)) { marcar(campos.password, false, 'Entre 6 y 18 caracteres, con mayúscula, número y símbolo.'); ok = false; }
    else { marcar(campos.password, true); }
    if (p2 !== p) { marcar(campos.password2, false, 'Las contraseñas no coinciden.'); ok = false; }
    else if (!p2) { marcar(campos.password2, false, 'Repite la contraseña.'); ok = false; }
    else { marcar(campos.password2, true); }
    return ok;
  }

  // ---- Validación en vivo ----
  campos.nombre.addEventListener('blur',     validarNombre);
  campos.usuario.addEventListener('blur',    validarUsuario);
  campos.email.addEventListener('blur',      validarEmail);
  campos.nacimiento.addEventListener('blur', validarNacimiento);
  campos.password.addEventListener('blur',   validarPasswords);
  campos.password2.addEventListener('blur',  validarPasswords);
  campos.password2.addEventListener('input', function () {
    if (campos.password2.classList.contains('is-invalid')) validarPasswords();
  });

  // ---- Botón restaurar ----
  btnRestaurar.addEventListener('click', function () {
    rellenarFormulario();
    alerta.className   = 'mt-4';
    alerta.textContent = '';
  });

  // ---- Submit ----
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var ok = validarNombre() & validarUsuario() & validarEmail() & validarNacimiento() & validarPasswords();
    if (!ok) {
      alerta.className   = 'mt-4 alert alert-danger';
      alerta.textContent = 'Hay campos con errores. Revisa los recuadros marcados en rojo.';
      var primerError = form.querySelector('.is-invalid');
      if (primerError) primerError.focus();
      return;
    }

    var nuevaPass = campos.password.value || null;
    var resultado = Auth.actualizarPerfil({
      nombre:     campos.nombre.value.trim(),
      usuario:    campos.usuario.value.trim(),
      email:      campos.email.value.trim(),
      nacimiento: campos.nacimiento.value,
      direccion:  campos.direccion.value.trim(),
      password:   nuevaPass
    });

    if (!resultado.ok) {
      alerta.className   = 'mt-4 alert alert-danger';
      alerta.textContent = resultado.mensaje;
      return;
    }

    usuarioCompleto = resultado.usuario;

    var msg = document.getElementById('modal-mensaje');
    if (msg) {
      msg.textContent = nuevaPass
        ? 'Tus datos y tu contraseña se actualizaron correctamente.'
        : 'Tus datos se actualizaron correctamente.';
    }

    var modalEl = document.getElementById('modalExito');
    if (modalEl && window.bootstrap) {
      window.bootstrap.Modal.getOrCreateInstance(modalEl).show();
    }

    // Refresca el formulario y la navbar (el nombre puede haber cambiado)
    rellenarFormulario();
    if (window.MesaLudica) MesaLudica.refrescarNavbar();
    alerta.className   = 'mt-4';
    alerta.textContent = '';
  });
})();
