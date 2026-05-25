# Mesa Lúdica 🎲

Sitio web de catálogo de **juegos de mesa** desarrollado para la asignatura
**Desarrollo Full Stack II (DSY2202)** — Experiencia 1, Semana 1.

## Descripción
Página web estática (HTML5 + CSS3) que presenta el catálogo de una PYME ficticia
dedicada a la venta de juegos de mesa, organizado en 4 categorías con 3 juegos cada una.

## Estructura del proyecto
```
PYME/
├── index.html          # Página principal (marca + categorías)
├── estrategia.html     # Categoría Estrategia (3 juegos)
├── familiares.html     # Categoría Familiares (3 juegos)
├── fiesta.html         # Categoría Fiesta (3 juegos)
├── cartas.html         # Categoría Cartas (3 juegos)
├── css/
│   └── styles.css      # Estilos: variables, animaciones y media queries
└── img/                # Imágenes (placeholders SVG, reemplazables)
```

## Requisitos cumplidos (pauta)
- Página principal con nombre de la PYME y listado de categorías con imagen e hipervínculo.
- 4 categorías, 3 juegos por categoría (12 fichas) con imagen, nombre, descripción,
  precio y estado de descuento.
- Navegación entre páginas y retorno al inicio en todas las pantallas.
- CSS avanzado: **variables CSS** (`:root`), **5 animaciones** (`@keyframes`) y
  **media queries** para responsividad.

## Cómo ver el sitio
Abre `index.html` en cualquier navegador (doble clic).

## Pendiente / mejoras
- Reemplazar los placeholders SVG de `img/` por imágenes reales de cada juego.
