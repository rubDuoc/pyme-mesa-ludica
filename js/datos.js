/* ============================================================
   Mesa Lúdica - Capa de datos (localStorage)
   DSY2202 - Experiencia 1, Semana 3

   Simula la persistencia de datos del FrontEnd con localStorage.
   IMPORTANTE: las contraseñas se guardan en texto plano porque
   esta capa es una SIMULACIÓN académica sin backend.
   En la Experiencia 3 se reemplaza esta capa por una API REST
   real con almacenamiento seguro.
   ============================================================ */
(function (global) {
  'use strict';

  // ---- Claves de almacenamiento ----
  var DB = {
    USUARIOS:    'ml_usuarios',
    SESION:      'ml_sesion',
    PRODUCTOS:   'ml_productos',
    CARRITO:     'ml_carrito_',   // prefijo + idUsuario
    COMPRAS:     'ml_compras',
    SEED_VERSION:'ml_seed_version'
  };

  // Versión actual de los datos semilla. Si subimos este número,
  // el navegador vuelve a sembrar productos y compras (sin borrar usuarios).
  var SEED_VERSION = 2;

  // ---- Helpers genéricos ----
  function leer(clave, porDefecto) {
    try {
      var v = localStorage.getItem(clave);
      return v === null ? porDefecto : JSON.parse(v);
    } catch (e) {
      return porDefecto;
    }
  }

  function escribir(clave, valor) {
    localStorage.setItem(clave, JSON.stringify(valor));
  }

  // ---- Semilla: usuarios precargados para que la app sea probable sin registrarse ----
  var USUARIOS_SEMILLA = [
    {
      id: 'u-admin',
      nombre: 'Administrador Mesa Lúdica',
      usuario: 'admin',
      email: 'admin@mesaludica.cl',
      password: 'Admin123!',
      nacimiento: '1990-01-01',
      direccion: 'Oficina central',
      rol: 'admin'
    },
    {
      id: 'u-demo',
      nombre: 'Cliente Demo',
      usuario: 'demo',
      email: 'demo@correo.cl',
      password: 'Demo123!',
      nacimiento: '2000-06-15',
      direccion: 'Av. Siempreviva 742',
      rol: 'cliente'
    }
  ];

  // ---- Semilla: los 12 juegos del catálogo (sincronizada con el HTML estático) ----
  var PRODUCTOS_SEMILLA = [
    // Estrategia
    { id: 'p-001', nombre: 'Catan',                       categoria: 'estrategia', precio: 31990, precio_antiguo: 39990, stock: 12, imagen: 'img/CATAN.jpg',           descripcion: 'Construye, comercia y coloniza la isla de Catan en este clásico de la estrategia.' },
    { id: 'p-002', nombre: 'Carcassonne',                 categoria: 'estrategia', precio: 27990, precio_antiguo: null,  stock: 9,  imagen: 'img/carcassonne.png',     descripcion: 'Coloca losetas y construye ciudades medievales en este juego de colocación.' },
    { id: 'p-003', nombre: 'Ajedrez Deluxe',              categoria: 'estrategia', precio: 21240, precio_antiguo: 24990, stock: 15, imagen: 'img/AJEDREZ_DELUXE.webp', descripcion: 'Tablero de madera y piezas talladas a mano para los amantes del clásico rey de los juegos.' },
    // Familiares
    { id: 'p-004', nombre: 'Monopoly Clásico',            categoria: 'familiares', precio: 22990, precio_antiguo: null,  stock: 18, imagen: 'img/MONOPOLY.webp',       descripcion: 'Compra propiedades, cobra arriendos y lleva a la quiebra a tus rivales.' },
    { id: 'p-005', nombre: 'Dixit',                       categoria: 'familiares', precio: 22490, precio_antiguo: 29990, stock: 10, imagen: 'img/DIXIT.jpg',           descripcion: 'Un juego de imaginación y cartas ilustradas donde la creatividad gana la partida.' },
    { id: 'p-006', nombre: 'Jenga Torre',                 categoria: 'familiares', precio: 12990, precio_antiguo: null,  stock: 25, imagen: 'img/JENGA.webp',          descripcion: 'Retira bloques y apílalos sin que la torre caiga. Pulso y nervios garantizados.' },
    // Fiesta
    { id: 'p-007', nombre: 'Time\'s Up!',                 categoria: 'fiesta',     precio: 13990, precio_antiguo: 19990, stock: 14, imagen: 'img/TIMES_UPS.jpg',       descripcion: 'Adivina personajes contra el reloj en tres rondas cada vez más locas.' },
    { id: 'p-008', nombre: 'Pictionary',                  categoria: 'fiesta',     precio: 17990, precio_antiguo: null,  stock: 12, imagen: 'img/PICTIONARY.webp',     descripcion: 'Dibuja contra el tiempo y haz que tu equipo adivine la palabra secreta.' },
    { id: 'p-009', nombre: '¿Quién es quién?',            categoria: 'fiesta',     precio: 13490, precio_antiguo: 14990, stock: 16, imagen: 'img/QUIEN_ES_QUIEN.jpg',  descripcion: 'Haz preguntas y descarta personajes hasta adivinar el del rival.' },
    // Cartas
    { id: 'p-010', nombre: 'UNO',                         categoria: 'cartas',     precio: 5390,  precio_antiguo: 8990,  stock: 30, imagen: 'img/UNO.jpg',             descripcion: 'El clásico juego de cartas de colores y números. ¡No olvides gritar UNO!' },
    { id: 'p-011', nombre: 'Carioca',                     categoria: 'cartas',     precio: 6990,  precio_antiguo: null,  stock: 22, imagen: 'img/CARIOCA.webp',        descripcion: 'El popular juego chileno de naipes con escalas y tríos ronda tras ronda.' },
    { id: 'p-012', nombre: 'Cartas Españolas (Brisca)',   categoria: 'cartas',     precio: 4490,  precio_antiguo: 5990,  stock: 17, imagen: 'img/BRISCA.jpg',          descripcion: 'Mazo de cartas españolas ideal para Brisca y otros juegos tradicionales.' }
  ];

  // ---- Inicialización: sembrar el almacenamiento la primera vez ----
  function inicializar() {
    var versionActual = leer(DB.SEED_VERSION, 0);

    if (leer(DB.USUARIOS, null) === null) {
      escribir(DB.USUARIOS, USUARIOS_SEMILLA);
    }
    // Si subimos la versión, refrescamos productos (compras viejas se conservan)
    if (leer(DB.PRODUCTOS, null) === null || versionActual < SEED_VERSION) {
      escribir(DB.PRODUCTOS, PRODUCTOS_SEMILLA);
    }
    if (leer(DB.COMPRAS, null) === null) {
      escribir(DB.COMPRAS, []);
    }
    escribir(DB.SEED_VERSION, SEED_VERSION);
  }

  inicializar();

  // ---- API pública ----
  global.Datos = {
    DB: DB,
    leer: leer,
    escribir: escribir,

    // ----- Usuarios -----
    usuarios: {
      obtenerTodos: function () { return leer(DB.USUARIOS, []); },
      guardarTodos: function (arr) { escribir(DB.USUARIOS, arr); },

      buscarPorUsuario: function (usuario) {
        return leer(DB.USUARIOS, []).find(function (u) {
          return u.usuario.toLowerCase() === String(usuario).toLowerCase();
        }) || null;
      },
      buscarPorEmail: function (email) {
        return leer(DB.USUARIOS, []).find(function (u) {
          return u.email.toLowerCase() === String(email).toLowerCase();
        }) || null;
      },
      buscarPorId: function (id) {
        return leer(DB.USUARIOS, []).find(function (u) { return u.id === id; }) || null;
      },
      agregar: function (u) {
        var arr = leer(DB.USUARIOS, []);
        arr.push(u);
        escribir(DB.USUARIOS, arr);
      },
      actualizar: function (u) {
        var arr = leer(DB.USUARIOS, []);
        var i = arr.findIndex(function (x) { return x.id === u.id; });
        if (i >= 0) {
          arr[i] = u;
          escribir(DB.USUARIOS, arr);
        }
      },
      eliminar: function (id) {
        var arr = leer(DB.USUARIOS, []).filter(function (u) { return u.id !== id; });
        escribir(DB.USUARIOS, arr);
      }
    },

    // ----- Productos -----
    productos: {
      obtenerTodos: function () { return leer(DB.PRODUCTOS, []); },
      buscarPorId: function (id) {
        return leer(DB.PRODUCTOS, []).find(function (p) { return p.id === id; }) || null;
      },
      agregar: function (p) {
        var arr = leer(DB.PRODUCTOS, []);
        arr.push(p);
        escribir(DB.PRODUCTOS, arr);
      },
      actualizar: function (p) {
        var arr = leer(DB.PRODUCTOS, []);
        var i = arr.findIndex(function (x) { return x.id === p.id; });
        if (i >= 0) {
          arr[i] = p;
          escribir(DB.PRODUCTOS, arr);
        }
      },
      eliminar: function (id) {
        var arr = leer(DB.PRODUCTOS, []).filter(function (p) { return p.id !== id; });
        escribir(DB.PRODUCTOS, arr);
      }
    },

    // ----- Carrito (por usuario) -----
    carrito: {
      claveDe: function (idUsuario) { return DB.CARRITO + idUsuario; },
      obtener: function (idUsuario) {
        return leer(DB.CARRITO + idUsuario, []);
      },
      guardar: function (idUsuario, items) {
        escribir(DB.CARRITO + idUsuario, items);
      },
      vaciar: function (idUsuario) {
        localStorage.removeItem(DB.CARRITO + idUsuario);
      },
      agregar: function (idUsuario, producto, cantidad) {
        var items = leer(DB.CARRITO + idUsuario, []);
        var i = items.findIndex(function (it) { return it.idProducto === producto.id; });
        if (i >= 0) {
          items[i].cantidad += cantidad;
        } else {
          items.push({
            idProducto: producto.id,
            nombre:     producto.nombre,
            precio:     producto.precio,
            imagen:     producto.imagen,
            cantidad:   cantidad
          });
        }
        escribir(DB.CARRITO + idUsuario, items);
      },
      cantidadTotal: function (idUsuario) {
        return leer(DB.CARRITO + idUsuario, []).reduce(function (acc, it) {
          return acc + it.cantidad;
        }, 0);
      }
    },

    // ----- Compras -----
    compras: {
      obtenerTodas: function () { return leer(DB.COMPRAS, []); },
      obtenerDeUsuario: function (idUsuario) {
        return leer(DB.COMPRAS, []).filter(function (c) {
          return c.idUsuario === idUsuario;
        });
      },
      registrar: function (compra) {
        var arr = leer(DB.COMPRAS, []);
        arr.push(compra);
        escribir(DB.COMPRAS, arr);
      }
    }
  };
})(window);
