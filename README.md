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

## Estructura de archivos

| Archivo / carpeta | Descripción |
|-------------------|-------------|
| `index.html` | Estructura semántica, secciones y componentes |
| `styles.css` | Estilos modulares, tema claro/oscuro, responsive |
| `script.js` | Pestañas, acordeón, tooltips, modal, scroll spy, matriz, ondas en canvas |
| `assets/` | Logotipo e iconos SVG |

## Funciones interactivas

- **Barra superior:** enlaces a secciones; botón de **tema claro/oscuro** (la preferencia se guarda en `localStorage`).
- **Menú móvil:** icono de menú (pantallas estrechas) para las mismas secciones.
- **Barra lateral (escritorio):** índice con sección activa y barra de progreso de lectura.
- **Migas de pan:** reflejan la sección visible al hacer scroll.
- **Pestañas:** en cada funcionalidad, alternan los RNF descritos.
- **Acordeones:** escenarios arquitectónicos desplegables.
- **Tooltips:** al pasar el cursor (o al enfocar con teclado) sobre métricas subrayadas.
- **Modales:** botón «Detalle» en cada táctica para ampliar explicación.
- **Matriz:** celdas interactivas con texto explicativo debajo de la tabla.

## Accesibilidad

- Enlace «Saltar al contenido», etiquetas ARIA en navegación, pestañas y diálogo modal.
- Contraste alto entre texto y fondo en ambos temas.
- Navegación por teclado: `Tab`, `Enter`/`Espacio`, `Escape` para cerrar modal o menú móvil.

## Créditos

Proyecto académico. Los nombres comerciales se citan solo con fines educativos.
