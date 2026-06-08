/* ============================================================
   Mesa Lúdica - Sistema de autenticación (simulado)
   DSY2202 - Experiencia 1, Semana 3

   Requiere: js/datos.js cargado previamente.
   Maneja login, logout, registro, recuperación y modificación
   de perfil. La sesión vive en localStorage hasta cerrar sesión.
   ============================================================ */
(function (global) {
  'use strict';

  if (!global.Datos) {
    console.error('Auth requiere que datos.js se cargue antes que auth.js');
    return;
  }

  // ---- Lectura de la sesión actual ----
  function sesionActual() {
    return Datos.leer(Datos.DB.SESION, null);
  }

  // ---- Login: acepta nombre de usuario o email ----
  function login(usuarioOEmail, password) {
    var entrada = String(usuarioOEmail || '').trim();
    if (!entrada || !password) {
      return { ok: false, mensaje: 'Ingresa usuario/correo y contraseña.' };
    }
    var u = Datos.usuarios.buscarPorUsuario(entrada) ||
            Datos.usuarios.buscarPorEmail(entrada);
    if (!u || u.password !== password) {
      return { ok: false, mensaje: 'Usuario o contraseña incorrectos.' };
    }
    Datos.escribir(Datos.DB.SESION, {
      id:      u.id,
      nombre:  u.nombre,
      usuario: u.usuario,
      email:   u.email,
      rol:     u.rol
    });
    return { ok: true, usuario: u };
  }

  // ---- Cierre de sesión ----
  function logout() {
    localStorage.removeItem(Datos.DB.SESION);
  }

  // ---- Registro de nuevo cliente (rol fijo) ----
  function registrar(datos) {
    if (Datos.usuarios.buscarPorUsuario(datos.usuario)) {
      return { ok: false, mensaje: 'Ese nombre de usuario ya está registrado.' };
    }
    if (Datos.usuarios.buscarPorEmail(datos.email)) {
      return { ok: false, mensaje: 'Ese correo ya está registrado.' };
    }
    var nuevo = {
      id:         'u-' + Date.now(),
      nombre:     datos.nombre,
      usuario:    datos.usuario,
      email:      datos.email,
      password:   datos.password,
      nacimiento: datos.nacimiento,
      direccion:  datos.direccion || '',
      rol:        'cliente'
    };
    Datos.usuarios.agregar(nuevo);
    return { ok: true, usuario: nuevo };
  }

  // ---- Modificación del perfil del usuario logueado ----
  function actualizarPerfil(datos) {
    var sesion = sesionActual();
    if (!sesion) return { ok: false, mensaje: 'No hay sesión activa.' };

    var u = Datos.usuarios.buscarPorId(sesion.id);
    if (!u) return { ok: false, mensaje: 'Usuario no encontrado.' };

    // Detecta colisiones con otro usuario distinto al actual
    var otroPorUsuario = Datos.usuarios.buscarPorUsuario(datos.usuario);
    if (otroPorUsuario && otroPorUsuario.id !== u.id) {
      return { ok: false, mensaje: 'Ese nombre de usuario ya está en uso.' };
    }
    var otroPorEmail = Datos.usuarios.buscarPorEmail(datos.email);
    if (otroPorEmail && otroPorEmail.id !== u.id) {
      return { ok: false, mensaje: 'Ese correo ya está en uso.' };
    }

    u.nombre     = datos.nombre;
    u.usuario    = datos.usuario;
    u.email      = datos.email;
    u.nacimiento = datos.nacimiento;
    u.direccion  = datos.direccion || '';
    if (datos.password) u.password = datos.password;

    Datos.usuarios.actualizar(u);
    Datos.escribir(Datos.DB.SESION, {
      id: u.id, nombre: u.nombre, usuario: u.usuario, email: u.email, rol: u.rol
    });
    return { ok: true, usuario: u };
  }

  // ---- Recuperación de contraseña (simulada: cambia directamente) ----
  function recuperarPassword(email, nueva) {
    var u = Datos.usuarios.buscarPorEmail(email);
    if (!u) return { ok: false, mensaje: 'No existe una cuenta con ese correo.' };
    u.password = nueva;
    Datos.usuarios.actualizar(u);
    return { ok: true };
  }

  // ---- Helpers de rol ----
  function esAdmin() {
    var s = sesionActual();
    return !!s && s.rol === 'admin';
  }

  function esCliente() {
    var s = sesionActual();
    return !!s && s.rol === 'cliente';
  }

  // ---- Guards: protegen páginas privadas ----
  function requerirSesion() {
    if (!sesionActual()) {
      var actual = (location.pathname.split('/').pop() || '');
      window.location.href = 'login.html?redirect=' + encodeURIComponent(actual);
      return false;
    }
    return true;
  }

  function requerirAdmin() {
    if (!sesionActual()) {
      window.location.href = 'login.html';
      return false;
    }
    if (!esAdmin()) {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  }

  // ---- API pública ----
  global.Auth = {
    sesionActual:       sesionActual,
    login:              login,
    logout:             logout,
    registrar:          registrar,
    actualizarPerfil:   actualizarPerfil,
    recuperarPassword:  recuperarPassword,
    esAdmin:            esAdmin,
    esCliente:          esCliente,
    requerirSesion:     requerirSesion,
    requerirAdmin:      requerirAdmin
  };
})(window);
