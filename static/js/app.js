const IMG = '/static/img/';
const state = {
  data: null,
  view: 'splash',
  role: localStorage.getItem('redRoleV7') || 'talent',
  region: localStorage.getItem('redRegionV7') || 'Todas las regiones',
  category: 'Todas',
  search: '',
  selectedProject: null,
  selectedTalent: 'muriel',
  selectedService: null,
  messageId: 'conv-1',
  history: [],
  applications: JSON.parse(localStorage.getItem('redApplicationsV7') || '[]'),
  customProjects: JSON.parse(localStorage.getItem('redCustomProjectsV7') || '[]'),
  serviceRequests: JSON.parse(localStorage.getItem('redServicesV7') || '[]'),
  reports: JSON.parse(localStorage.getItem('redReportsV7') || '[]'),
  planTab: 'professional',
  qrUrl: ''
};

const app = document.getElementById('app');
const toastEl = document.getElementById('toast');
const modalEl = document.getElementById('modal');

function esc(value = '') {
  return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}
function save(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
function toast(msg){ toastEl.textContent=msg; toastEl.classList.add('show'); clearTimeout(toast.timer); toast.timer=setTimeout(()=>toastEl.classList.remove('show'),2600); }
function media(name, alt=''){ return `<img src="${IMG}${name}" alt="${esc(alt)}" loading="lazy">`; }
function allProjects(){ return [...state.customProjects, ...state.data.projects]; }
function projectById(id){ return allProjects().find(p=>p.id===id) || allProjects()[0] || state.data.projects[0]; }
function talentById(id){ return state.data.talents.find(t=>t.id===id) || state.data.talents.find(t=>t.id==='muriel') || state.data.talents[0]; }
function serviceById(id){ return state.data.services.find(s=>s.id===id) || state.data.services[0]; }
function roleLabel(){ return state.role === 'talent' ? 'Profesional creativo' : 'Marca / Proyecto'; }

async function boot(){
  const res = await fetch('/api/bootstrap');
  state.data = await res.json();
  navigate('splash', {}, false);
}
function navigate(view, params={}, push=true){
  if (push && state.view !== view) state.history.push(state.view);
  state.view=view; Object.assign(state, params); render(); scrollTop();
}
function back(){
  const last = state.history.pop();
  if (last) { state.view=last; render(); scrollTop(); return; }
  if (state.view !== 'home') navigate('home',{},false); else navigate('role',{},false);
}
function scrollTop(){ const shell=document.getElementById('phoneShell'); if(shell) shell.scrollTo({top:0, behavior:'smooth'}); window.scrollTo({top:0, behavior:'smooth'}); }
function setRole(role){ state.role=role; localStorage.setItem('redRoleV7', role); toast(role==='talent'?'Ingresaste como profesional creativo.':'Ingresaste como marca o proyecto.'); navigate('home'); }
function setRegion(region){ state.region=region; localStorage.setItem('redRegionV7',region); render(); }
function closeModal(){ modalEl.classList.remove('show'); modalEl.innerHTML=''; modalEl.setAttribute('aria-hidden','true'); }
function openImage(src,label='Portafolio'){
  modalEl.innerHTML = `<div class="modal-card image-modal"><div class="modal-head"><h2>${esc(label)}</h2><button class="icon-btn" onclick="closeModal()">×</button></div><img src="${IMG}${src}" alt="${esc(label)}"><button class="btn full" onclick="closeModal()">Cerrar</button></div>`;
  modalEl.classList.add('show'); modalEl.setAttribute('aria-hidden','false');
}
modalEl.addEventListener('click', e => { if(e.target === modalEl) closeModal(); });

function render(){
  const map={splash, role, home, explore, projectDetail, apply, applications, match, messages, chat, profile, publish, services, serviceDetail, plans, security, qr, portfolioExamples};
  (map[state.view]||home)();
}
function layout(content,{nav=true,top=true,title='',subtitle='',backButton=false,dark=false}={}){
  app.innerHTML = `<main class="screen ${nav?'':'no-nav'} ${dark?'dark-mode':''}">${top?topbar(title,subtitle,backButton):''}${content}</main>${nav?bottomNav():''}`;
}
function topbar(title='',subtitle='',backButton=false){
  return `<header class="topbar"><div class="top-row">${backButton?`<button class="icon-btn" onclick="back()">←</button>`:`<button class="icon-btn" onclick="navigate('role')">↺</button>`}<img class="brand-logo" src="${IMG}final/logo.png" alt="RED ATÍPICA"><div class="top-actions"><button class="icon-btn" onclick="navigate('qr')">▦</button><button class="icon-btn" onclick="navigate('plans')">★</button></div></div>${title?`<div class="page-title"><span>${esc(subtitle)}</span><strong>${esc(title)}</strong></div>`:''}</header>`;
}
function bottomNav(){
  const mid = state.role==='brand' ? ['publish','＋','Publicar'] : ['applications','▣','Postulaciones'];
  const items=[['home','⌂','Inicio'],['explore','⌕','Explorar'],mid,['messages','☏','Mensajes'],['profile','◉','Perfil']];
  return `<nav class="bottom-nav">${items.map(([v,i,l])=>`<button class="nav-item ${state.view===v?'active':''}" onclick="navigate('${v}')"><span>${i}</span><small>${l}</small></button>`).join('')}</nav>`;
}

function regionSelect(extra=''){
  return `<label class="region-filter ${extra}"><span>Filtro por región</span><select onchange="setRegion(this.value)">${state.data.regions.map(r=>`<option value="${esc(r)}" ${state.region===r?'selected':''}>${esc(r)}</option>`).join('')}</select></label>`;
}
function matchesRegion(item){ return state.region==='Todas las regiones' || item.region===state.region || item.location?.includes(state.region) || item.city?.includes(state.region); }
function filterItems(items){
  const q=state.search.trim().toLowerCase();
  return items.filter(it => matchesRegion(it)).filter(it => !q || JSON.stringify(it).toLowerCase().includes(q)).filter(it => state.category==='Todas' || JSON.stringify(it).toLowerCase().includes(state.category.toLowerCase()));
}
function categoryIcon(label){
  const map={
    'Modelo':'👤','Modelos':'👤','Actores':'🎭','Actor':'🎭','Fotógrafos':'📷','Fotógrafo':'📷','Fotografía':'📷',
    'Maquilladores':'💄','Maquillador':'💄','Maquillaje':'💄','Stylists':'👗','Stylist':'👗','Diseñadores':'✂️','Diseñador':'✂️',
    'Productores':'🎬','Proyecto':'▣','Casting':'✦','Colaboración':'🤝','Más':'•••','Todas':'⌕'
  };
  return map[label] || '✦';
}
function categoryButton(label){
  return `<button class="category-btn" onclick="state.category='${label==='Más'?'Todas':label}'; navigate('explore')"><span>${categoryIcon(label)}</span><small>${esc(label)}</small></button>`;
}

function splash(){
  const b=state.data.brand;
  layout(`<section class="splash-screen"><div class="splash-card"><img src="${IMG}final/logo-white.png" alt="RED ATÍPICA"><h1>${esc(b.tagline)}</h1><p>${esc(b.pitch)}</p><button class="btn light full" onclick="navigate('role')">Ingresar</button><button class="btn ghost full" onclick="navigate('home')">Explorar aplicación</button></div></section>`,{nav:false,top:false});
}
function role(){
  layout(`<section class="section-title"><span>Antes de entrar</span><h1>¿Cómo quieres usar RED ATÍPICA?</h1><p>El flujo cambia según seas talento creativo o marca que necesita publicar proyectos.</p></section><div class="role-grid"><button class="role-card" onclick="setRole('talent')"><b>◎</b><h2>Soy profesional creativo</h2><p>Quiero crear perfil, mostrar portafolio, postular a proyectos y conectar con marcas.</p></button><button class="role-card" onclick="setRole('brand')"><b>▣</b><h2>Soy marca o proyecto</h2><p>Quiero publicar oportunidades, revisar postulaciones y encontrar talento por región.</p></button></div><button class="btn outline full mt" onclick="back()">Volver</button>`,{nav:false,title:'Seleccionar perfil',subtitle:'Ingreso',backButton:true});
}
function home(){
  const h=state.data.homeImages;
  const projects=filterItems(allProjects()).slice(0,8);
  const talents=filterItems(state.data.talents).slice(0,8);
  layout(`<section class="home-hero"><div class="hero-side" style="background-image:linear-gradient(180deg,rgba(0,0,0,.16),rgba(0,0,0,.72)),url('${IMG}${h.heroLeft}')"><div><img src="${IMG}final/logo.png" alt="RED ATÍPICA"><h1>Conectamos talento creativo con oportunidades reales.</h1><p>RED ATÍPICA es la comunidad donde talentos y proyectos se encuentran para colaborar y crear juntos.</p><div class="hero-actions"><button class="btn light small" onclick="navigate('explore')">Explorar proyectos</button><button class="btn ghost small" onclick="navigate('publish')">Publicar proyecto</button></div></div></div><div class="hero-side second" style="background-image:url('${IMG}${h.heroRight}')"></div></section>
  <section class="search-panel"><input oninput="state.search=this.value; render()" value="${esc(state.search)}" placeholder="Busca proyectos, castings, personas o marcas..."><div class="filter-row"><span>📍 ${esc(state.region)}</span><button class="filter-button" onclick="navigate('explore')">☰ Filtros</button></div>${regionSelect('compact')}</section>
  <section class="categories"><div class="section-head"><h2>Explorar por categoría</h2><button onclick="navigate('explore')">Ver todas</button></div><div class="category-row">${['Modelo','Actores','Fotógrafos','Maquilladores','Stylists','Diseñadores','Productores','Más'].map(categoryButton).join('')}</div></section>
  <section><div class="section-head"><h2>Proyectos destacados</h2><button onclick="navigate('explore')">Ver todos</button></div><div class="project-strip">${projects.map(projectMini).join('')}</div></section>
  <section><div class="section-head"><h2>Talentos destacados</h2><button onclick="navigate('explore',{category:'Todas'})">Ver todos</button></div><div class="talent-row">${talents.map(talentBubble).join('')}</div></section>
  <section><div class="section-head"><h2>Servicios RED ATÍPICA</h2><button onclick="navigate('services')">Ver todos</button></div><div class="home-service-grid">${state.data.services.slice(0,3).map(s=>`<button onclick="navigate('serviceDetail',{selectedService:'${s.id}'})"><img src="${IMG}${s.image}"><span>${esc(s.name)}</span><small>${esc(s.price)}</small></button>`).join('')}</div></section><section class="home-security-card"><div><span>Comunidad segura</span><h2>Sistema de sanciones y seguridad</h2><p>Reportes, evaluación, sanciones graduales y protección para talentos, marcas y proyectos.</p></div><button class="btn outline small" onclick="navigate('security')">Ver seguridad</button></section><section class="black-banner"><h2>Sé parte de la comunidad creativa que está transformando la industria.</h2><div><span>Conecta con talentos y marcas</span><span>Crea tu portafolio y destaca</span><span>Encuentra y publica proyectos</span><span>Colabora, crea y crece</span></div><button class="btn light small" onclick="navigate('role')">Únete ahora</button></section>`,{nav:true});
}
function projectMini(p){ return `<button class="project-mini" onclick="navigate('projectDetail',{selectedProject:'${p.id}'})"><img src="${IMG}${p.image}" alt="${esc(p.title)}"><div><span>${esc(p.type)}</span><h3>${esc(p.title)}</h3><p>${esc(p.summary)}</p><small>📍 ${esc(p.location)} · ${esc(p.date)}</small></div></button>`; }
function talentBubble(t){ return `<button class="talent-bubble" onclick="navigate('profile',{selectedTalent:'${t.id}'})"><img src="${IMG}${t.avatar}" alt="${esc(t.name)}"><strong>${esc(t.name)}</strong><small>${esc(t.profession)}<br>📍 ${esc(t.city)}</small></button>`; }

function explore(){
  const projects=filterItems(allProjects());
  const talents=filterItems(state.data.talents);
  layout(`<section class="section-title"><span>Búsqueda avanzada</span><h1>Explorar por profesión y región</h1><p>Este filtro por región es parte central de la aplicación y permite descentralizar oportunidades.</p></section><div class="search-panel sticky-search"><input oninput="state.search=this.value; render()" value="${esc(state.search)}" placeholder="Buscar por proyecto, talento, marca o ciudad...">${regionSelect()}<div class="chips">${['Todas','Modelo','Fotógrafo','Maquillador','Stylist','Actor','Diseñador','Proyecto','Casting','Colaboración'].map(c=>`<button class="chip ${state.category===c?'on':''}" onclick="state.category='${c}'; render()">${c}</button>`).join('')}</div></div><div class="tabs-info"><b>${projects.length}</b> proyectos encontrados · <b>${talents.length}</b> talentos encontrados</div><section><h2>Proyectos</h2><div class="card-list">${projects.map(projectCard).join('')||empty('No hay proyectos para esa región o filtro.')}</div></section><section><h2>Talentos</h2><div class="card-list">${talents.map(talentCard).join('')||empty('No hay talentos para esa región o filtro.')}</div></section>`,{nav:true,title:'Explorar',subtitle:'Filtro por región',backButton:true});
}
function empty(text){ return `<div class="empty">${esc(text)}</div>`; }
function projectCard(p){ return `<article class="project-card"><img src="${IMG}${p.image}" alt="${esc(p.title)}"><div><div class="card-top"><span class="pill">${esc(p.type)}</span><b>${p.compatibility}%</b></div><h3>${esc(p.title)}</h3><p>${esc(p.summary)}</p><div class="meta">📍 ${esc(p.location)} · ${esc(p.date)} · ${esc(p.budget)}</div><div class="actions"><button class="btn outline" onclick="navigate('projectDetail',{selectedProject:'${p.id}'})">Ver detalle</button><button class="btn" onclick="navigate('apply',{selectedProject:'${p.id}'})">Postular</button></div></div></article>`; }
function talentCard(t){ return `<article class="talent-card"><img src="${IMG}${t.avatar}" alt="${esc(t.name)}"><div><div class="card-top"><h3>${esc(t.name)}</h3><span class="pill purple">★ ${esc(t.rating)}</span></div><p>${esc(t.profession)} · ${esc(t.city)}</p><div class="chips small-chips">${t.skills.map(s=>`<span>${esc(s)}</span>`).join('')}</div><button class="btn outline small" onclick="navigate('profile',{selectedTalent:'${t.id}'})">Ver perfil</button></div></article>`; }

function projectDetail(){
  const p=projectById(state.selectedProject);
  layout(`<section class="project-detail"><div class="carousel"><img src="${IMG}${p.hero}" alt="${esc(p.title)}"><div class="dots"><span></span><span class="on"></span><span></span></div></div><h1>Marca: ${esc(p.brand)} – ${esc(p.title)}</h1><div class="detail-pills"><div><span>Ubicación</span><b>${esc(p.location)}</b></div><div><span>Fecha</span><b>${esc(p.date)}</b></div><div><span>Duración</span><b>${esc(p.duration)}</b></div></div><div class="copy-block"><p><b>Descripción del proyecto:</b><br>${esc(p.description)}</p><h3>Talentos que se necesitan</h3><div class="chips">${p.roles.map(r=>`<span>${esc(r)}</span>`).join('')}</div><h3>Requisitos</h3><ul>${p.requirements.map(r=>`<li>${esc(r)}</li>`).join('')}</ul><h3>Beneficios / Pago</h3><ul>${p.benefits.map(b=>`<li>${esc(b)}</li>`).join('')}</ul><p><b>Presupuesto:</b> ${esc(p.budget)}</p></div></section><div class="sticky-cta"><button class="btn full cta" onclick="navigate('apply',{selectedProject:'${p.id}'})">POSTULAR</button></div>`,{nav:true,title:'Proyecto',subtitle:p.type,backButton:true});
}
function apply(){
  const p=projectById(state.selectedProject);
  layout(`<section class="apply-head"><h1>Postula a Redatípica</h1><p>Completa el formulario para ser parte de nuestra comunidad y postular a <b>${esc(p.title)}</b>.</p><div class="stepper"><span class="on">1</span><i></i><span>2</span><i></i><span>3</span><i></i><span>4</span><i></i><span>5</span></div></section><form class="apply-grid" onsubmit="submitApplication(event,'${p.id}')"><main><h2>1. Información personal</h2><label>¿Qué describe mejor tu perfil?</label><div class="profile-options">${['Modelo','Actriz/Actor','Fotografía','Stylist','Dirección de arte','Maquillaje','Otro'].map(v=>`<button type="button">${v}</button>`).join('')}</div><div class="two"><field><label>Nombre completo</label><input name="name" required value="Muriel Galindo"></field><field><label>Nombre artístico</label><input name="alias" value="Muriel"></field></div><div class="two"><field><label>Fecha de nacimiento</label><input name="birth" type="date"></field><field><label>Nacionalidad</label><input name="nationality" value="Chilena"></field></div><div class="two"><field><label>Correo electrónico</label><input name="email" type="email" value="hola@correo.cl"></field><field><label>Teléfono / WhatsApp</label><input name="phone" value="+56 9 1234 5678"></field></div><div class="two"><field><label>Ciudad / región</label><select name="region">${state.data.regions.slice(1).map(r=>`<option ${r===p.region?'selected':''}>${esc(r)}</option>`).join('')}</select></field><field><label>Instagram</label><input name="instagram" value="@muriel_miranda"></field></div><h2>2. Información profesional</h2><field><label>Descripción de tu perfil</label><textarea name="message">Hola, me interesa postular a este proyecto. Tengo experiencia, disponibilidad y portafolio actualizado dentro de RED ATÍPICA.</textarea></field><div class="two"><field><label>¿Cuánto tiempo llevas en tu área?</label><select><option>3 años</option><option>Menos de 1 año</option><option>Más de 5 años</option></select></field><field><label>¿Cuentas con equipo propio?</label><select><option>Sí</option><option>No</option><option>Parcialmente</option></select></field></div><field><label>Disponibilidad para proyectos</label><div class="inline-options"><span>Inmediata</span><span>1 a 2 semanas</span><span>3 semanas</span><span>Fines de semana</span></div></field><h2>3. Experiencia</h2><field><label>Cuéntanos sobre tu experiencia</label><textarea name="experience">He participado en campañas editoriales, sesiones fotográficas y contenido para redes sociales.</textarea></field><button class="btn full cta" type="submit">Continuar</button></main><aside><div class="side-card"><h3>Sobre REDATÍPICA</h3><p>Somos una comunidad creativa diseñada para conectar talentos con oportunidades reales dentro de la industria artística, audiovisual y de moda en Chile.</p></div><div class="side-card"><h3>Documentos a adjuntar</h3><ul><li>Foto de rostro</li><li>Foto de cuerpo entero</li><li>Portafolio / book</li><li>CV o presentación personal</li><li>Trabajos o proyectos previos</li></ul><button type="button" class="upload">Subir archivos</button></div><div class="side-card"><h3>¿Dudas?</h3><p>${esc(state.data.contact.email)}<br>${esc(state.data.contact.instagram)}</p></div></aside></form>`,{nav:true,title:'Formulario',subtitle:'Postulación',backButton:true});
}
function submitApplication(ev, projectId){
  ev.preventDefault(); const fd=new FormData(ev.currentTarget); const p=projectById(projectId);
  const item={id:`app-${Date.now()}`, projectId, title:p.title, brand:p.brand, region:p.region, location:p.location, date:new Date().toLocaleString('es-CL'), status:'Enviada', message:fd.get('message')||'', image:p.image};
  state.applications.unshift(item); save('redApplicationsV7', state.applications); toast('Postulación enviada y guardada.'); navigate('match',{selectedProject:projectId});
}
function applications(){
  const sent = state.applications || [];
  layout(`<section class="section-title"><span>Postulaciones</span><h1>Postulaciones enviadas</h1><p>Cada postulación enviada desde RED ATÍPICA queda guardada en tu historial para revisarla después.</p></section>
  <div class="app-summary"><div><b>${sent.length}</b><span>Enviadas</span></div><div><b>${sent.filter(x=>x.status==='Enviada').length}</b><span>En revisión</span></div><div><b>${state.region==='Todas las regiones'?'Chile':esc(state.region)}</b><span>Región activa</span></div></div>
  <div class="app-tabs"><button class="active">Enviadas</button><button onclick="toast('Vista de recibidas disponible para marcas y productoras.')">Recibidas</button></div>
  <div class="card-list">${sent.length?sent.map(appCard).join(''):empty('Aún no has enviado postulaciones. Entra a un proyecto y presiona POSTULAR para que aparezca aquí.')}</div>
  <section class="received-panel"><h2>Postulaciones recibidas por marcas</h2><article class="dark-card"><h3>Campaña Verano 2025</h3><p>NÓMADE · Activa · 12 postulaciones recibidas</p><div class="match-row"><img src="${IMG}pdf/p01_17.png"><div><b>Antonia R.</b><span>Fotógrafa · Match confirmado</span></div><button onclick="navigate('match',{selectedProject:'editorial-moda'})">MATCH</button></div><button class="btn outline full" onclick="navigate('messages')">Abrir conversación</button></article></section>`,{nav:true,title:'Postulaciones',subtitle:'Historial',backButton:true});
}
function appCard(a){ return `<article class="application-card saved-application"><img src="${IMG}${a.image}"><div><span class="pill green">${esc(a.status)}</span><h3>${esc(a.title)}</h3><p><b>${esc(a.brand)}</b> · ${esc(a.location || a.region)}<br>${esc(a.date)}</p>${a.message?`<blockquote>${esc(a.message)}</blockquote>`:''}<div class="app-actions"><button class="btn outline small" onclick="navigate('projectDetail',{selectedProject:'${a.projectId}'})">Ver proyecto</button><button class="btn small" onclick="navigate('chat')">Mensaje</button></div></div></article>`; }


function match(){
  const p = projectById(state.selectedProject || 'editorial-moda');
  const talent = talentById('muriel');
  layout(`<section class="match-screen">
    <img class="match-logo" src="${IMG}final/logo.png" alt="RED ATÍPICA">
    <div class="match-orb">♡</div>
    <h1>¡Es un match!</h1>
    <p>A ${esc(p.brand).toUpperCase()} y a ${esc(talent.name.split(' ')[0])} les interesa trabajar juntos. Ya pueden comenzar a conversar.</p>
    <div class="match-pair">
      <div><img src="${IMG}${p.image || p.hero}" alt="${esc(p.brand)}"><b>${esc(p.brand).toUpperCase()}</b><span>Marca / Proyecto</span></div>
      <i>❤</i>
      <div><img src="${IMG}${talent.avatar || talent.photo}" alt="${esc(talent.name)}"><b>${esc(talent.name)}</b><span>${esc(talent.profession)}</span></div>
    </div>
    <button class="btn full cta" onclick="navigate('chat')">Ir a mensajes</button>
    <button class="btn outline full mt" onclick="navigate('projectDetail',{selectedProject:'${p.id}'})">Ver proyecto</button>
    <button class="text-link" onclick="navigate('applications')">Ver postulaciones</button>
  </section>`, {nav:false, top:false, dark:true});
}

function messages(){
  layout(`<section class="section-title"><span>Mensajería</span><h1>Conversaciones</h1><p>La coordinación ocurre dentro de la plataforma, evitando depender solo de redes externas.</p></section><div class="message-list"><button onclick="navigate('chat')"><img src="${IMG}pdf/p01_06.png"><div><h3>Nómade Studio</h3><p>Vimos tu postulación. Nos gustó mucho tu portafolio y queremos coordinar detalles del proyecto.</p></div></button><button onclick="navigate('chat')"><img src="${IMG}pdf/p01_08.png"><div><h3>Marca de Bebidas</h3><p>Tenemos una campaña audiovisual para la próxima semana y tu perfil calza con el casting.</p></div></button></div>`,{nav:true});
}
function chat(){
  layout(`<section class="chat-screen"><div class="chat-alert"><b>Match confirmado</b><span>¡Ya pueden comenzar a trabajar juntos!</span></div><div class="chat-about"><h3>Sobre el proyecto</h3><p>Buscamos fotografías para nuestra campaña. Estilo natural, luminoso y auténtico.</p></div><div class="chat-bubbles"><div class="bubble brand">¡Hola! Nos encantó tu trabajo, creemos que eres perfecta para este proyecto. ¿Te gustaría contarnos más sobre tu disponibilidad?<small>11:30</small></div><div class="bubble me">¡Hola! Qué bueno saberlo, estoy muy interesada. ¿Cuáles son los siguientes pasos?<small>11:32 ✓✓</small></div><div class="bubble brand">Genial, te enviaremos más detalles del proyecto y coordinamos una reunión.<small>11:33</small></div></div><form class="composer" onsubmit="sendMessage(event)"><input name="text" placeholder="Escribe un mensaje..."><button>➤</button></form></section>`,{nav:true,title:'Campaña Verano 2025',subtitle:'NÓMADE',backButton:true,dark:true});
}
function sendMessage(ev){ ev.preventDefault(); const val=ev.currentTarget.text.value.trim(); if(val){ toast('Mensaje enviado.'); ev.currentTarget.reset(); } }
function profile(){
  const t=talentById(state.selectedTalent || 'muriel');
  const details=t.details||{};
  const entries=Object.entries(details);
  const portfolio=t.portfolio||[];
  layout(`<section class="profile-screen"><div class="profile-head"><img class="profile-main" src="${IMG}${t.avatar||t.photo}" alt="${esc(t.name)}"><div><h1>${esc(t.name)}</h1><p>${esc(t.profession)}</p><span>📍 ${esc(t.city)}, Chile</span><div class="chips"><span>★ ${esc(t.rating)}</span><span>Perfil verificado</span></div><p>${esc(t.bio)}</p></div></div>${entries.length?`<div class="profile-stats">${entries.map(([k,v])=>`<div><b>${esc(v)}</b><small>${esc(k)}</small></div>`).join('')}</div>`:''}<div class="profile-tabs"><b>Portafolio</b><b>Experiencia</b><b>Información</b><b>Calificaciones</b></div><section><h2>Portafolio</h2><div class="portfolio-grid clean-portfolio">${portfolio.map((im)=>`<button onclick="openImage('${im}','Trabajo de ${esc(t.name)}')"><img src="${IMG}${im}" alt="Trabajo de ${esc(t.name)}"></button>`).join('')}</div></section><section class="two-panels"><div><h2>Acerca de mí</h2><p>${esc(t.about)}</p></div><div><h2>Información</h2><p>Región: ${esc(t.region || t.city)}<br>Disponibilidad: ${esc(details.disponibilidad||'Inmediata')}<br>Idiomas: Español/Inglés<br>Redes: @${esc(t.name.toLowerCase().replaceAll(' ','_').replaceAll('.',''))}</p></div></section><section><h2>Calificaciones</h2><article class="rating-only"><strong>${esc(t.rating)}</strong><span>★★★★★</span><small>Calificación general</small></article></section></section>`,{nav:true,title:'Perfil',subtitle:'Talento',backButton:true});
}
function portfolioExamples(){
  layout(`<section class="section-title"><span>Portafolio</span><h1>Portafolios destacados</h1><p>Books y referencias profesionales de fotografía, dirección creativa y trabajos destacados dentro de la comunidad.</p></section><div class="portfolio-examples">${state.data.portfolioExamples.map((im,i)=>`<button onclick="openImage('${im}','Portafolio destacado')"><img src="${IMG}${im}"></button>`).join('')}</div>`,{nav:true,title:'Portafolio',subtitle:'Destacados',backButton:true});
}
function publish(){
  layout(`<section class="section-title"><span>Marcas y proyectos</span><h1>Publicar proyecto</h1><p>Crea una oportunidad y permite que RED ATÍPICA recomiende talentos compatibles.</p></section><form class="form-card" onsubmit="publishProject(event)"><field><label>Título</label><input name="title" required value="Campaña cápsula verano"></field><div class="two"><field><label>Marca</label><input name="brand" required value="Atípica Studio"></field><field><label>Región</label><select name="region">${state.data.regions.slice(1).map(r=>`<option>${esc(r)}</option>`).join('')}</select></field></div><div class="two"><field><label>Tipo</label><select name="type"><option>CASTING</option><option>PROYECTO</option><option>COLABORACIÓN</option></select></field><field><label>Presupuesto</label><input name="budget" value="$70.000 por jornada"></field></div><field><label>Talentos buscados</label><input name="roles" value="Modelo, Fotógrafo, Maquillador(a)"></field><field><label>Descripción</label><textarea name="description">Campaña visual para redes sociales con estética editorial y colaborativa.</textarea></field><button class="btn full cta">Publicar proyecto</button></form>`,{nav:true,title:'Publicar',subtitle:'Marca',backButton:true});
}
function publishProject(ev){ ev.preventDefault(); const f=new FormData(ev.currentTarget); const p={id:`custom-${Date.now()}`,type:f.get('type'),title:f.get('title'),brand:f.get('brand'),location:f.get('region'),city:f.get('region'),region:f.get('region'),date:'Por coordinar',duration:'1 jornada',budget:f.get('budget'),image:'pdf/p01_03.png',hero:'pdf/p01_03.png',summary:f.get('description'),description:f.get('description'),roles:String(f.get('roles')).split(',').map(x=>x.trim()),requirements:['Portafolio actualizado','Disponibilidad confirmada','Compromiso con el proyecto'],benefits:['Publicación activa en RED ATÍPICA','Recepción de postulaciones','Match con talentos compatibles'],compatibility:90}; state.customProjects.unshift(p); save('redCustomProjectsV7',state.customProjects); toast('Proyecto publicado y guardado.'); navigate('projectDetail',{selectedProject:p.id}); }
function services(){
  layout(`<section class="section-title"><span>Servicios RED ATÍPICA</span><h1>Servicios creativos y profesionales</h1><p>${esc(state.data.notes.services)}</p></section><section class="service-intro"><div class="service-collage"><img src="${IMG}final/service-directors.png"><img src="${IMG}final/service-photographer.png"><img src="${IMG}final/service-production.png"></div><p>Potenciamos talento, marcas y proyectos mediante acompañamiento creativo, producción profesional y soluciones visuales adaptadas a cada necesidad.</p></section><div class="service-list">${state.data.services.map(serviceCard).join('')}</div><section><h2>Solicitudes guardadas</h2>${state.serviceRequests.length?state.serviceRequests.map(r=>`<div class="saved-item"><b>${esc(r.service)}</b><span>${esc(r.date)}</span></div>`).join(''):empty('Aún no hay solicitudes de servicios.')}</section>`,{nav:true,title:'Servicios',subtitle:'RED ATÍPICA',backButton:true});
}
function serviceCard(s){ return `<article class="service-card"><img src="${IMG}${s.image}"><div><h3>${esc(s.name)}</h3><p>${esc(s.summary)}</p><b>${esc(s.price)}</b><button class="icon-btn" onclick="navigate('serviceDetail',{selectedService:'${s.id}'})">›</button></div></article>`; }
function serviceDetail(){ const s=serviceById(state.selectedService); layout(`<section class="service-detail"><img src="${IMG}${s.image}"><h1>${esc(s.name)}</h1><b>${esc(s.price)}</b><p>${esc(s.summary)}</p><h2>Incluye</h2><ul>${s.deliverables.map(d=>`<li>${esc(d)}</li>`).join('')}</ul><button class="btn full cta" onclick="requestService('${s.id}')">Cotizar ahora</button></section>`,{nav:true,title:'Servicio',subtitle:s.name,backButton:true}); }
function requestService(id){ const s=serviceById(id); state.serviceRequests.unshift({service:s.name,date:new Date().toLocaleString('es-CL')}); save('redServicesV7',state.serviceRequests); toast('Solicitud de servicio guardada.'); navigate('services'); }
function plans(){
  const plans=state.data.plans[state.planTab];
  layout(`<section class="section-title"><span>Planes RED ATÍPICA</span><h1>Elige el plan ideal</h1><p>Potencia tu perfil, tus proyectos y tu talento.</p></section><div class="plan-tabs"><button class="${state.planTab==='professional'?'on':''}" onclick="state.planTab='professional';render()">Para profesionales</button><button class="${state.planTab==='brand'?'on':''}" onclick="state.planTab='brand';render()">Para marcas y productoras</button></div><div class="plan-grid">${plans.map(planCard).join('')}</div><div class="plan-note"><b>Todos los planes incluyen</b><p>Comunidad RED ATÍPICA, un espacio seguro, inclusivo y colaborativo para crecer juntos.</p></div>`,{nav:true,title:'Planes',subtitle:'Freemium',backButton:true});
}
function planCard(p,i){ return `<article class="plan-card ${i===1?'premium':''}"><span>${esc(p.tag)}</span><h2>${esc(p.name)}</h2><strong>${esc(p.price)}</strong><ul>${p.features.map(f=>`<li>${esc(f)}</li>`).join('')}</ul><button class="btn ${i===1?'light':'outline'} full" onclick="toast('Plan ${esc(p.name)} seleccionado.')">${i===0?'Plan actual':'Elegir '+esc(p.name)}</button></article>`; }
function security(){
  const s=state.data.security;
  layout(`<section class="security-screen"><h1>Sistema de sanciones y seguridad</h1><p class="security-lead">Fomentamos una comunidad segura, profesional y de confianza.</p><div class="current-status"><div><b>Estado: ${esc(s.current)}</b><span>Tu cuenta no tiene sanciones.</span></div><strong>🛡️</strong></div><h2>¿Cómo funciona?</h2><div class="flow-list detailed-flow">${s.flow.map((f,i)=>`<article><b>${i+1}. ${esc(f)}</b><span>${['Si un usuario te reporta, nuestro equipo revisará el caso.','Analizamos la situación y determinamos si existe una falta a nuestras normas.','Si se confirma la falta, se aplicará una sanción según la gravedad.','Puedes apelar la sanción y recuperar tu buen estado participando responsablemente.'][i]}</span></article>`).join('')}</div><div class="security-alert"><b>Faltas que pueden ser sancionadas</b><ul>${s.situations.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div class="security-cols"><article><h3>Situaciones sancionables</h3><ul>${s.situations.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></article><article><h3>Tipos de sanciones</h3><ol>${s.sanctions.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></article></div><form class="report-card" onsubmit="submitReport(event)"><h3>Reportar perfiles o proyectos sospechosos</h3><textarea name="description" placeholder="Describe tu reporte (opcional)"></textarea><button class="btn full cta">REPORTAR</button></form><section><h2>Historial de sanciones</h2>${state.reports.length?state.reports.map(r=>`<div class="saved-item"><b>Reporte enviado</b><span>${esc(r.date)}</span></div>`).join(''):empty('No tienes sanciones registradas. Sigue así.')}</section><button class="btn outline full mt" onclick="openImage('final/security-detail.png','Sistema de sanciones')">Ver referencia completa</button></section>`,{nav:true,title:'Seguridad',subtitle:'Confianza',backButton:true});
}
function submitReport(ev){ ev.preventDefault(); state.reports.unshift({date:new Date().toLocaleString('es-CL'), text:ev.currentTarget.description.value}); save('redReportsV7',state.reports); toast('Reporte enviado.'); render(); }
async function qr(){
  layout(`<section class="section-title"><span>Código QR</span><h1>Comparte la aplicación</h1><p>Escanea este código desde otro dispositivo conectado a la misma red WiFi. Cuando la app esté alojada en internet, el QR apuntará automáticamente a la URL publicada.</p></section><section class="qr-card"><div id="qrBox" class="qr-loading">Generando QR...</div><button class="btn outline full" onclick="loadQr()">Actualizar QR</button><p class="text-muted">Para que funcione en celular: ejecuta la app en tu computador y abre el QR con la URL de red local.</p></section>`,{nav:true,title:'QR',subtitle:'Acceso rápido',backButton:true});
  setTimeout(loadQr,50);
}
async function loadQr(){
  const box=document.getElementById('qrBox'); if(!box) return;
  const res=await fetch('/api/local-url'); const data=await res.json(); state.qrUrl=data.local;
  box.innerHTML=`<img src="/qr.png?url=${encodeURIComponent(data.local)}" alt="Código QR"><strong>${esc(data.local)}</strong><span>${esc(data.note)}</span>`;
}

boot().catch(err=>{ console.error(err); app.innerHTML=`<div class="empty"><b>No se pudo cargar RED ATÍPICA</b><br>${esc(err.message)}</div>`; });
