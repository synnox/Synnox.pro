
/* CONFIG */
var CONFIG = {
  userId:    '1400424463849226260',
  username:  'Synnox',
  avatarUrl: './assets/img/avatar.png',
  bio:       'Créateur de Sn Hub, développeur et powerlifter.',
  bioEntreprise: 'Développeur web, Python et C++.',
  textSwitchToEntreprise:    'Mode Entreprise',
  textSwitchToCommunaute:    'Mode Communauté',
  links: [
    { title:'Sn hub',  sub:'Mon serveur Discord', url:'https://discord.gg/344pkQeu2q',         icon:'fab fa-discord', color:'discord' },
    { title:'YouTube', sub:'@synnoxtiktok',        url:'https://youtube.com/@synnoxtiktok',      icon:'fab fa-youtube', color:'youtube' },
    { title:'TikTok',  sub:'@synnox.tiktok',       url:'https://www.tiktok.com/@synnox.tiktok', icon:'fab fa-tiktok',  color:'tiktok'  },
    { title:'GitHub',  sub:'@synnox',              url:'https://github.com/synnox',             icon:'fab fa-github',  color:'github'  },
  ],
  mode: null // 'entreprise' ou 'communaute'
};

var $ = id => document.getElementById(id);

/* escape dynamic text coming from third-party APIs (XSS protection) */
function esc(s){
  return String(s==null?'':s).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}

/* PROFILE (from Lanyard, single source of truth) */
$('username').textContent = CONFIG.username;
$('bio').innerHTML = CONFIG.mode === 'entreprise'
  ? CONFIG.bioEntreprise
  : CONFIG.bio;
var av = $('avatar');
av.src = CONFIG.avatarUrl;
av.onerror = function(){ this.onerror=null; this.src=CONFIG.avatarUrl; };

/* LINKS */
CONFIG.links.forEach(function(l){
  var a = document.createElement('a');
  a.href=l.url; a.target='_blank'; a.rel='noopener noreferrer'; a.className='link';
  a.setAttribute('aria-label', l.title+' — '+l.sub);
  a.innerHTML=
    '<div class="link-icon i-'+l.color+'"><i class="'+l.icon+'" aria-hidden="true"></i></div>'+
    '<div class="link-info"><div class="link-title">'+esc(l.title)+'</div><div class="link-sub">'+esc(l.sub)+'</div></div>'+
    '<div class="link-arrow" aria-hidden="true"><i class="fas fa-arrow-right"></i></div>';
  $('linksContainer').appendChild(a);
});

/* TABS */
var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
var panels = {
  reseaux: $('panel-reseaux'),
  dev:     $('panel-dev'),
  pl:      $('panel-pl')
};
/* compteur animé des stats */
function countUp(el){
  var n=el.firstChild; if(!n||n.nodeType!==3) return;
  if(!el.dataset.raw) el.dataset.raw=n.nodeValue;
  var m=el.dataset.raw.match(/^(\D*)(\d+)(.*)$/); if(!m) return;
  var end=parseInt(m[2],10);
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){ n.nodeValue=el.dataset.raw; return; }
  var t0=null;
  (function step(t){
    if(!t0) t0=t;
    var k=Math.min((t-t0)/900,1), e=1-Math.pow(1-k,3);
    n.nodeValue=m[1]+Math.round(end*e)+m[3];
    if(k<1) requestAnimationFrame(step);
  })(performance.now());
}
function activateTab(name){
  if(name==='pl') document.querySelectorAll('.pl-stat-val').forEach(countUp);
  tabs.forEach(function(t){
    var sel = t.dataset.tab===name;
    t.classList.toggle('active',sel);
    t.setAttribute('aria-selected', sel?'true':'false');
    t.tabIndex = sel?0:-1;
  });
  Object.keys(panels).forEach(function(k){
    panels[k].classList.toggle('active', k===name);
  });
}
tabs.forEach(function(t){
  t.addEventListener('click', function(){ activateTab(t.dataset.tab); });
  t.addEventListener('keydown', function(e){
    var i = tabs.indexOf(t);
    if(e.key==='ArrowRight'){ e.preventDefault(); tabs[(i+1)%tabs.length].focus(); }
    if(e.key==='ArrowLeft'){ e.preventDefault(); tabs[(i-1+tabs.length)%tabs.length].focus(); }
  });
});
activateTab('reseaux');

/* GITHUB REPOS (Dev panel) - Filtré pour ne montrer que web-template et Sn-Hub */
function renderRepos(repos){
  var box = $('devRepos');
  if(!Array.isArray(repos) || !repos.length){ box.innerHTML=''; return; }
  var filteredRepos = repos.filter(function(rp){
    return rp.name === 'web-template' || rp.name === 'Sn-Hub';
  });
  var langColors={JavaScript:'#f1e05a',Python:'#3572A5',C:'#555555','C++':'#f34b7d',HTML:'#e34c26',CSS:'#563d7c',TypeScript:'#3178c6',Java:'#b07219',PHP:'#4F5D95',Ruby:'#701516',Go:'#00ADD8',Rust:'#dea584',Shell:'#89e051'};
  box.innerHTML = filteredRepos.map(function(rp){
    var lang = rp.language
      ? '<span class="repo-lang"><span class="repo-dot" style="background:'+(langColors[rp.language]||'#888')+'"></span>'+esc(rp.language)+'</span>'
      : '';
    var stars = rp.stargazers_count
      ? '<span class="repo-stars"><i class="fas fa-star" aria-hidden="true"></i>'+rp.stargazers_count+'</span>'
      : '';
    return '<a class="repo" href="'+esc(rp.html_url)+'" target="_blank" rel="noopener noreferrer" aria-label="'+esc(rp.name)+'">'+
      '<div class="repo-top"><span class="repo-name"><i class="fab fa-github" aria-hidden="true" style="color:#bbb"></i><span>'+esc(rp.name)+'</span></span>'+stars+'</div>'+
      (rp.description?'<div class="repo-desc">'+esc(rp.description)+'</div>':'')+
      lang+'</a>';
  }).join('');
}

var GITHUB_CACHE_KEY = 'synnox_github_repos_v1';
var GITHUB_CACHE_TTL = 24 * 60 * 60 * 1000; /* 24 heures */
var GITHUB_TARGET_REPOS = ['web-template','Sn-Hub'];

function loadRepos(){
  var box = $('devRepos');
  var cached = null;
  try{ cached = JSON.parse(localStorage.getItem(GITHUB_CACHE_KEY)); }catch(e){}
  if(cached && cached.t && Date.now() - cached.t < GITHUB_CACHE_TTL && Array.isArray(cached.repos)){
    renderRepos(cached.repos);
    return;
  }
  box.innerHTML='<div class="skel"><div class="skel-icon skel-pulse"></div><div class="skel-text skel-pulse"></div></div>';
  /* on ne requête que les repos affichés : moins de données, moins de risque de quota */
  Promise.all(GITHUB_TARGET_REPOS.map(function(name){
    return fetch('https://api.github.com/repos/synnox/'+name)
      .then(function(r){ if(!r.ok) throw 0; return r.json(); });
  }))
    .then(function(repos){
      try{ localStorage.setItem(GITHUB_CACHE_KEY, JSON.stringify({ t: Date.now(), repos: repos })); }catch(e){}
      renderRepos(repos);
    })
    .catch(function(){ box.innerHTML=''; });
}
loadRepos();

/* LOFI PLAYER — un seul son de fond, en boucle, dans les deux modes */
var lofiAudio  = $('lofiAudio');
var lofiBtn    = $('lofiPlayBtn');
var lofiIcon   = $('lofiIcon');
var lofiVol    = $('lofiVolume');
var LOFI_URL   = './assets/audio/lofi.mp3';

function updateLofiVolUI(v){
  lofiVol.style.background='linear-gradient(90deg,var(--text) '+v+'%,var(--line) '+v+'%)';
}
lofiVol.addEventListener('input',function(){ updateLofiVolUI(this.value); lofiAudio.volume=this.value/100; });
updateLofiVolUI(lofiVol.value);
lofiAudio.volume = lofiVol.value/100;

function syncLofiUI(){
  $('lofiWidget').classList.toggle('playing', !lofiAudio.paused);
  lofiIcon.className = lofiAudio.paused ? 'fas fa-play' : 'fas fa-pause';
  lofiBtn.setAttribute('aria-label', lofiAudio.paused ? 'Lire le lofi' : 'Mettre en pause le lofi');
}
function toggleLofi(){
  loadLofi();
  if(lofiAudio.paused){
    lofiAudio.muted=false;
    var p = lofiAudio.play();
    if(p && p.catch) p.catch(function(){ syncLofiUI(); });
  } else { lofiAudio.pause(); }
  syncLofiUI();
}
lofiBtn.addEventListener('click',toggleLofi);
lofiAudio.addEventListener('play',syncLofiUI);
lofiAudio.addEventListener('pause',syncLofiUI);
lofiAudio.addEventListener('ended',syncLofiUI);
syncLofiUI();

function loadLofi(){
  if(lofiAudio.getAttribute('src')) return;
  lofiAudio.loop = true;
  lofiAudio.src = LOFI_URL;
}

/* boucle de secours : si le navigateur ne boucle pas parfaitement le mp4,
   on revient au début et on relance */
lofiAudio.addEventListener('ended', function(){
  if(lofiAudio.loop) return;
  try{ lofiAudio.currentTime = 0; }catch(e){}
  lofiAudio.play && lofiAudio.play().catch(function(){ syncLofiUI(); });
  syncLofiUI();
});

/* démarre le lofi dans un contexte de geste utilisateur (autoplay bloqué sinon) */
function autostartLofi(){
  loadLofi();
  if(!lofiAudio.paused) return;
  lofiAudio.muted=false;
  lofiAudio.volume = lofiVol.value/100;
  var p = lofiAudio.play();
  if(p && p.catch) p.catch(function(){ syncLofiUI(); });
  syncLofiUI();
}
/* au premier geste utilisateur (mode déjà choisi → pas de modale au chargement) */
function firstGestureLofi(){
  document.removeEventListener('click',firstGestureLofi);
  document.removeEventListener('keydown',firstGestureLofi);
  document.removeEventListener('pointerdown',firstGestureLofi);
  if(CONFIG.mode) autostartLofi();
}
document.addEventListener('click',firstGestureLofi);
document.addEventListener('keydown',firstGestureLofi);
document.addEventListener('pointerdown',firstGestureLofi);

/* VIDÉO DE FOND - retirée : le fond est le même (dégradé) dans les deux modes */

/* LEGAL MODALS - Conformité FR/EU */
var legalModal = $('legalModal');
var legalContent = {
  privacy: {
    title: 'Politique de Confidentialité',
    content: '<p><strong>Collecte des données</strong></p><p>Ce site ne collecte aucune donnée personnelle automatiquement. Pour afficher les icônes, le graphique GitHub et les informations du serveur Discord, votre navigateur contacte jsDelivr, ghchart.rshah.org et Discord, qui peuvent recevoir votre adresse IP. Les seules données collectées sont celles que vous fournissez volontairement via le formulaire de contact.</p><p><strong>Utilisation des données</strong></p><p>Les données du formulaire de contact sont utilisées uniquement pour répondre à vos demandes. Elles sont transmises et stockées par FormSubmit (service tiers de messagerie) qui agit comme sous-traitant sécurisé. Elles ne sont jamais revendues à des tiers.</p><p><strong>Droits utilisateurs</strong></p><p>Conformément au RGPD, vous avez le droit d\'accéder, rectifier et supprimer vos données. Contactez-nous pour exercer ces droits.</p><p><strong>Conservation</strong></p><p>Les données sont conservées uniquement le temps nécessaire au traitement de votre demande.</p>'
  },
  terms: {
    title: 'Conditions d\'Utilisation',
    content: '<p><strong>Acceptation</strong></p><p>En utilisant ce site, vous acceptez ces conditions d\'utilisation.</p><p><strong>Utilisation du site</strong></p><p>Ce site est destiné à présenter le portfolio de Synnox. Toute utilisation non autorisée est interdite.</p><p><strong>Propriété intellectuelle</strong></p><p>Tout le contenu (textes, images, code) est la propriété de Synnox sauf mention contraire.</p><p><strong>Limitation de responsabilité</strong></p><p>Synnox n\'est pas responsable des dommages résultant de l\'utilisation de ce site.</p>'
  },
  cookies: {
    title: 'Politique de Cookies',
    content: '<p><strong>Cookies utilisés</strong></p><p>Ce site utilise uniquement des cookies techniques nécessaires au bon fonctionnement (localStorage pour mémoriser vos préférences de mode d\'affichage de musique, de thème et de langue).</p><p><strong>Aucun cookie de suivi</strong></p><p>Ce site ne charge aucun script de mesure d\'audience et ne dépose aucun cookie de suivi publicitaire.</p><p><strong>Consentement</strong></p><p>En continuant à utiliser ce site, vous acceptez l\'utilisation des cookies techniques nécessaires.</p><p><strong>Gestion</strong></p><p>Vous pouvez supprimer les cookies via les paramètres de votre navigateur.</p>'
  }
};

function showLegalModal(type){
  var info = legalContent[type];
  var src = (window.SYN_LANG==='en' && window.SYN_LEGAL_EN && window.SYN_LEGAL_EN[type]) || info;
  $('legalTitle').textContent = src.title;
  $('legalContent').innerHTML = src.content;
  legalModal.hidden = false;
  legalModal.style.display = 'flex';
  legalModal.style.opacity = '1';
}

$('legalClose').addEventListener('click',function(){
  legalModal.style.opacity = '0';
  setTimeout(function(){
    legalModal.style.display = 'none';
    legalModal.hidden = true;
  }, 200);
});

legalModal.addEventListener('click',function(e){
  if(e.target === legalModal){
    legalModal.style.opacity = '0';
    setTimeout(function(){
      legalModal.style.display = 'none';
      legalModal.hidden = true;
    }, 200);
  }
});

document.addEventListener('keydown',function(e){
  if(e.key === 'Escape' && !legalModal.hidden){
    legalModal.style.opacity = '0';
    setTimeout(function(){
      legalModal.style.display = 'none';
      legalModal.hidden = true;
    }, 200);
  }
});

/* CONTACT FORM — FormSubmit (AJAX) */
function sendContactForm(){
  var form = document.getElementById('entrepriseContactForm');
  var status = document.getElementById('entContactStatus');
  var name = document.getElementById('entCName');
  var subject = document.getElementById('entCSubject');
  var message = document.getElementById('entCMsg');

  if(!name.value.trim() || !subject.value.trim() || !message.value.trim()){
    status.textContent='Veuillez remplir tous les champs';
    status.style.color='#ff4757';
    status.style.display='block';
    return;
  }

  status.textContent='Envoi en cours…';
  status.style.color='#7983f5';
  status.style.display='block';

  var data = new URLSearchParams(new FormData(form));
  /* endpoint AJAX FormSubmit : la réponse JSON contient success=true/false
     (HTTP 200 ne veut PAS dire envoyé : tant que le formulaire n'est pas
     activé, FormSubmit répond success=false + un email d'activation) */
  fetch('https://formsubmit.co/ajax/synnox.pro@gmail.com', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(Object.fromEntries(data))
  })
    .then(function(res){ return res.json(); })
    .then(function(res){
      if(res.success !== true && res.success !== 'true'){ throw new Error(res.message || 'success=false'); }
      status.textContent='Message envoyé ! Merci.';
      status.style.color='#3ba55d';
      form.reset();
    })
    .catch(function(err){
      status.textContent=(err && err.message && err.message !== 'success=false')
        ? err.message
        : 'L\'envoi a échoué. Réessayez ou écrivez directement à synnox.pro@gmail.com';
      status.style.color='#ff4757';
    })
    .then(function(){
      setTimeout(function(){ status.style.display='none'; }, 6000);
    });
}

/* MODE SELECTION */
var modeModal = $('modeModal');
var MODE_SAVE_KEY = 'synnox_mode_v1';

function saveMode(m){ try{ localStorage.setItem(MODE_SAVE_KEY,m); }catch(e){} }
function loadMode(){ try{ return localStorage.getItem(MODE_SAVE_KEY); }catch(e){ return null; } }

function startLanyard(){
  fetchLanyard();
  if(!window.lanyardInterval){
    window.lanyardInterval = setInterval(fetchLanyard,20000);
  }
}
function stopLanyard(){
  if(window.lanyardInterval){
    clearInterval(window.lanyardInterval);
    window.lanyardInterval = null;
  }
  if(spTimer){ clearInterval(spTimer); spTimer=null; }
}

/* onglet en arrière-plan : on suspend le polling, on reprend dès qu'il redevient visible */
document.addEventListener('visibilitychange', function(){
  if(document.hidden){
    stopLanyard();
  } else if(CONFIG.mode === 'communaute'){
    startLanyard();
  }
});

/* focus trap : Tab / Shift+Tab restent dans la modale */
function modeModalButtons(){
  return Array.prototype.filter.call(modeModal.querySelectorAll('button'), function(b){ return b.getClientRects().length>0; });
}
function openModeModal(){
  modeModal.style.display='flex';
  var b=modeModal.querySelector('button');
  if(b) b.focus();
  document.addEventListener('keydown',modeModalKey);
}
function closeModeModal(){
  modeModal.style.display='none';
  document.removeEventListener('keydown',modeModalKey);
}
/* Échap ne ferme la fenêtre que si un mode est déjà choisi */
function modeModalKey(e){
  if(e.key==='Escape'){ if(CONFIG.mode) closeModeModal(); return; }
  if(e.key==='Tab'){
    var f=modeModalButtons();
    if(!f.length) return;
    var first=f[0], last=f[f.length-1];
    if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
  }
}

/* L'affichage (onglets, activité, contenu entreprise…) est géré par le CSS via les classes
   body.entreprise-mode / body.communaute-mode ; ici on ne gère que l'état. */
function chooseCommunaute(){
  closeModeModal();
  if(CONFIG.mode==='communaute') return; /* déjà dans ce mode : ne rien relancer */
  saveMode('communaute');
  CONFIG.mode = 'communaute';
  document.body.classList.remove('entreprise-mode');
  document.body.classList.add('communaute-mode');
  $('bio').innerHTML = CONFIG.bio;
  $('modeSwitchText').textContent = CONFIG.textSwitchToEntreprise;
  startLanyard();      /* activité Discord */
  autostartLofi();     /* musique de fond lofi */
}

function chooseEntreprise(){
  closeModeModal();
  if(CONFIG.mode==='entreprise') return; /* déjà dans ce mode : ne rien relancer */
  saveMode('entreprise');
  CONFIG.mode = 'entreprise';
  document.body.classList.add('entreprise-mode');
  document.body.classList.remove('communaute-mode');
  $('bio').innerHTML = CONFIG.bioEntreprise;
  $('modeSwitchText').textContent = CONFIG.textSwitchToCommunaute;
  stopLanyard();       /* pas de musique en mode entreprise */
  lofiAudio.pause();
}

$('chooseCommunaute').addEventListener('click',chooseCommunaute);
$('chooseEntreprise').addEventListener('click',chooseEntreprise);

/* MODE SWITCHER BUTTON */
$('modeSwitchBtn').addEventListener('click',openModeModal);
/* on peut fermer la fenêtre de choix (clic à côté / Échap) seulement si un mode est déjà choisi */
modeModal.addEventListener('click',function(e){ if(e.target===modeModal && CONFIG.mode) closeModeModal(); });

/* ENTREPRISE TABS */
var entTabs = Array.prototype.slice.call(document.querySelectorAll('.entreprise-tab'));
var entPanels = {
  projets: $('ent-panel-projets'),
  partenariat: $('ent-panel-partenariat'),
  contact: $('ent-panel-contact')
};
function activateEntTab(name){
  entTabs.forEach(function(t){
    var sel = t.dataset.tab===name;
    t.classList.toggle('active',sel);
    t.setAttribute('aria-selected', sel?'true':'false');
    t.tabIndex = sel?0:-1;
  });
  Object.keys(entPanels).forEach(function(k){
    entPanels[k].classList.toggle('active', k===name);
  });
}
entTabs.forEach(function(t){
  t.addEventListener('click', function(){ activateEntTab(t.dataset.tab); });
  t.addEventListener('keydown', function(e){
    var i = entTabs.indexOf(t);
    if(e.key==='ArrowRight'){ e.preventDefault(); entTabs[(i+1)%entTabs.length].focus(); }
    if(e.key==='ArrowLeft'){ e.preventDefault(); entTabs[(i-1+entTabs.length)%entTabs.length].focus(); }
  });
});
activateEntTab('projets');

/* LANYARD */
var actBox    = $('activityContent');
var statusDot = $('statusDot');
var spTimer   = null;

function fmt(ms){
  if(ms<0)ms=0;
  var s=Math.floor(ms/1000),m=Math.floor(s/60),h=Math.floor(m/60);
  if(h>0)return h+'h '+(m%60)+'m';
  if(m>0)return m+'m '+(s%60)+'s';
  return s+'s';
}

function render(d){
  var acts=d.activities||[], sp=d.spotify||null, status=d.discord_status||'offline';
  statusDot.className='status-dot '+status;
  statusDot.setAttribute('aria-label','Statut Discord : '+status);
  if(spTimer){clearInterval(spTimer);spTimer=null;}

  if(sp){
    var s0=new Date(sp.timestamps.start).getTime(), e0=new Date(sp.timestamps.end).getTime();
    var pct=Math.min((Date.now()-s0)/(e0-s0)*100,100);
    var art = sp.album_art_url
      ? '<img class="act-icon" src="'+esc(sp.album_art_url)+'" alt="" decoding="async">'
      : '<div class="act-icon" style="display:flex;align-items:center;justify-content:center;font-size:20px;color:#1db954"><i class="fab fa-spotify" aria-hidden="true"></i></div>';
    actBox.innerHTML=
      '<div class="act-body">'+art+
        '<div class="act-info">'+
          '<div class="act-name">'+esc(sp.song||'Inconnu')+'</div>'+
          '<div class="act-state">'+esc(sp.artist||'')+'</div>'+
          '<div class="act-detail">Spotify &bull; '+esc(sp.album||'')+'</div>'+
          '<div class="sp-bar"><div class="sp-progress"><div class="sp-fill" id="spFill" style="width:'+pct+'%"></div></div></div>'+
        '</div></div>';
    spTimer=setInterval(function(){
      var p=Math.min((Date.now()-s0)/(e0-s0)*100,100);
      var el=document.getElementById('spFill');
      if(el)el.style.width=p+'%';
    },1000);
    return;
  }

  var game=acts.find(function(a){return a.type===0;}), custom=acts.find(function(a){return a.type===4;});

  if(game){
    var img=null;
    try{
      if(game.assets&&game.assets.large_image){
        var si=game.assets.large_image;
        if(si.indexOf('mp:external/')===0) img='https://media.discordapp.net/external/'+si.replace('mp:external/','');
        else if(si.indexOf('spotify:')===0) img='https://i.scdn.co/image/'+si.replace('spotify:','');
        else img='https://cdn.discordapp.com/app-assets/'+game.application_id+'/'+si+'.png';
      }
    }catch(e){}
    var elapsed=game.timestamps&&game.timestamps.start?fmt(Date.now()-new Date(game.timestamps.start).getTime()):'';
    actBox.innerHTML=
      '<div class="act-body">'+
        (img?'<img class="act-icon" src="'+esc(img)+'" alt="'+esc(game.name)+'" decoding="async" onerror="this.style.display=\'none\'">':
             '<div class="act-icon" style="display:flex;align-items:center;justify-content:center;font-size:20px;color:#5865f2"><i class="fas fa-gamepad" aria-hidden="true"></i></div>')+
        '<div class="act-info">'+
          '<div class="act-name">'+esc(game.name)+'</div>'+
          (game.details?'<div class="act-state">'+esc(game.details)+'</div>':'')+
          (game.state?'<div class="act-detail">'+esc(game.state)+'</div>':'')+
          (elapsed?'<div class="act-time">'+elapsed+'</div>':'')+
        '</div></div>';
    return;
  }

  if(custom&&custom.emoji){
    var em=custom.emoji;
    var eu=em.id?'https://cdn.discordapp.com/emojis/'+em.id+'.'+(em.animated?'gif':'png'):null;
    actBox.innerHTML=
      '<div class="act-body">'+
        (eu?'<img class="act-icon" src="'+esc(eu)+'" alt="'+esc(em.name)+'" decoding="async" style="object-fit:contain;padding:10px;background:rgba(255,255,255,.04)">':
            '<div class="act-icon" style="display:flex;align-items:center;justify-content:center;font-size:24px">'+esc(em.name)+'</div>')+
        '<div class="act-info"><div class="act-name">'+esc(custom.state||'En ligne')+'</div><div class="act-state" style="color:#3a3a5a">Statut personnalisé</div></div>'+
      '</div>';
    return;
  }

  actBox.innerHTML='<div class="no-act"><i class="fas fa-circle" style="font-size:5px;color:#3ba55d" aria-hidden="true"></i><span>En ligne — Aucune activité</span></div>';
}

function showGuide(){
  var g=$('guideBox'),c=$('guideContent');
  g.style.display='block';
  c.innerHTML='<strong>Pour voir ton activité Discord en direct :</strong><br><br>'+
    '1. Rejoins le serveur <a href="https://discord.gg/lanyard" target="_blank" rel="noopener noreferrer"><strong>Lanyard</strong></a><br>'+
    '2. Ton statut (jeu, Spotify…) apparaîtra ici en temps réel<br>'+
    '3. Actualise la page après avoir rejoint';
}

function applyProfile(du){
  if(!du) return;
  $('username').textContent = du.global_name||du.username||CONFIG.username;
  var disc = du.discriminator && du.discriminator!=='0' ? '#'+du.discriminator : '';
  $('discriminator').textContent = disc;
  if(du.avatar){
    var ext = du.avatar.indexOf('a_')===0 ? 'gif' : 'png';
    av.src = 'https://cdn.discordapp.com/avatars/'+du.id+'/'+du.avatar+'.'+ext;
  } else {
    av.src = CONFIG.avatarUrl;
  }
}

function fetchLanyard(){
  // Masquer l'activité en mode entreprise
  if(CONFIG.mode === 'entreprise'){
    actBox.innerHTML='<div class="no-act"><i class="fas fa-info-circle"  aria-hidden="true"></i><span>Activité non disponible en mode entreprise</span></div>';
    return;
  }

  fetch('https://api.lanyard.rest/v1/users/'+CONFIG.userId)
    .then(function(r){
      if(!r.ok) throw new Error('API error');
      return r.json();
    })
    .then(function(res){
      if(res.success&&res.data){
        if(res.data.discord_user) applyProfile(res.data.discord_user);
        render(res.data);
      } else {
        actBox.innerHTML='<div class="no-act"><i class="fas fa-info-circle"  aria-hidden="true"></i><span>ID non suivi par Lanyard</span></div>';
        showGuide();
      }
    })
    .catch(function(error){
      console.log('Lanyard error:', error);
      actBox.innerHTML='<div class="no-act"><i class="fas fa-exclamation-triangle" style="color:#faa61a" aria-hidden="true"></i><span>Service temporairement indisponible</span></div>';
    });
}

/* INIT — lancé en dernier, quand toutes les fonctions et variables existent */
(function initMode(){
  var saved=loadMode();
  if(saved==='entreprise'){ chooseEntreprise(); }
  else if(saved==='communaute'){ chooseCommunaute(); }
  else { chooseEntreprise(); } /* mode professionnel par défaut, sans fenêtre bloquante */
})();
