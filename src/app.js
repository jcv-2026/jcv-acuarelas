import {filterWorks, escapeHTML as esc, parseFavorites} from './catalog.js';

const $ = selector => document.querySelector(selector);
const main = $('#main');
const dialog = $('#art-dialog');
const HEART = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>';
const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 12h15M13 5l7 7-7 7"/></svg>';
const SEARCH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>';
let catalog, favorites, families, currentWork, returnFocus, routeName = 'inicio', limit = 24, shown = [], toastTimer;
let filters = {query:'',family:'',year:'',sort:'curated'};
const getWork = id => catalog.works.find(w => w.id === id);
const imageUrl = (w, small = false) => new URL(catalog.imageBaseUrl + (small ? w.thumbnail : w.image), document.baseURI).href;
const yearLabel = w => w.verifiedDate ? w.verifiedDate.slice(0,4) : w.year ? `${w.year} aprox.` : 'Sin fecha';
const dateLabel = date => date ? new Intl.DateTimeFormat('es', {day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(date + 'T12:00:00Z')) : 'Sin documentar';
const familyLink = family => '#coleccion?familia=' + encodeURIComponent(family);
const range = () => {const years=catalog.works.map(w=>w.year).filter(Boolean).sort();return years[0]+'–'+years.at(-1);};
function toast(message) { const notice=$('#toast');(dialog.open?dialog:document.body).append(notice);notice.textContent = message;notice.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => notice.classList.remove('visible'), 3300); }
function favoriteButton(w, extra = '') { return `<button class="favorite-button ${favorites.has(w.id)?'is-saved':''} ${extra}" data-favorite="${esc(w.id)}" aria-pressed="${favorites.has(w.id)}" aria-label="${favorites.has(w.id)?'Quitar de':'Añadir a'} favoritas: ${esc(w.title)}">${HEART}</button>`; }
function card(w, index = 0) { return `<article class="art-card"><div class="card-image tone-${index%4}"><button class="art-open" data-open="${esc(w.id)}" aria-label="Ver ${esc(w.title)}"><img src="${imageUrl(w,true)}" width="${w.width}" height="${w.height}" alt="${esc(w.title)}" loading="lazy" decoding="async"><span class="view-work">Contemplar la obra ↗</span></button>${favoriteButton(w)}</div><div class="card-caption"><div><span class="card-family">${esc(w.family)}</span><h3><button data-open="${esc(w.id)}">${esc(w.title)}</button></h3></div><span class="card-year">${yearLabel(w)}</span></div></article>`; }
function sectionHeading(kicker,title,link,label) {return `<div class="section-heading"><div><p class="eyebrow">${kicker}</p><h2>${title}</h2></div>${link?`<a class="text-link" href="${link}">${label} ${ARROW}</a>`:''}</div>`;}
function themeCard(family,index) { const group=catalog.works.filter(w=>w.family===family);const w=getWork(catalog.collectionCovers[family])||group.at(-1);return `<a href="${familyLink(family)}" class="theme-card"><div class="theme-image"><img src="${imageUrl(w,true)}" alt="${esc(w.title)}" loading="lazy" width="${w.width}" height="${w.height}"><span class="theme-index">${String(index+1).padStart(2,'0')}</span></div><div class="theme-caption"><div><h3>${esc(family)}</h3><span>${group.length} obras</span></div>${ARROW}</div></a>`;}

function home() {
  const hero = getWork(catalog.heroId);
  const featured = catalog.featuredIds.map(getWork).filter(Boolean);
  main.innerHTML = `<section class="hero page-width"><div class="hero-copy"><p class="eyebrow"><span class="small-dot"></span> EL UNIVERSO DE JAVIER COTELO VILLAREAL</p><h1>Una forma de<br>mirar <em>el mundo.</em></h1><p class="hero-description">Paisajes que invitan a detenerse.<br>Luz, agua y color que se quedan en la memoria.</p><a class="button button-dark" href="#coleccion">Explorar las acuarelas ${ARROW}</a><div class="hero-footnote"><span class="fine-line"></span><span>Un archivo para descubrir, conservar y compartir.</span></div></div><figure class="hero-art"><div class="hero-art-backdrop"></div><button class="hero-art-button" data-open="${esc(hero.id)}" aria-label="Ver ${esc(hero.title)}"><img src="${imageUrl(hero)}" width="${hero.width}" height="${hero.height}" alt="${esc(hero.title)}" fetchpriority="high"><span class="hero-expand" aria-hidden="true">↗</span></button><figcaption><span>${esc(hero.title)}</span><span>${yearLabel(hero)}</span></figcaption><span class="hero-side-label">ACUARELA · ARCHIVO PERSONAL</span></figure></section>
  <div class="intro-strip page-width"><span><span class="small-dot"></span> UNA COLECCIÓN, MUCHAS MIRADAS</span><p><strong>${catalog.works.length}</strong> obras para explorar</p><p><strong>${families.length}</strong> familias temáticas</p><p class="strip-years">${range()} <span>fechas del archivo</span></p></div>
  <section class="featured-section page-width">${sectionHeading('01 / UNA PRIMERA MIRADA','Pequeños lugares donde quedarse.','#coleccion','Ver toda la colección')}<div class="art-grid home-grid">${featured.map(card).join('')}</div><p class="editorial-note">Los títulos son descriptivos y las fechas, aproximadas. Cada ficha conserva los datos del archivo.</p></section>
  <section class="themes-section"><div class="page-width">${sectionHeading('02 / SEGUIR UN HILO','Cada motivo, un nuevo recorrido.','#recorridos','Todos los recorridos')}<div class="theme-grid">${['Campos y montañas','Lagos y reflejos','Bosques y jardines','Marinas y costas'].filter(f=>families.includes(f)).map(themeCard).join('')}</div></div></section>
  <section class="archive-teaser page-width"><div><p class="eyebrow">03 / EL ARCHIVO</p><h2>Una colección viva.<br><em>Una mirada que permanece.</em></h2></div><div><p>Este espacio reúne las acuarelas del archivo de Javier Cotelo Villareal. Un lugar para volver a las obras, descubrir sus detalles y encontrar relaciones entre ellas.</p><p>La selección de fotografías y la documentación siguen creciendo. Cada nueva revisión ayuda a contar mejor la historia de la colección.</p><a href="#archivo" class="text-link">Conocer el proyecto ${ARROW}</a></div></section>`;
}

function collection(isFavorites = false) {
  main.innerHTML = `<section class="collection-header page-width"><p class="eyebrow">${isFavorites?'TU PROPIO RECORRIDO':'EL ARCHIVO DE ACUARELAS'}</p><div class="collection-title"><h1>${isFavorites?'Las obras que <em>te acompañan.</em>':'La colección<span class="title-dot">.</span>'}</h1>${isFavorites?'<p>Una selección personal, guardada en este navegador.</p>':`<p>${catalog.works.length} obras. Infinitas formas de mirar.<br>Encuentra un paisaje, un motivo, un momento.</p>`}</div></section>
  <section class="collection-body page-width" aria-label="Explorar obras"><div class="collection-toolbar"><label class="search-field">${SEARCH}<input id="search" type="search" placeholder="Busca un paisaje, un título…" value="${esc(filters.query)}" aria-label="Buscar obras"><span class="search-shortcut">/</span></label><div class="select-field"><label for="family">Motivo</label><select id="family"><option value="">Todos los motivos</option>${families.map(f=>`<option ${f===filters.family?'selected':''} value="${esc(f)}">${esc(f)}</option>`).join('')}</select></div><div class="select-field year-select"><label for="year">Fecha aprox.</label><select id="year"><option value="">Todos los años</option>${[...new Set(catalog.works.map(w=>w.year).filter(Boolean))].sort().reverse().map(y=>`<option ${y===filters.year?'selected':''}>${esc(y)}</option>`).join('')}</select></div></div>
  <div class="quick-filters" aria-label="Motivos frecuentes">${['','Campos y montañas','Bosques y jardines','Lagos y reflejos','Paisajes de nieve','Vírgenes y maternidades'].filter(f=>!f||families.includes(f)).map(f=>`<button data-filter="${esc(f)}" aria-pressed="${filters.family===f}">${esc(f||'Todas las obras')}</button>`).join('')}</div>
  <div class="results-toolbar"><p id="results-count" role="status" aria-live="polite"></p><div><button id="clear-filters" class="subtle-button">Limpiar filtros</button><label class="sort-label">Ordenar por <select id="sort" aria-label="Ordenar obras"><option value="curated">Nuestra selección</option><option value="recent">Más recientes</option><option value="oldest">Más antiguas</option><option value="title">Título A–Z</option></select></label></div></div>
  <div id="gallery" class="art-grid"></div><div id="load-more-area" class="load-more-area"></div>
  <div class="collection-bottom"><p>Títulos descriptivos · Fechas aproximadas · Atribuciones en revisión</p><button id="export-data" class="text-link">Descargar datos de esta selección ↓</button></div></section>`;
  $('#sort').value = filters.sort;
  $('#search').addEventListener('input', e => {filters.query=e.target.value;changeFilters();});
  $('#family').addEventListener('change', e => {filters.family=e.target.value;changeFilters();});
  $('#year').addEventListener('change', e => {filters.year=e.target.value;changeFilters();});
  $('#sort').addEventListener('change', e => {filters.sort=e.target.value;changeFilters();});
  $('#clear-filters').addEventListener('click', resetFilters);
  $('#export-data').addEventListener('click', exportData);
  renderGallery();
}
function results() {return filterWorks(catalog.works,{...filters,featuredIds:catalog.featuredIds,favorites:routeName==='favoritas'?favorites:null});}
function renderGallery() {
  shown=results();
  $('#results-count').innerHTML = `<strong>${shown.length}</strong> ${shown.length===1?'obra':'obras'}${filters.family?' · '+esc(filters.family):''}`;
  $('#clear-filters').hidden = !filters.query&&!filters.family&&!filters.year&&filters.sort==='curated';
  const emptyFavorites = routeName==='favoritas'&&!favorites.size;
  $('#gallery').innerHTML = shown.length ? shown.slice(0,limit).map(card).join('') : `<div class="empty-state"><span class="empty-symbol">${emptyFavorites?HEART:SEARCH}</span><h2>${emptyFavorites?'Tu recorrido empieza con una obra.':'Ninguna obra por aquí, todavía.'}</h2><p>${emptyFavorites?'Guarda las acuarelas que te gusten pulsando el corazón. Las encontrarás juntas en este espacio.':'Prueba con otro título o amplía los filtros para seguir explorando.'}</p>${emptyFavorites?'<a class="button button-dark" href="#coleccion">Descubrir la colección →</a>':'<button class="button button-dark" data-reset>Ver todas las obras →</button>'}</div>`;
  $('#load-more-area').innerHTML = shown.length>limit?`<p>Has visto ${Math.min(limit,shown.length)} de ${shown.length} obras</p><button class="button button-outline" id="load-more">Seguir explorando <span>+</span></button>`:shown.length?`<p>${shown.length===1?'Una obra, muchos detalles.':'Has llegado al final de este recorrido.'}</p>`:'';
  $('#load-more')?.addEventListener('click',()=>{const previous=limit;limit+=24;renderGallery();$('#gallery').querySelectorAll('.art-open')[previous]?.focus({preventScroll:true});});
  $('#export-data').disabled = !shown.length;
  document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===filters.family)));
}
function changeFilters() {limit=24;$('#family').value=filters.family;updateURL();renderGallery();}
function resetFilters() {filters={query:'',family:'',year:'',sort:'curated'};$('#search').value='';$('#year').value='';$('#sort').value='curated';changeFilters();}
function updateURL(workId = currentWork?.id) {
  const p=new URLSearchParams();
  if(['coleccion','favoritas'].includes(routeName)) {
    if(filters.query)p.set('q',filters.query);if(filters.family)p.set('familia',filters.family);if(filters.year)p.set('ano',filters.year);if(filters.sort!=='curated')p.set('orden',filters.sort);
  }
  if(workId)p.set('obra',workId);
  history.replaceState(null,'',`#${routeName}${p.size?'?'+p:''}`);
}

function journeys() {
  main.innerHTML=`<section class="page-width journeys"><p class="eyebrow">DESCUBRIR POR AFINIDAD</p><div class="collection-title"><h1>Seguir <em>un hilo.</em></h1><p>El agua, los árboles, un rostro, la nieve.<br>Hay muchas puertas de entrada a la colección.</p></div><div class="journeys-grid">${families.map(themeCard).join('')}</div><section class="time-section"><p class="eyebrow">OTRA FORMA DE RECORRER EL ARCHIVO</p><h2>A través de los años.</h2><p>Fechas aproximadas, basadas en la primera fotografía de cada obra.</p><div class="year-grid">${[...new Set(catalog.works.map(w=>w.year).filter(Boolean))].sort().map(y=>`<a href="#coleccion?ano=${y}"><span>${y}</span><small>${catalog.works.filter(w=>w.year===y).length} obras ${ARROW}</small></a>`).join('')}</div></section></section>`;
}
function archive() {
  const work = getWork(catalog.collectionCovers['Bosques y jardines']) || catalog.works[0];
  main.innerHTML=`<section class="archive-page page-width"><div class="archive-intro"><div><p class="eyebrow">ACERCA DE ESTE PROYECTO</p><h1>Conservar las obras.<br><em>Compartir la mirada.</em></h1><p class="large-prose">Un archivo vivo de las acuarelas de Javier Cotelo Villareal, pensado para disfrutar de las imágenes y cuidar su memoria.</p><p>La colección nace de un trabajo de organización del archivo fotográfico: reunir las imágenes, relacionar las distintas tomas de una misma obra y preparar una selección que permita contemplarlas con calma.</p><p>Aquí conviven paisajes, arquitectura, retratos, maternidades y pequeños objetos. Los recorridos temáticos proponen conexiones entre las obras; no representan series nombradas por el autor.</p><a href="#coleccion" class="text-link">Entrar en la colección ${ARROW}</a></div><figure><img src="${imageUrl(work)}" alt="${esc(work.title)}" width="${work.width}" height="${work.height}"><figcaption>${esc(work.title)} · ${yearLabel(work)}</figcaption></figure></div>
  <div class="archive-facts"><div><strong>${catalog.works.length}</strong><span>obras seleccionadas</span></div><div><strong>${families.length}</strong><span>familias temáticas</span></div><div><strong>${range()}</strong><span>fechas de documentación</span></div></div>
  <section class="archive-method"><div><p class="eyebrow">LEER EL ARCHIVO</p><h2>Lo que sabemos.<br>Lo que queda por descubrir.</h2><p>La documentación está en revisión. Conservamos sus matices para que cada dato tenga su contexto.</p></div><div class="method-items"><details open><summary>Los títulos y las atribuciones <span>+</span></summary><p>Los títulos son propuestas descriptivas basadas en lo que se ve en las fotografías, salvo que una ficha indique lo contrario. La atribución a Javier Cotelo Villareal es provisional y está pendiente de validación documental.</p></details><details><summary>Las fechas de las obras <span>+</span></summary><p>Cuando no existe una fecha de pintura verificada, se utiliza la fotografía más antigua del grupo como aproximación. La obra puede ser anterior. La fecha de la toma elegida se conserva por separado en cada ficha.</p></details><details><summary>Las fotografías <span>+</span></summary><p>Las imágenes proceden de la selección actual del archivo. Los recortes existentes ajustan el encuadre y la perspectiva; no reconstruyen partes de las pinturas ni retocan sus colores. Esta web utiliza copias optimizadas y conserva la proporción completa de cada imagen seleccionada.</p></details><details><summary>Una colección que sigue creciendo <span>+</span></summary><p>La elección de fotografías, las agrupaciones y los datos pueden cambiar a medida que avance la revisión. Cada obra mantiene su identificador para poder relacionarla con el catálogo y conservar las selecciones personales.</p></details><details><summary>Tu selección y los datos <span>+</span></summary><p>Las favoritas se guardan en este navegador, sin crear una cuenta. Puedes descargar los datos de una selección en CSV o la ficha de una obra en JSON. Estos archivos reflejan la documentación disponible, incluida su condición provisional.</p></details></div></section></section>`;
}

function saveFavorite(id) {
  favorites.has(id)?favorites.delete(id):favorites.add(id);
  try {localStorage.setItem('jcv-favorites-v1',JSON.stringify([...favorites]));} catch {toast('Tu selección durará esta sesión: el navegador no permite guardarla.');}
  updateFavoriteUI();
  if(routeName==='favoritas')renderGallery();
}
function updateFavoriteUI() {
  $('#favorite-count').textContent=favorites.size;
  document.querySelectorAll('[data-favorite]').forEach(b=>{const w=getWork(b.dataset.favorite);const saved=favorites.has(w.id);b.classList.toggle('is-saved',saved);b.setAttribute('aria-pressed',String(saved));b.setAttribute('aria-label',`${saved?'Quitar de':'Añadir a'} favoritas: ${w.title}`);if(b.classList.contains('detail-save'))b.innerHTML=HEART+(saved?'Guardada en mi selección':'Guardar en mi selección');});
}
function detailSequence() {return ['coleccion','favoritas'].includes(routeName)&&shown.length?shown:filterWorks(catalog.works,{featuredIds:catalog.featuredIds});}
function openWork(id, {sync=true}={}) {
  const w=getWork(id);if(!w){toast('Esta obra ya no está en la selección actual.');return;}
  if(!dialog.open)returnFocus=document.activeElement;
  currentWork=w;const sequence=detailSequence();const index=sequence.findIndex(item=>item.id===w.id);
  $('#art-content').innerHTML=`<div class="detail-top"><a class="detail-brand" href="#inicio">jcv.</a><span>${esc(w.id)} <span class="detail-counter">/ ${index>=0?`${index+1} de ${sequence.length} obras`:'Archivo de acuarelas'}</span></span><button class="icon-button close-detail" aria-label="Cerrar ficha"><svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div><div class="detail-body"><div class="detail-art-panel"><div class="detail-image-stage"><button class="zoom-image" aria-label="Ampliar imagen" aria-pressed="false"><img src="${imageUrl(w)}" width="${w.width}" height="${w.height}" alt="${esc(w.title)}"></button></div><div class="image-tools"><button id="zoom-toggle" class="subtle-button">${SEARCH} Ampliar imagen</button><span>La obra, sin prisa.</span></div></div><div class="detail-info"><p class="eyebrow">${esc(w.family)}</p><h2 id="art-title">${esc(w.title)}</h2><p class="detail-title-note">${w.titleProposed?'Título descriptivo propuesto':'Título documentado'}</p><p class="detail-artist">Javier Cotelo Villareal <span>· ${esc(w.attribution==='provisional'?'Atribución provisional':w.attribution)}</span></p><dl><div><dt>Fecha de la obra</dt><dd>${w.verifiedDate?dateLabel(w.verifiedDate):dateLabel(w.date)+' <span>· aproximada</span>'}</dd></div><div><dt>Técnica aparente</dt><dd>${esc(w.technique)}</dd></div><div><dt>Recorrido</dt><dd><a href="${familyLink(w.family)}">${esc(w.family)} ↗</a></dd></div><div><dt>Referencia</dt><dd>${esc(w.id)}</dd></div></dl><button class="button button-outline detail-save" data-favorite="${esc(w.id)}" aria-pressed="${favorites.has(w.id)}">${HEART}${favorites.has(w.id)?'Guardada en mi selección':'Guardar en mi selección'}</button><div class="detail-actions"><button id="share-work">Copiar enlace ↗</button><button id="download-work">Descargar ficha ↓</button></div><details class="documentation"><summary>Documentación de esta obra <span>+</span></summary><p>${esc(w.dateCriteria)}</p><p><strong>Fotografía elegida:</strong> ${dateLabel(w.photoDate)}.<br><strong>Tomas documentadas:</strong> ${w.photoCount}.</p>${w.cycle?`<p><strong>Agrupación propuesta:</strong> ${esc(w.cycle)}.</p>`:''}${w.notes?`<p>${esc(w.notes)}</p>`:''}${w.limitation?`<p>${esc(w.limitation)}</p>`:''}</details></div></div><div class="detail-bottom"><button id="previous-work" ${sequence.length<2?'disabled':''}>← <span>Obra anterior</span></button><span>Una ventana al mundo de Javier</span><button id="next-work" ${sequence.length<2?'disabled':''}><span>Siguiente obra</span> →</button></div>`;
  $('.close-detail').addEventListener('click',closeWork);
  $('#zoom-toggle').addEventListener('click',toggleZoom);
  $('.zoom-image').addEventListener('click',toggleZoom);
  $('#previous-work').addEventListener('click',()=>stepWork(-1));$('#next-work').addEventListener('click',()=>stepWork(1));
  $('#share-work').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);toast('Enlace de la obra copiado.');}catch{toast('Copia el enlace de la barra de direcciones para compartir esta obra.');}});
  $('#download-work').addEventListener('click',()=>download(JSON.stringify({artist:catalog.artist,...w},null,2),`${w.id}.json`,'application/json'));
  if(!dialog.open){dialog.showModal();document.body.classList.add('modal-open');}
  $('.close-detail').focus({preventScroll:true});dialog.scrollTop=0;
  if(sync)updateURL(w.id);
}
function toggleZoom() {const stage=$('.detail-image-stage');const zoom=stage.classList.toggle('is-zoomed');$('.zoom-image').setAttribute('aria-pressed',String(zoom));$('.zoom-image').setAttribute('aria-label',zoom?'Reducir imagen':'Ampliar imagen');$('#zoom-toggle').innerHTML=SEARCH+(zoom?' Ver imagen completa':' Ampliar imagen');}
function stepWork(direction) {const seq=detailSequence();let i=seq.findIndex(w=>w.id===currentWork.id);openWork(seq[(i+direction+seq.length)%seq.length].id);}
function closeWork() {dialog.close();currentWork=null;document.body.classList.remove('modal-open');updateURL(null);if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});}
dialog.addEventListener('cancel',e=>{e.preventDefault();closeWork();});
function download(content,filename,type) {const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function exportData() {
  const columns=[['id','Referencia'],['title','Título descriptivo'],['family','Familia'],['date','Fecha estimada'],['verifiedDate','Fecha verificada'],['photoDate','Fecha de fotografía'],['technique','Técnica aparente'],['attribution','Atribución'],['titleProposed','Título propuesto'],['dateCriteria','Criterio de fecha']];
  const cell = val => '"'+String(val??'').replace(/^[=+\-@]/,"'$&").replaceAll('"','""')+'"';
  const csv='\uFEFF'+[columns.map(c=>cell(c[1])).join(';'),...results().map(w=>columns.map(c=>cell(w[c[0]])).join(';'))].join('\r\n');
  download(csv,'javier-cotelo-seleccion.csv','text/csv;charset=utf-8');toast('Datos de la selección descargados.');
}

function renderRoute({scroll=true}={}) {
  const [route,query='']=location.hash.slice(1).split('?');const p=new URLSearchParams(query);
  routeName=['inicio','coleccion','recorridos','archivo','favoritas'].includes(route)?route:'inicio';
  filters={query:p.get('q')||'',family:p.get('familia')||'',year:p.get('ano')||'',sort:['curated','recent','oldest','title'].includes(p.get('orden'))?p.get('orden'):'curated'};limit=24;
  if(dialog.open){dialog.close();document.body.classList.remove('modal-open');}currentWork=null;
  document.querySelectorAll('[data-nav]').forEach(a=>{if(a.dataset.nav===routeName)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  const titles={inicio:'Acuarelas',coleccion:'La colección',recorridos:'Recorridos',archivo:'El archivo',favoritas:'Mi selección'};
  document.title=`${titles[routeName]} · Javier Cotelo Villareal`;
  if(routeName==='inicio')home();else if(routeName==='coleccion'||routeName==='favoritas')collection(routeName==='favoritas');else if(routeName==='recorridos')journeys();else archive();
  if(scroll)window.scrollTo({top:0,behavior:'instant'});
  if(p.has('obra'))openWork(p.get('obra'),{sync:false});
}
document.addEventListener('click',event=>{
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
window.addEventListener('storage',event=>{if(event.key==='jcv-favorites-v1'&&catalog){favorites=parseFavorites(event.newValue,new Set(catalog.works.map(w=>w.id)));updateFavoriteUI();if(routeName==='favoritas')renderGallery();}});
document.addEventListener('error',event=>{if(event.target instanceof HTMLImageElement){event.target.classList.add('image-unavailable');event.target.alt='Imagen temporalmente no disponible';}},true);
async function init() {
  try {
    const response=await fetch('./catalog.json');if(!response.ok)throw new Error('Catálogo no disponible');catalog=await response.json();
    if(!Array.isArray(catalog.works)||!catalog.works.length)throw new Error('Catálogo vacío');
    let raw='[]';try{raw=localStorage.getItem('jcv-favorites-v1');}catch{}
    favorites=parseFavorites(raw,new Set(catalog.works.map(w=>w.id)));
    families=[...new Set(catalog.works.map(w=>w.family))].sort((a,b)=>catalog.works.filter(w=>w.family===b).length-catalog.works.filter(w=>w.family===a).length);
    updateFavoriteUI();renderRoute({scroll:false});
  }catch(error){main.innerHTML='<section class="empty-state"><h1>El cuaderno no se ha podido abrir.</h1><p>No hemos podido cargar la colección. Vuelve a intentarlo en un momento.</p><button class="button button-dark" id="retry">Volver a intentar</button></section>';$('#retry').addEventListener('click',init);console.error(error);}
}
init();
