import {t, getLanguage, localizeWork} from './i18n.js';
import {filterWorks, escapeHTML as esc, parseFavorites} from './catalog.js';
import {periods, biography, biographySources, artworkNote, imageNote} from './editorial.js';

const $ = selector => document.querySelector(selector);
const main = $('#main');
const dialog = $('#art-dialog');
const HEART = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>';
const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 12h15M13 5l7 7-7 7"/></svg>';
const SEARCH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>';
let sourceWorks, catalog, favorites, families, currentWork, returnFocus, routeName = 'inicio', limit = 24, shown = [], toastTimer;
let filters = {query:'',family:'',year:'',sort:'curated'};
const getWork = id => catalog.works.find(w => w.id === id);
const imageUrl = (w, small = false) => new URL(catalog.imageBaseUrl + (small ? w.thumbnail : w.image), document.baseURI).href;
const yearLabel = w => w.verifiedDate ? w.verifiedDate.slice(0,4) : w.year || t("Sin fecha");
const dateLabel = date => date ? new Intl.DateTimeFormat(getLanguage(), {day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(date + 'T12:00:00Z')) : t("Sin documentar");
const familyLink = family => '#coleccion?familia=' + encodeURIComponent(family);
const range = () => {const years=catalog.works.map(w=>w.year).filter(Boolean).sort();return years[0]+'–'+years.at(-1);};
function toast(message) { const notice=$('#toast');(dialog.open?dialog:document.body).append(notice);notice.textContent = message;notice.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => notice.classList.remove('visible'), 3300); }
function favoriteButton(w, extra = '') { return `<button class="favorite-button ${favorites.has(w.id)?'is-saved':''} ${extra}" data-favorite="${esc(w.id)}" aria-pressed="${favorites.has(w.id)}" aria-label="${favorites.has(w.id)?t("Quitar de"):t("Añadir a")}${t(" favoritas: ")}${esc(w.title)}">${HEART}</button>`; }
function card(w, index = 0) { return `<article class="art-card"><div class="card-image tone-${index%4}"><button class="art-open" data-open="${esc(w.id)}" aria-label="${t("Ver ")}${esc(w.title)}"><img src="${imageUrl(w,true)}" width="${w.width}" height="${w.height}" alt="${esc(w.title)}" loading="lazy" decoding="async"><span class="view-work">${t("Contemplar la obra ↗")}</span></button>${favoriteButton(w)}</div><div class="card-caption"><div><span class="card-family">${esc(t(w.family))}</span><h3><button data-open="${esc(w.id)}">${esc(w.title)}</button></h3></div><span class="card-year">${yearLabel(w)}</span></div></article>`; }
function sectionHeading(kicker,title,link,label) {return `<div class="section-heading"><div><p class="eyebrow">${kicker}</p><h2>${title}</h2></div>${link?`<a class="text-link" href="${link}">${label} ${ARROW}</a>`:''}</div>`;}
function themeCard(family,index) { const group=catalog.works.filter(w=>w.family===family);const w=getWork(catalog.collectionCovers[family])||group.at(-1);return `<a href="${familyLink(family)}" class="theme-card"><div class="theme-image"><img src="${imageUrl(w,true)}" alt="${esc(w.title)}" loading="lazy" width="${w.width}" height="${w.height}"><span class="theme-index">${String(index+1).padStart(2,'0')}</span></div><div class="theme-caption"><div><h3>${esc(t(family))}</h3><span>${group.length}${t(" obras")}</span></div>${ARROW}</div></a>`;}

function home() {
  const hero = getWork(catalog.heroId);
  const featured = catalog.featuredIds.map(getWork).filter(Boolean);
  main.innerHTML = `<section class="hero page-width"><div class="hero-copy"><p class="eyebrow"><span class="small-dot"></span> JAVIER COTELO VILLARREAL · 1932–2026</p><h1>${t("Una forma de<br>mirar <em>el mundo.</em>")}</h1><p class="hero-description">${t("Una colección de acuarelas para volver a sus paisajes,<br> conocer su pintura y conservar su memoria.")}</p><a class="button button-dark" href="#coleccion">${t("Explorar las acuarelas")} ${ARROW}</a><div class="hero-footnote"><span class="fine-line"></span><span>${t("La pintura como lugar de encuentro y de recuerdo.")}</span></div></div><figure class="hero-art"><div class="hero-art-backdrop"></div><button class="hero-art-button" data-open="${esc(hero.id)}" aria-label="${t("Ver ")}${esc(hero.title)}"><img src="${imageUrl(hero)}" width="${hero.width}" height="${hero.height}" alt="${esc(hero.title)}" fetchpriority="high"><span class="hero-expand" aria-hidden="true">↗</span></button><figcaption><span>${esc(hero.title)}</span><span>${yearLabel(hero)}</span></figcaption><span class="hero-side-label">${t("ACUARELA · ARCHIVO PERSONAL")}</span></figure></section>
  <div class="intro-strip page-width"><span><span class="small-dot"></span> ${t("UNA COLECCIÓN, MUCHAS MIRADAS")}</span><p><strong>${catalog.works.length}</strong>${t(" obras para explorar")}</p><p><strong>${families.length}</strong>${t(" familias temáticas")}</p><p class="strip-years">${range()} <span>${t("años del archivo")}</span></p></div>
  <section class="featured-section page-width">${sectionHeading(t("01 / UNA PRIMERA MIRADA"),t("Pequeños lugares donde quedarse."),'#coleccion',t("Ver toda la colección"))}<div class="art-grid home-grid">${featured.map(card).join('')}</div><p class="editorial-note">${t("Abre cada obra para contemplarla de cerca y conocer su lugar en la colección.")}</p></section>
  <section class="themes-section"><div class="page-width">${sectionHeading(t("02 / SEGUIR UN HILO"),t("Cada motivo, un nuevo recorrido."),'#recorridos',t("Todos los recorridos"))}<div class="theme-grid">${['Campos y montañas','Lagos y reflejos','Bosques y jardines','Marinas y costas'].filter(f=>families.includes(f)).map(themeCard).join('')}</div></div></section>
  <section class="home-chronology page-width"><div><p class="eyebrow">${t("03 / A TRAVÉS DE LOS AÑOS")}</p><h2>${t("Los motivos cambian.<br><em>La mirada permanece.</em>")}</h2><p>${t("De los primeros jardines del archivo a las maternidades, la nieve y los horizontes de agua. Un recorrido por las afinidades y los cambios de su pintura.")}</p><a href="#cronologia" class="text-link">${t("Explorar la cronología")} ${ARROW}</a></div><div class="home-periods">${[periods[0],periods[2],periods[6]].map(period=>{const w=getWork(period.workIds[0]);return `<a href="#cronologia?etapa=${period.id}"><img src="${imageUrl(w,true)}" alt="${esc(w.title)}" width="${w.width}" height="${w.height}" loading="lazy"><span>${period.label}</span><strong>${esc(t(period.title))}</strong></a>`;}).join('')}</div></section>
  <section class="archive-teaser page-width"><div><p class="eyebrow">${t("04 / RECORDAR A JAVIER")}</p><h2>${t("Una vida.<br><em>Una mirada que permanece.</em>")}</h2></div><div><p>${t("Javier Cotelo Villarreal (1932–2026) fue arquitecto, dibujante y pintor. Sus acuarelas conservan su atención al paisaje, a las personas y a los pequeños detalles.")}</p><p>${t("Falleció en Roma el 10 de octubre de 2026. Esta colección está dedicada a su memoria y a quienes desean seguir compartiendo su pintura.")}</p><a href="#javier" class="text-link">${t("Conocer su vida")} ${ARROW}</a></div></section>`;
}

function collection(isFavorites = false) {
  main.innerHTML = `<section class="collection-header page-width"><p class="eyebrow">${isFavorites?t("TU PROPIO RECORRIDO"):t("EL ARCHIVO DE ACUARELAS")}</p><div class="collection-title"><h1>${isFavorites?t("Las obras que <em>te acompañan.</em>"):`${t("La colección")}<span class="title-dot">.</span>`}</h1>${isFavorites?`<p>${t("Una selección personal, guardada en este navegador.")}</p>`:`<p>${catalog.works.length}${t(" acuarelas de Javier Cotelo Villarreal.")}<br>${t("Explora sus paisajes, sus figuras y sus colores.")}</p>`}</div></section>
  <section class="collection-body page-width" aria-label="${t("Explorar obras")}"><div class="collection-toolbar"><label class="search-field">${SEARCH}<input id="search" type="search" placeholder="${t("Busca un paisaje, un título…")}" value="${esc(filters.query)}" aria-label="${t("Buscar obras")}"><span class="search-shortcut">/</span></label><div class="select-field"><label for="family">${t("Motivo")}</label><select id="family"><option value="">${t("Todos los motivos")}</option>${families.map(f=>`<option ${f===filters.family?'selected':''} value="${esc(f)}">${esc(t(f))}</option>`).join('')}</select></div><div class="select-field year-select"><label for="year">${t("Año")}</label><select id="year"><option value="">${t("Todos")}</option>${[...new Set(catalog.works.map(w=>w.year).filter(Boolean))].sort().reverse().map(y=>`<option ${y===filters.year?'selected':''}>${esc(y)}</option>`).join('')}</select></div></div>
  <div class="quick-filters" aria-label="${t("Motivos frecuentes")}">${['','Campos y montañas','Bosques y jardines','Lagos y reflejos','Paisajes de nieve','Vírgenes y maternidades'].filter(f=>!f||families.includes(f)).map(f=>`<button data-filter="${esc(f)}" aria-pressed="${filters.family===f}">${esc(f ? t(f) : t('Todas las obras'))}</button>`).join('')}</div>
  <div class="results-toolbar"><p id="results-count" role="status" aria-live="polite"></p><div><button id="clear-filters" class="subtle-button">${t("Limpiar filtros")}</button><label class="sort-label">${t("Ordenar por ")}<select id="sort" aria-label="${t("Ordenar obras")}"><option value="curated">${t("Nuestra selección")}</option><option value="recent">${t("Más recientes")}</option><option value="oldest">${t("Más antiguas")}</option><option value="title">${t("Título A–Z")}</option></select></label></div></div>
  <div id="gallery" class="art-grid"></div><div id="load-more-area" class="load-more-area"></div>
  <div class="collection-bottom"><p>${t("Acuarelas de Javier Cotelo Villarreal")}</p><button id="export-data" class="text-link">${t("Descargar datos de esta selección ↓")}</button></div></section>`;
  $('#sort').value = filters.sort;
  $('#search').addEventListener('input', e => {filters.query=e.target.value;changeFilters();});
  $('#family').addEventListener('change', e => {filters.family=e.target.value;changeFilters();});
  $('#year').addEventListener('change', e => {filters.year=e.target.value;changeFilters();});
  $('#sort').addEventListener('change', e => {filters.sort=e.target.value;changeFilters();});
  $('#clear-filters').addEventListener('click', resetFilters);
  $('#export-data').addEventListener('click', exportData);
  renderGallery();
}
function results() {return filterWorks(catalog.works,{...filters,featuredIds:catalog.featuredIds,locale:getLanguage(),favorites:routeName==='favoritas'?favorites:null});}
function renderGallery() {
  shown=results();
  $('#results-count').innerHTML = `<strong>${shown.length}</strong> ${shown.length===1?t("obra"):t("obras")}${filters.family?' · '+esc(t(filters.family)):''}`;
  $('#clear-filters').hidden = !filters.query&&!filters.family&&!filters.year&&filters.sort==='curated';
  const emptyFavorites = routeName==='favoritas'&&!favorites.size;
  $('#gallery').innerHTML = shown.length ? shown.slice(0,limit).map(card).join('') : `<div class="empty-state"><span class="empty-symbol">${emptyFavorites?HEART:SEARCH}</span><h2>${emptyFavorites?t("Tu recorrido empieza con una obra."):t("Ninguna obra coincide con la búsqueda.")}</h2><p>${emptyFavorites?t("Guarda las acuarelas que te gusten pulsando el corazón. Las encontrarás juntas en este espacio."):t("Prueba con otro título o amplía los filtros para seguir explorando.")}</p>${emptyFavorites?`<a class="button button-dark" href="#coleccion">${t("Descubrir la colección →")}</a>`:`<button class="button button-dark" data-reset>${t("Ver todas las obras →")}</button>`}</div>`;
  $('#load-more-area').innerHTML = shown.length>limit?`<p>${t("Has visto {shown} de {total} obras", {shown: Math.min(limit, shown.length), total: shown.length})}</p><button class="button button-outline" id="load-more">${t("Seguir explorando")} <span>+</span></button>`:shown.length?`<p>${shown.length===1?t("Una obra, muchos detalles."):t("Has llegado al final de este recorrido.")}</p>`:'';
  $('#load-more')?.addEventListener('click',()=>{const previous=limit;limit+=24;renderGallery();$('#gallery').querySelectorAll('.art-open')[previous]?.focus({preventScroll:true});});
  $('#export-data').disabled = !shown.length;
  document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===filters.family)));
}
function changeFilters() {limit=24;$('#family').value=filters.family;updateURL();renderGallery();}
function resetFilters() {filters={query:'',family:'',year:'',sort:'curated'};$('#search').value='';$('#year').value='';$('#sort').value='curated';changeFilters();}
function updateURL(workId = currentWork?.id) {
  const p=new URLSearchParams();
  if(routeName==='cronologia') {
    const period=new URLSearchParams(location.hash.split('?')[1]||'').get('etapa');
    if(periods.some(item=>item.id===period))p.set('etapa',period);
  }
  if(['coleccion','favoritas'].includes(routeName)) {
    if(filters.query)p.set('q',filters.query);if(filters.family)p.set('familia',filters.family);if(filters.year)p.set('ano',filters.year);if(filters.sort!=='curated')p.set('orden',filters.sort);
  }
  if(workId)p.set('obra',workId);
  history.replaceState(null,'',`#${routeName}${p.size?'?'+p:''}`);
}

function journeys() {
  main.innerHTML=`<section class="page-width journeys"><p class="eyebrow">${t("DESCUBRIR POR AFINIDAD")}</p><div class="collection-title"><h1>${t("Seguir <em>un hilo.</em>")}</h1><p>${t("El agua, los árboles, un rostro, la nieve.<br>Distintas maneras de acercarse a su pintura.")}</p></div><div class="journeys-grid">${families.map(themeCard).join('')}</div><section class="time-section"><p class="eyebrow">${t("LA PINTURA Y EL TIEMPO")}</p><h2>${t("Una mirada que cambia.")}</h2><p>${t("Descubre cómo se suceden los motivos, las estaciones y los colores a lo largo de la colección.")}</p><a class="text-link" href="#cronologia">${t("Recorrer la cronología")} ${ARROW}</a></section></section>`;
}

function chronology() {
  const years = [...new Set(catalog.works.map(w => w.year).filter(Boolean))].sort();
  main.innerHTML = `<section class="chronology-page page-width">
    <header class="chronology-intro"><p class="eyebrow">${t("LA PINTURA Y EL TIEMPO")} · ${range()}</p><h1>${t("A través<br><em>de los años.</em>")}</h1><p class="large-prose">${t("Un camino entre paisajes, rostros y estaciones. Siete etapas para observar cómo cambian los motivos y el color en las acuarelas de Javier.")}</p><p>${t("Este recorrido reúne las obras según los años de su documentación fotográfica. Los temas se cruzan y reaparecen: un árbol, un camino o el reflejo del agua unen imágenes distantes en el tiempo.")}</p></header>
    <nav class="period-nav" aria-label="${t("Etapas de la cronología")}">${periods.map(period => `<a href="#cronologia?etapa=${period.id}">${period.label}</a>`).join('')}</nav>
    <div class="timeline">${periods.map((period, index) => {
      const works = catalog.works.filter(w => Number(w.year) >= period.from && Number(w.year) <= period.to);
      return `<section class="timeline-period" id="etapa-${period.id}" aria-labelledby="heading-${period.id}"><div class="period-heading"><div class="period-date"><span class="eyebrow">${String(index+1).padStart(2, '0')}${t(" / ETAPA")}</span><p>${period.label}</p><span>${works.length}${t(" obras en la colección")}</span></div><div class="period-story"><h2 id="heading-${period.id}" tabindex="-1">${esc(t(period.title))}</h2><p>${esc(t(period.text))}</p><p class="period-observation">${esc(t(period.detail))}</p></div></div><div class="art-grid timeline-works">${period.workIds.map(getWork).filter(Boolean).map(card).join('')}</div><div class="period-links" aria-label="${t("Obras por año de ")}${period.label}">${years.filter(y => Number(y) >= period.from && Number(y) <= period.to).map(y => `<a class="text-link" href="#coleccion?ano=${y}&orden=oldest">${t("Ver las obras de ")}${y} ${ARROW}</a>`).join('')}</div></section>`;
    }).join('')}</div>
    <section class="time-section"><p class="eyebrow">${t("EXPLORAR EL ARCHIVO")}</p><h2>${t("Cada año, sus obras.")}</h2><div class="year-grid">${years.map(y=>{const count=catalog.works.filter(w=>w.year===y).length;return `<a href="#coleccion?ano=${y}&orden=oldest"><span>${y}</span><small>${count} ${count===1?t("obra"):t("obras")} ${ARROW}</small></a>`;}).join('')}</div></section>
    <aside class="memory-note"><p>${t("Javier falleció el 10 de octubre de 2026. Sus obras nos ofrecen un lugar al que volver y una forma de seguir compartiendo su mirada.")}</p><a class="text-link" href="#javier">${t("Recordar a Javier")} ${ARROW}</a></aside>
  </section>`;
}

function artist() {
  main.innerHTML = `<article class="artist-page page-width"><div class="artist-layout"><header class="artist-heading"><p class="eyebrow">${t("EN SU MEMORIA · 1932–2026")}</p><h1>Javier Cotelo<br><em>Villarreal.</em></h1><p class="artist-dates">${t("Madrid, 16 de agosto de 1932<br>Roma, 10 de octubre de 2026")}</p></header><figure class="artist-portrait"><img src="./portraits/javier-cotelo-villarreal.webp" alt="${t("Javier Cotelo Villarreal durante un paseo por un jardín")}" width="960" height="1280" fetchpriority="high"><figcaption>${t("Javier, julio de 2022.")}<span>${t("Archivo fotográfico personal.")}</span></figcaption></figure><div class="artist-prose">${biography.map(paragraph=>`<p>${esc(t(paragraph))}</p>`).join('')}<p class="artist-dedication">${t("Esta colección está dedicada a su memoria y a quienes desean volver a encontrarse con sus obras.")}</p><a class="text-link" href="#cronologia">${t("Su pintura a través de los años")} ${ARROW}</a></div></div><section class="bio-sources" aria-labelledby="bio-sources-title"><h2 id="bio-sources-title">${t("Para conocerlo mejor")}</h2><p>${t("Lecturas sobre su vida y su trabajo, y una entrevista para escuchar a Javier en primera persona.")}</p><ul>${biographySources.map(source=>`<li><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(t(source.label))} <span aria-hidden="true">↗</span><span class="sr-only">${t(" (se abre en otra pestaña)")}</span></a></li>`).join('')}</ul></section></article>`;
}

function archive() {
  const work = getWork(catalog.collectionCovers['Bosques y jardines']) || catalog.works[0];
  main.innerHTML=`<section class="archive-page page-width"><div class="archive-intro"><div><p class="eyebrow">${t("EL ARCHIVO DE ACUARELAS")}</p><h1>${t("Conservar las obras.<br><em>Compartir la mirada.</em>")}</h1><p class="large-prose">${t("Un espacio dedicado a la pintura de Javier Cotelo Villarreal y al cuidado de su memoria.")}</p><p>${t("La colección reúne las fotografías de sus acuarelas para que puedan contemplarse juntas. Cada ficha conserva una imagen de la obra, su lugar en el archivo y los datos que ayudan a conocerla.")}</p><p>${t("Los recorridos acercan obras que comparten un motivo. La cronología permite seguir sus cambios y sus afinidades a través de los años.")}</p><a href="#coleccion" class="text-link">${t("Entrar en la colección")} ${ARROW}</a></div><figure><img src="${imageUrl(work)}" alt="${esc(work.title)}" width="${work.width}" height="${work.height}"><figcaption>${esc(work.title)} · ${yearLabel(work)}</figcaption></figure></div>
  <div class="archive-facts"><div><strong>${catalog.works.length}</strong><span>${t("obras reunidas")}</span></div><div><strong>${families.length}</strong><span>${t("recorridos temáticos")}</span></div><div><strong>${range()}</strong><span>${t("años del archivo")}</span></div></div>
  <section class="archive-method"><div><p class="eyebrow">${t("ACERCA DE LA COLECCIÓN")}</p><h2>${t("Cuidar cada imagen.<br>Conservar su historia.")}</h2><p>${t("Algunas claves para consultar las obras y conocer cómo se ha organizado el archivo.")}</p></div><div class="method-items"><details open><summary>${t("Los títulos y los recorridos")} <span>+</span></summary><p>${t("Los títulos describen lo que aparece en las obras y ayudan a encontrarlas. Los recorridos y las etapas de la cronología son una lectura de la colección, basada en sus motivos y en la documentación conservada.")}</p></details><details><summary>${t("Los años del archivo")} <span>+</span></summary><p>${t("El año de catálogo sigue la primera fotografía conservada de cada obra. Cuando existe una fecha de pintura documentada, se muestra en su ficha. La fecha de la fotografía elegida se conserva por separado.")}</p></details><details><summary>${t("Las fotografías")} <span>+</span></summary><p>${t("Se ha elegido una toma de cada obra procurando conservar la imagen completa. Los ajustes de encuadre y perspectiva respetan la pintura, sus colores y las anotaciones visibles. Las distintas tomas permanecen reunidas en el archivo.")}</p></details><details><summary>${t("Una referencia para cada obra")} <span>+</span></summary><p>${t("Cada acuarela tiene un identificador que permite reconocerla y enlazar su ficha. Las fotografías y la documentación se conservan junto a esa referencia.")}</p></details><details><summary>${t("Tu selección y las descargas")} <span>+</span></summary><p>${t("Puedes guardar tus obras favoritas en este navegador y descargar los datos de una selección en CSV o de una ficha en JSON. No necesitas crear una cuenta.")}</p></details><details><summary>${t("Leer con comodidad")} <span>+</span></summary><p>${t("En «Preferencias», en la cabecera, puedes elegir el idioma, la apariencia y la letra grande. Por defecto, el idioma sigue al navegador y la apariencia al dispositivo. Tus elecciones se recuerdan en este navegador.")}</p></details></div></section></section>`;
}

function saveFavorite(id) {
  favorites.has(id)?favorites.delete(id):favorites.add(id);
  try {localStorage.setItem('jcv-favorites-v1',JSON.stringify([...favorites]));} catch {toast(t("Tu selección durará esta sesión: el navegador no permite guardarla."));}
  updateFavoriteUI();
  if(routeName==='favoritas')renderGallery();
}
function updateFavoriteUI() {
  $('#favorite-count').textContent=favorites.size;
  document.querySelectorAll('[data-favorite]').forEach(b=>{const w=getWork(b.dataset.favorite);const saved=favorites.has(w.id);b.classList.toggle('is-saved',saved);b.setAttribute('aria-pressed',String(saved));b.setAttribute('aria-label',`${saved?t("Quitar de"):t("Añadir a")}${t(" favoritas: ")}${w.title}`);if(b.classList.contains('detail-save'))b.innerHTML=HEART+(saved?t("Guardada en mi selección"):t("Guardar en mi selección"));});
}
function detailSequence() {return ['coleccion','favoritas'].includes(routeName)&&shown.length?shown:filterWorks(catalog.works,{featuredIds:catalog.featuredIds,sort:routeName==='cronologia'?'oldest':'curated'});}
function openWork(id, {sync=true}={}) {
  const w=getWork(id);if(!w){toast(t("Esta obra ya no está en la selección actual."));return;}
  if(!dialog.open)returnFocus=document.activeElement;
  currentWork=w;const sequence=detailSequence();const index=sequence.findIndex(item=>item.id===w.id);
  $('#art-content').innerHTML=`<div class="detail-top"><a class="detail-brand" href="#inicio">jcv.</a><span>${esc(w.id)} <span class="detail-counter">/ ${index>=0?t("{index} de {total} obras", {index: index+1, total: sequence.length}):t("Archivo de acuarelas")}</span></span><button class="icon-button close-detail" aria-label="${t("Cerrar ficha")}"><svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div><div class="detail-body"><div class="detail-art-panel"><div class="detail-image-stage"><button class="zoom-image" aria-label="${t("Ampliar imagen")}" aria-pressed="false"><img src="${imageUrl(w)}" width="${w.width}" height="${w.height}" alt="${esc(w.title)}"></button></div><div class="image-tools"><button id="zoom-toggle" class="subtle-button">${SEARCH}${t(" Ampliar imagen")}</button><span>${t("La obra, sin prisa.")}</span></div></div><div class="detail-info"><p class="eyebrow">${esc(t(w.family))}</p><h2 id="art-title">${esc(w.title)}</h2><p class="detail-title-note">${w.titleProposed?t("Título descriptivo"):t("Título documentado")}</p><p class="detail-artist">Javier Cotelo Villarreal</p><dl><div><dt>${w.verifiedDate?t("Fecha"):t("Año")}</dt><dd>${w.verifiedDate?dateLabel(w.verifiedDate):yearLabel(w)}</dd></div><div><dt>${t("Técnica")}</dt><dd>${esc(w.technique)}</dd></div><div><dt>${t("Recorrido")}</dt><dd><a href="${familyLink(w.family)}">${esc(t(w.family))} ↗</a></dd></div><div><dt>${t("Referencia")}</dt><dd>${esc(w.id)}</dd></div></dl><button class="button button-outline detail-save" data-favorite="${esc(w.id)}" aria-pressed="${favorites.has(w.id)}">${HEART}${favorites.has(w.id)?t("Guardada en mi selección"):t("Guardar en mi selección")}</button><div class="detail-actions"><button id="share-work">${t("Copiar enlace ↗")}</button><button id="download-work">${t("Descargar ficha ↓")}</button></div><details class="documentation"><summary>${t("Documentación de esta obra")} <span>+</span></summary><p>${w.verifiedDate?t("La fecha de esta obra está documentada."):t("El año de catálogo corresponde a la primera fotografía conservada de la obra.")}</p><p><strong>${t("Fotografía elegida:")}</strong> ${dateLabel(w.photoDate)}.<br><strong>${t("Tomas documentadas:")}</strong> ${w.photoCount}.</p>${w.cycle?`<p><strong>${t("En el archivo:")}</strong> ${esc(w.cycle)}.</p>`:''}${w.notes?`<p>${esc(t(artworkNote(w)))}</p>`:''}${w.limitation?`<p>${esc(t(imageNote(w)))}</p>`:''}</details></div></div><div class="detail-bottom"><button id="previous-work" ${sequence.length<2?'disabled':''}>← <span>${t("Obra anterior")}</span></button><span>${t("Una ventana al mundo de Javier")}</span><button id="next-work" ${sequence.length<2?'disabled':''}><span>${t("Siguiente obra")}</span> →</button></div>`;
  $('.close-detail').addEventListener('click',closeWork);
  $('#zoom-toggle').addEventListener('click',toggleZoom);
  $('.zoom-image').addEventListener('click',toggleZoom);
  $('#previous-work').addEventListener('click',()=>stepWork(-1));$('#next-work').addEventListener('click',()=>stepWork(1));
  $('#share-work').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);toast(t("Enlace de la obra copiado."));}catch{toast(t("Copia el enlace de la barra de direcciones para compartir esta obra."));}});
  $('#download-work').addEventListener('click',()=>download(JSON.stringify({artist:catalog.artist,...Object.fromEntries(Object.entries(w).filter(([key])=>key!=='searchText')),family:t(w.family),notes:t(artworkNote(w))},null,2),`${w.id}.json`,'application/json'));
  if(!dialog.open){dialog.showModal();document.body.classList.add('modal-open');}
  $('.close-detail').focus({preventScroll:true});dialog.scrollTop=0;
  if(sync)updateURL(w.id);
}
function toggleZoom() {const stage=$('.detail-image-stage');const zoom=stage.classList.toggle('is-zoomed');$('.zoom-image').setAttribute('aria-pressed',String(zoom));$('.zoom-image').setAttribute('aria-label',zoom?t("Reducir imagen"):t("Ampliar imagen"));$('#zoom-toggle').innerHTML=SEARCH+(zoom?t(" Ver imagen completa"):t(" Ampliar imagen"));}
function stepWork(direction) {const seq=detailSequence();let i=seq.findIndex(w=>w.id===currentWork.id);openWork(seq[(i+direction+seq.length)%seq.length].id);}
function closeWork() {dialog.close();currentWork=null;document.body.classList.remove('modal-open');updateURL(null);if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});}
dialog.addEventListener('cancel',e=>{e.preventDefault();closeWork();});
function download(content,filename,type) {const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function exportData() {
  const columns=[['id',t("Referencia")],['title',t("Título")],['family',t("Motivo")],['year',t("Año de catálogo")],['photoDate',t("Fecha de fotografía")],['technique',t("Técnica")],['cycle',t("Recorrido")],['notes',t("Notas")],['photoCount',t("Fotografías conservadas")]];
  const cell = val => '"'+String(val??'').replace(/^[=+\-@]/,"'$&").replaceAll('"','""')+'"';
  const csv='\uFEFF'+[columns.map(c=>cell(c[1])).join(';'),...results().map(w=>columns.map(c=>cell(c[0]==='notes'?t(artworkNote(w)):c[0]==='family'?t(w.family):w[c[0]])).join(';'))].join('\r\n');
  download(csv,'javier-cotelo-seleccion.csv','text/csv;charset=utf-8');toast(t("Datos de la selección descargados."));
}

function renderRoute({scroll=true, preserve=false}={}) {
  const [route,query='']=location.hash.slice(1).split('?');const p=new URLSearchParams(query);
  routeName=['inicio','coleccion','cronologia','recorridos','javier','archivo','favoritas'].includes(route)?route:'inicio';
  if(!preserve){filters={query:p.get('q')||'',family:p.get('familia')||'',year:p.get('ano')||'',sort:['curated','recent','oldest','title'].includes(p.get('orden'))?p.get('orden'):'curated'};limit=24;}
  if(dialog.open){dialog.close();document.body.classList.remove('modal-open');}currentWork=null;
  document.querySelectorAll('[data-nav]').forEach(a=>{if(a.dataset.nav===routeName)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  const titles={inicio:t("Acuarelas"),coleccion:t("La colección"),recorridos:t("Recorridos"),cronologia:t("Cronología"),javier:t("Javier · 1932–2026"),archivo:t("El archivo"),favoritas:t("Mi selección")};
  document.title=`${titles[routeName]} · Javier Cotelo Villarreal`;
  if(routeName==='inicio')home();else if(routeName==='coleccion'||routeName==='favoritas')collection(routeName==='favoritas');else if(routeName==='recorridos')journeys();else if(routeName==='cronologia')chronology();else if(routeName==='javier')artist();else archive();
  if(scroll)window.scrollTo({top:0,behavior:'instant'});
  const heading=main.querySelector('h1');heading?.setAttribute('tabindex','-1');
  const period=routeName==='cronologia'&&periods.find(item=>item.id===p.get('etapa'));
  if(period){
    document.querySelector(`.period-nav a[href="#cronologia?etapa=${period.id}"]`)?.setAttribute('aria-current','location');
    if(!preserve)requestAnimationFrame(()=>{const target=document.getElementById('heading-'+period.id);target?.scrollIntoView({behavior:'instant',block:'start'});target?.focus({preventScroll:true});});
  }else if(scroll&&!p.has('obra'))heading?.focus({preventScroll:true});
  if(p.has('obra'))openWork(p.get('obra'),{sync:false});
}
document.addEventListener('click',event=>{
  if(event.target.closest('.skip-link')){event.preventDefault();main.focus({preventScroll:true});main.scrollIntoView({behavior:'instant'});return;}
  const favorite=event.target.closest('[data-favorite]');if(favorite){saveFavorite(favorite.dataset.favorite);return;}
  const open=event.target.closest('[data-open]');if(open){openWork(open.dataset.open);return;}
  const filter=event.target.closest('[data-filter]');if(filter){filters.family=filter.dataset.filter;changeFilters();return;}
  if(event.target.closest('[data-reset]'))resetFilters();
});
document.addEventListener('keydown',event=>{
  if(/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName))return;
  if(dialog.open&&['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();stepWork(event.key==='ArrowLeft'?-1:1);}
  if(event.key==='/'&&!dialog.open){event.preventDefault();if(!$('#search')){location.hash='coleccion';setTimeout(()=>$('#search')?.focus(),30);}else $('#search').focus();}
});
window.addEventListener('hashchange',()=>catalog&&renderRoute());
window.addEventListener('languagechange-preference',()=>{
  if(!sourceWorks||!favorites)return;
  const focused=document.activeElement;
  const savedReturnFocus=returnFocus;
  const zoomed=Boolean($('.detail-image-stage.is-zoomed'));
  const dialogScroll=dialog.scrollTop;
  const scrollTop=window.scrollY;
  catalog.works=sourceWorks.map(work=>localizeWork(work));
  renderRoute({scroll:false,preserve:true});
  updateFavoriteUI();
  if(dialog.open){if(zoomed)toggleZoom();dialog.scrollTop=dialogScroll;}
  if(savedReturnFocus?.dataset?.open){returnFocus=main.querySelector(`[data-open="${savedReturnFocus.dataset.open}"]`);}
  if(focused?.isConnected)focused.focus({preventScroll:true});
  window.scrollTo({top:scrollTop,behavior:'instant'});
  clearTimeout(toastTimer);$('#toast').classList.remove('visible');
});
window.addEventListener('storage',event=>{if(event.key==='jcv-favorites-v1'&&catalog){favorites=parseFavorites(event.newValue,new Set(catalog.works.map(w=>w.id)));updateFavoriteUI();if(routeName==='favoritas')renderGallery();}});
document.addEventListener('error',event=>{if(event.target instanceof HTMLImageElement){event.target.classList.add('image-unavailable');event.target.alt=t("Imagen temporalmente no disponible");}},true);
async function init() {
  try {
    const response=await fetch('./catalog.json');if(!response.ok)throw new Error('Catálogo no disponible');catalog=await response.json();
    if(!Array.isArray(catalog.works)||!catalog.works.length)throw new Error('Catálogo vacío');
    sourceWorks=catalog.works;catalog.works=sourceWorks.map(work=>localizeWork(work));
    let raw='[]';try{raw=localStorage.getItem('jcv-favorites-v1');}catch{}
    favorites=parseFavorites(raw,new Set(catalog.works.map(w=>w.id)));
    families=[...new Set(catalog.works.map(w=>w.family))].sort((a,b)=>catalog.works.filter(w=>w.family===b).length-catalog.works.filter(w=>w.family===a).length);
    updateFavoriteUI();renderRoute({scroll:false});
  }catch(error){main.innerHTML=`<section class="empty-state"><h1>${t("El cuaderno no se ha podido abrir.")}</h1><p>${t("No hemos podido cargar la colección. Vuelve a intentarlo en un momento.")}</p><button class="button button-dark" id="retry">${t("Volver a intentar")}</button></section>`;$('#retry').addEventListener('click',init);console.error(error);}
}
init();
