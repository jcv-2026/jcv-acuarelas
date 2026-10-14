# Acuarelas de Javier Cotelo Villareal

Galería de 409 obras, con búsqueda por título o motivo, filtros por año, recorridos temáticos, favoritas y un visor ampliable. Las fotografías, las tipografías y los datos se sirven desde el propio sitio.

## Web publicada

La galería está disponible en **https://jcv-2026.github.io/jcv-acuarelas/**.

El flujo [Publicar galería en GitHub Pages](https://github.com/jcv-2026/jcv-acuarelas/actions/workflows/pages.yml) se ejecuta al subir cambios a `main`. Instala las dependencias, construye la web y comprueba el catálogo y sus imágenes antes de publicar `dist/`. También se puede iniciar manualmente desde GitHub Actions. La configuración está en `.github/workflows/pages.yml`.

## Arrancar

Requiere Node.js 22 o posterior.

```powershell
npm ci
npm run dev
```

Abre http://localhost:4173. La web se construye automáticamente antes de arrancar. Para generar solo la versión estática, ejecuta `npm run build`: el resultado queda en `dist/`, preparado para servirse por HTTP. La web generada no necesita Node ni una base de datos.

## Estructura

```text
src/                 Interfaz: HTML, CSS y JavaScript
data/catalog.json    Fichas de las obras utilizadas por la web
public/media/        Imagen completa y miniatura WebP de cada obra
public/fonts/        Tipografías locales y sus licencias
catalog.config.json  Portada, obras destacadas y cubiertas de los recorridos
scripts/             Construcción y servidor local
tests/               Pruebas del catálogo y del navegador
docs/                Criterios de selección fotográfica
```

El repositorio contiene todo lo necesario para construir la galería desde un clon nuevo. `data/catalog.json` es el catálogo de la web; sus identificadores enlazan las fichas con las 818 imágenes de `public/media/`. Para corregir una ficha, edita ese catálogo y vuelve a construir. Para incorporar una obra, añade también su imagen y su miniatura WebP. Los campos `image` y `thumbnail` contienen sus nombres de archivo.

`catalog.config.json` permite cambiar la selección de portada mediante `heroId`, `featuredIds` y `collectionCovers`. La ruta `catalog` se resuelve respecto a ese archivo. `JCV_CONFIG` permite utilizar otra configuración y `JCV_CATALOG`, otro catálogo. `imageBaseUrl` indica desde dónde cargará las imágenes la web.

## Archivo fotográfico local

Los originales, las tomas alternativas, los descartes, las imágenes pendientes y el material intermedio se conservan en `.local/archive/`, excluido de Git. El catálogo de revisión sigue disponible en `.local/archive/catalogo/index.html`; sus originales están en `.local/archive/paintings/`. Las exportaciones y cachés anteriores están en `.local/artifacts/`.

El historial anterior a la reorganización se conserva en `.local/history/web-antes-de-reorganizar.bundle`, junto con el cambio que aún no se había confirmado. Estas carpetas existen en el equipo de trabajo y no se descargan al clonar el repositorio.

En Git se incluyen únicamente las fotografías que utiliza la galería, en tamaños optimizados. `.env`, dependencias, compilaciones, informes de pruebas y conexiones de alojamiento quedan excluidos mediante `.gitignore`.

Los títulos, las atribuciones y las fechas siguen siendo propuestas de catálogo. Los [criterios fotográficos](docs/archivo-fotografico.md) explican la selección y los recortes realizados sin IA generativa.

## Comprobar

```powershell
npm run build
npm test
npx playwright install chromium
npm run test:browser
```

Las pruebas verifican datos e imágenes, búsqueda, filtros, favoritas, enlaces directos, zoom y exportaciones. Comprueban también la presentación a 390, 768 y 1440 píxeles. Las capturas se guardan en `test-results/`, fuera de Git.

Las favoritas se guardan en el navegador. Una obra se puede enlazar con `#coleccion?obra=AC1489`; el visor admite flechas del teclado y Escape. La tecla `/` enfoca el buscador.
