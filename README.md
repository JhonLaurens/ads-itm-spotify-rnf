# Presentación web — Análisis RNF (Spotify)

Sitio estático **HTML / CSS / JavaScript** para exponer en clase el análisis de requisitos no funcionales inspirado en el dominio de Spotify: reproducción continua, recomendaciones personalizadas y control multidispositivo, más conclusiones y matriz de tensiones.

## Requisitos

- Navegador moderno (Chrome, Edge, Firefox o Safari recientes).
- No hace falta servidor para uso local: basta abrir `index.html` o servir la carpeta con cualquier servidor estático.

## Uso rápido

### Opción A — Abrir el archivo

1. En el explorador de archivos, entra en la carpeta del proyecto.
2. Haz doble clic en `index.html` o arrástralo a una ventana del navegador.

*Nota:* algunos navegadores restringen ciertas APIs con `file://`. Si algo no se comporta como esperas, usa la opción B.

### Opción B — Servidor local (recomendado en clase)

Desde la carpeta `ADS-itm`:

**Python 3**

```bash
python -m http.server 8080
```

Abre en el navegador: `http://localhost:8080`

**Node (npx)**

```bash
npx serve .
```

Sigue la URL que indique la herramienta (por ejemplo `http://localhost:3000`).

## Estructura del repositorio

```
ADS-itm/
├── index.html              # Punto de entrada de la web (raíz del sitio)
├── README.md               # Este archivo
├── docs/                   # Documentos académicos (PDF, Word, PowerPoint)
│   └── README.md           # Índice de entregables en docs/
└── public/                 # Recursos estáticos servidos por la web
    ├── css/
    │   └── styles.css      # Estilos (tema claro/oscuro, layout, componentes)
    ├── js/
    │   └── script.js       # Lógica: pestañas, acordeón, modal, matriz, canvas…
    └── assets/
        └── *.svg           # Logotipo e iconos
```

- **`index.html`** queda en la **raíz** para abrir o desplegar el sitio sin configuración extra.
- **`public/`** agrupa CSS, JS e imágenes; las rutas en `index.html` son relativas (`public/css/...`, etc.).
- **`docs/`** concentra material de apoyo y entregables que **no** debe mezclarse con los assets de la página.

## Funciones interactivas

- **Cabecera:** marca y botón de **tema claro/oscuro** (la preferencia se guarda en `localStorage`).
- **Menú lateral (escritorio):** índice con sección activa y barra de progreso de lectura.
- **Menú móvil / tablet:** icono de menú cuando el lateral no está fijo (ancho menor a 1100px), mismas secciones que el lateral.
- **Migas de pan:** reflejan la sección visible al hacer scroll.
- **Nota metodológica:** bloque visible bajo el hero aclarando que las cifras son ilustrativas (material académico).
- **Pestañas:** en cada funcionalidad, alternan los RNF descritos; **teclado:** flechas ←/→ (o ↑/↓), `Home`, `End`, foco con *roving tabindex*.
- **Acordeones:** escenarios arquitectónicos desplegables.
- **Tooltips:** métricas subrayadas; con foco se enlaza `aria-describedby` al globo de ayuda.
- **Modales:** «Detalle» en tácticas; **trampa de foco** con `Tab`, cierre con `Escape` y scroll del cuerpo bloqueado mientras está abierto.
- **Matriz:** celdas interactivas con texto explicativo debajo de la tabla.
- **Impresión:** estilos `@media print` (ocultan cabecera, lateral, ondas, modal, tooltips).

## Accesibilidad

- Enlace «Saltar al contenido», etiquetas ARIA en navegación, pestañas y diálogo modal.
- Contraste alto entre texto y fondo en ambos temas.
- Navegación por teclado: `Tab`, `Enter`/`Espacio`, pestañas con flechas, `Escape` para cerrar modal o menú móvil.
- `prefers-reduced-motion`: animaciones atenuadas y bloques `.reveal` visibles sin transición.

## Créditos

Proyecto académico. Los nombres comerciales se citan solo con fines educativos.
