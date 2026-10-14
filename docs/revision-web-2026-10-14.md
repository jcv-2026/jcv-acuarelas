**Revisión de la web y del aprovechamiento del archivo — 14 de octubre de 2026**

La galería tiene una base visual y funcional sólida. El diseño deja espacio a las acuarelas, mantiene sus proporciones y ofrece búsqueda, filtros, favoritas y fichas. La mejora con mayor valor consiste en hacer visibles las relaciones y la documentación que ya existen en el archivo, conservando el carácter provisional de los datos.

Se revisaron la [web publicada](https://jcv-2026.github.io/jcv-acuarelas/), el código del proyecto, el catálogo público y el catálogo fotográfico local. Este documento conserva el diagnóstico anterior a la actualización editorial del mismo día. Posteriormente se incorporaron la cronología y la biografía, se revisaron los textos, se amplió la tipografía con una opción de letra grande y se corrigió el desbordamiento móvil. Los hallazgos de abajo describen la versión revisada inicialmente.

**Comprobaciones realizadas**

- Construcción correcta: 409 obras y 818 imágenes. Las cuatro pruebas de catálogo y las cinco pruebas de navegador pasan.
- Validación de los 818 archivos WebP locales con Pillow, sin errores.
- Prueba adicional en la web publicada a 390 y 1440 px: imágenes, navegación, favoritas, apertura de fichas, recarga de enlaces directos y recorridos. Sin errores JavaScript ni respuestas HTTP fallidas durante esos recorridos.
- Comparación del contenido de `index.html`, `app.js`, `catalog.js`, `styles.css` y `catalog.json`: la versión publicada coincide byte a byte con la construcción local.
- Comprobación de las cinco vistas a 320, 360, 390, 768, 1024 y 1440 px. Se detectó un desbordamiento a 320 px, descrito más abajo.
- Los títulos, familias, fechas estimadas, fechas verificadas y notas de las 409 obras públicas coinciden con sus fichas locales.

Las comprobaciones de navegador se hicieron con Chromium. No equivalen a una auditoría completa con lectores de pantalla, Safari o dispositivos físicos. Las medidas de carga son observaciones de laboratorio, no estadísticas de visitantes reales.

**Correcciones y mejoras de presentación, por prioridad**

| Prioridad | Hallazgo y evidencia | Cambio propuesto |
| --- | --- | --- |
| Alta | En `#recorridos`, a 320 px, el documento mide 356 px de ancho. La tercera columna de años queda cortada. La cuadrícula mantiene tres columnas con un ancho mínimo determinado por su contenido. | Usar dos columnas en pantallas estrechas o ajustar el mínimo de las columnas y sus espacios. Añadir 320 px a las comprobaciones existentes. |
| Alta | En móvil, los nombres de las familias se dibujan a 6,5 px y los años a 9 px. La información está presente, pero cuesta leerla. | Aumentar estos textos y revisar los espacios de las tarjetas con sus títulos más largos. |
| Media | En seis cargas nuevas, el desplazamiento acumulado observado fue aproximadamente 0,23–0,28. El mayor salto se produce al sustituir «Abriendo el cuaderno…»: el pie inicialmente visible sale de la pantalla. En una carga móvil también cambió la altura del título al llegar la fuente. | Generar el contenido inicial durante la construcción o reservar una estructura de carga de tamaño parecido. Ajustar la carga y las métricas de las fuentes. |
| Media | La ficha AC0031 conserva el título de pestaña «La colección», el título Open Graph general y ninguna imagen `og:image`. Las obras se abren mediante botones y direcciones con fragmentos `#…?obra=…`. | Generar una página estática por obra, con título, descripción, imagen social y URL propios; enlazar las tarjetas a esas páginas y conservar el visor como mejora de navegación. |

El código relevante está en [styles.css](../src/styles.css), especialmente `.year-grid`, los estilos móviles de `.card-family` y `.loading`; en [index.html](../src/index.html), para el contenido inicial y los metadatos; y en [app.js](../src/app.js), en `card`, `openWork` y `renderRoute`.

Para interpretar la estabilidad visual, la referencia de Google considera bueno un CLS de hasta 0,1. Las observaciones anteriores sirven para localizar el salto, pero no sustituyen la medida de campo al percentil 75. [Referencia de CLS](https://web.dev/articles/cls).

La recomendación de páginas por obra también responde a que Google aconseja evitar fragmentos para cargar contenidos distintos. Esto no demuestra que la web completa esté sin indexar: no se ha consultado Search Console. [Documentación de Google sobre JavaScript y enlaces](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).

**Datos disponibles y cómo aprovecharlos**

| Información comprobada | Uso actual | Propuesta concreta |
| --- | --- | --- |
| 11 relaciones propuestas entre 22 obras seleccionadas | Permanecen en el archivo local y no llegan al catálogo público. | Añadir «Obras relacionadas» a esas fichas y un comparador de dos obras. Por ejemplo, AC0031 y AC0081 ya están relacionadas en el archivo. Mantener visible que se trata de una relación propuesta. |
| 336 de las 409 obras tienen varias tomas; las seleccionadas reúnen 794 fotografías, incluidas 385 alternativas | La ficha muestra el número de tomas, pero solo una imagen. | Incorporar una selección de otras tomas con su fecha y una vista de comparación. Distinguir fotografías de la misma pintura de posibles versiones o estados: una diferencia de iluminación no prueba una evolución de la obra. |
| 14 años de documentación, 16 familias y 62 valores de agrupación propuesta | Hay tarjetas por familia y enlaces por año. | Ampliar el recorrido temporal existente con imágenes representativas y textos breves que expliquen concentraciones de motivos. Ejemplos documentados: maternidades en 2022, nieve en 2024 y lagos y costas en 2026. |
| 32 fichas contienen notas y 7 indican limitaciones de imagen | Se leen dentro del desplegable de documentación. El buscador no incluye notas ni limitaciones. | Permitir buscar en la documentación y señalar en la ficha cuándo existe una observación relevante. Caso reproducible: «fase intermedia» no devuelve AC0491, aunque aparece en su nota. |
| La familia «Bodegones» tiene 2 obras y «Bodegones y objetos» tiene 1 | Son dos recorridos separados. | Revisar si esa distinción aporta valor. Añadir etiquetas transversales revisadas —árboles, caminos, nieve, agua— para explorar sin depender de una única familia por obra. |
| 24 imágenes y 2 vídeos clasificados como documentación contextual | Se conservan localmente. | Preparar una selección editorial sobre el taller, los materiales o el proceso, comprobando qué muestra cada elemento. Hay imágenes de distinta naturaleza; el conjunto no es una biografía validada. |
| 73 grupos pendientes de confirmar | Se conservan fuera de la selección pública. | Crear una cola de revisión interna con toma preferida, motivo de duda y campos por validar. Es la vía para ampliar el catálogo con trazabilidad. |

Los 423 archivos alternativos citados en el informe general corresponden al conjunto de grupos seleccionados y pendientes. Para las 409 obras de la web, la cifra concreta es de 385 alternativas. Esta distinción evita atribuir a la galería fotografías de grupos todavía pendientes.

El CSV público también puede aprovechar mejor la documentación: actualmente omite agrupación, notas, limitaciones, número de tomas y enlace de la obra. Añadir esas columnas haría la descarga más útil para estudiar o revisar una selección. La ficha individual en JSON ya contiene más información que el CSV.

**Calidad y mantenimiento del catálogo**

Las 409 fichas mantienen atribución provisional, título propuesto y fecha de pintura sin verificar. El archivo permite describir cuándo se fotografiaron las obras y cómo se agrupan visualmente; una cronología editorial debe conservar esa distinción. El día de una fotografía no documenta por sí solo el día de creación de la pintura.

Los campos públicos contrastados coinciden hoy con el archivo local. Para incorporar relaciones, nuevas tomas y futuras correcciones conviene definir una transformación reproducible desde las fichas de revisión hacia el catálogo público, con una selección explícita de los campos e imágenes que se publican. Así se mantiene la correspondencia sin copiar manualmente cada cambio.

El orden propuesto es: corregir anchura y legibilidad móvil; añadir relaciones, búsqueda documental y un CSV más completo; generar páginas por obra y estabilizar la carga inicial; después desarrollar la cronología editorial y la comparación de fotografías.

Las evidencias de esta revisión se guardan localmente en `.local/artifacts/review-2026-10-14/`: `report.json`, `layout-shifts.json` y capturas de portada, colección móvil y desbordamiento de los años. El script `.local/tools/audit_site.mjs` permite repetir la comprobación principal de la web publicada.
