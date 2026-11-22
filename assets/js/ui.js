/* Thème clair/sombre, langue FR/EN, soulignement d'onglets glissant */
(function(){
  var root = document.documentElement;
  var THEME_KEY = 'synnox_theme_v1', LANG_KEY = 'synnox_lang_v1';
  var themeBtn = document.getElementById('themeBtn'), langBtn = document.getElementById('langBtn');
  var mq = matchMedia('(prefers-color-scheme: dark)');
  function L(){ return window.SYN_LANG || 'fr'; }

  /* ---------- Thème ---------- */
  function isDark(){ var t = root.dataset.theme; return t ? t === 'dark' : mq.matches; }
  function syncTheme(){
    var d = isDark();
    themeBtn.innerHTML = '<i class="fas fa-' + (d ? 'sun' : 'moon') + '" aria-hidden="true"></i>';
    themeBtn.setAttribute('aria-label', L()==='en' ? (d ? 'Switch to light theme' : 'Switch to dark theme')
                                                   : (d ? 'Passer au thème clair' : 'Passer au thème sombre'));
    var mt = document.querySelector('meta[name="theme-color"]'); if(mt) mt.content = d ? '#14171c' : '#e8edf4';
    document.dispatchEvent(new Event('synnox:theme'));
  }
  themeBtn.addEventListener('click', function(){
    var t = isDark() ? 'light' : 'dark';
    root.dataset.theme = t;
    try{ localStorage.setItem(THEME_KEY, t); }catch(e){}
    syncTheme();
  });
  if(mq.addEventListener) mq.addEventListener('change', function(){ if(!root.dataset.theme) syncTheme(); });

  /* ---------- Traductions ---------- */
  var DICT = {
    'Fermer':'Close', "Mode d'affichage":'Display mode',
    'Choisissez la version du site à afficher.':'Choose which version of the site to show.',
    'Communauté':'Community','Réseaux sociaux et activité Discord':'Social links and Discord activity',
    'Entreprise':'Business','Présentation professionnelle':'Professional presentation',
    'Lecteur lofi':'Lofi player','Lire ou mettre en pause le lofi':'Play or pause lofi','Lire le lofi':'Play lofi',
    'Mettre en pause le lofi':'Pause lofi','Volume du lofi':'Lofi volume','Musique de fond':'Background music',
    'Changer de mode':'Change mode','Mode Entreprise':'Business mode','Mode Communauté':'Community mode',
    'Avatar de Synnox':"Synnox's avatar",'Statut Discord : hors ligne':'Discord status: offline',
    'Créateur de Sn Hub, développeur et powerlifter.':'Creator of Sn Hub, developer and powerlifter.',
    'Développeur web, Python et C++.':'Web, Python and C++ developer.',
    'Activité Discord':'Discord activity','Catégories':'Categories','Réseaux':'Links','Liens sociaux':'Social links',
    'GitHub — @synnox, mes projets':'GitHub, @synnox, my projects','@synnox — mes projets':'@synnox, my projects',
    '16 ans · Catégorie Sub-Junior':'16 years old · Sub-Junior category','Rang mondial':'World rank','Minima de qualification France':'France qualification standard','Développé couché':'Bench press','Soulevé de terre':'Deadlift','Âge':'Age','e':'th','ans':'yrs',
    'Rejoindre le Discord Sn Hub':'Join the Sn Hub Discord','Conseils & accompagnement':'Advice & coaching',
    'Rejoins mon Discord — Sn Hub':'Join my Discord, Sn Hub',
    'Je partage mes entraînements et réponds aux questions sur le powerlifting sur Sn Hub.':'I share my training and answer powerlifting questions on Sn Hub.',
    'Catégories entreprise':'Business categories','Projets':'Projects','Partenariat':'Partnership','À propos':'About',
    'Développeur full-stack spécialisé en Python, C++ et web moderne. Powerlifter N1 qualifié pour les championnats de France sub-junior.':'Full-stack developer specialised in Python, C++ and modern web. N1 powerlifter qualified for the French sub-junior championships.',
    'Modèle de site web':'Website template','Plateforme communautaire Discord':'Discord community platform','Voir le code':'View code',
    'Je suis ouvert aux partenariats professionnels. Écrivez-moi pour en discuter.':"I'm open to professional partnerships. Write to me to discuss.",
    'E-mail':'Email','E-mail pour un partenariat':'Email about a partnership',
    'Pour un projet ou une collaboration, écrivez-moi par e-mail ou avec ce formulaire.':'For a project or collaboration, email me or use this form.',
    'Votre nom':'Your name','Sujet':'Subject','Votre message…':'Your message…','Envoyer':'Send',
    'Veuillez remplir tous les champs':'Please fill in all fields','Envoi en cours…':'Sending…','Message envoyé ! Merci.':'Message sent! Thank you.',
    "L'envoi a échoué. Réessayez ou écrivez directement à synnox.pro@gmail.com":'Sending failed. Try again or write directly to synnox.pro@gmail.com',
    'Confidentialité':'Privacy','Conditions':'Terms','Activité GitHub':'GitHub activity',
    'Graphique des contributions GitHub de synnox':"synnox's GitHub contribution chart",'Rejoindre':'Join',
    'En ligne — Aucune activité':'Online, no activity','Activité non disponible':'Activity unavailable',
    'Service temporairement indisponible':'Service temporarily unavailable','ID non suivi par Lanyard':'ID not tracked by Lanyard',
    'Statut personnalisé':'Custom status','En ligne':'Online','Inconnu':'Unknown',
    'Pour voir ton activité Discord en direct :':'To show your live Discord activity:',
    '1. Rejoins le serveur':'1. Join the server','2. Ton statut (jeu, Spotify…) apparaîtra ici en temps réel':'2. Your status (game, Spotify…) will appear here in real time',
    '3. Actualise la page après avoir rejoint':'3. Refresh the page after joining'
  };
  var PATTERNS = [
    [/^(\d+) en ligne · (\d+) membres$/, '$1 online · $2 members'],
    [/^Rejoindre le serveur (.+)$/, 'Join the $1 server'],
    [/^Statut Discord : (.+)$/, 'Discord status: $1']
  ];
  function lookup(key){
    if(Object.prototype.hasOwnProperty.call(DICT, key)) return DICT[key];
    for(var i = 0; i < PATTERNS.length; i++) if(PATTERNS[i][0].test(key)) return key.replace(PATTERNS[i][0], PATTERNS[i][1]);
    return null;
  }
  var DEVBIO_EN = 'I design and build <strong>websites</strong>, <strong>Python applications</strong> and <strong>C++ applications</strong>.';
  window.SYN_LEGAL_EN = {
    privacy:{ title:'Privacy Policy', content:'<p><strong>Data collection</strong></p><p>This site does not automatically collect any personal data. To display icons, the GitHub chart and Discord server information, your browser contacts jsDelivr, ghchart.rshah.org and Discord, which may receive your IP address. The only data collected is what you voluntarily send through the contact form.</p><p><strong>Use of data</strong></p><p>Contact form data is used only to answer your request. It is transmitted and stored by FormSubmit (a third-party mail service acting as a secure processor) and is never sold to third parties.</p><p><strong>Your rights</strong></p><p>Under the GDPR you have the right to access, correct and delete your data. Contact us to exercise these rights.</p><p><strong>Retention</strong></p><p>Data is kept only as long as needed to handle your request.</p>' },
    terms:{ title:'Terms of Use', content:'<p><strong>Acceptance</strong></p><p>By using this site you accept these terms of use.</p><p><strong>Use of the site</strong></p><p>This site presents the portfolio of Synnox. Any unauthorised use is prohibited.</p><p><strong>Intellectual property</strong></p><p>All content (text, images, code) is the property of Synnox unless stated otherwise.</p><p><strong>Limitation of liability</strong></p><p>Synnox is not responsible for any damage resulting from the use of this site.</p>' },
    cookies:{ title:'Cookie Policy', content:'<p><strong>Cookies used</strong></p><p>This site only uses technical storage required for it to work (localStorage to remember your display mode, music, theme and language preferences).</p><p><strong>No tracking cookies</strong></p><p>This site loads no analytics script and sets no advertising or tracking cookie.</p><p><strong>Consent</strong></p><p>By continuing to use this site you accept the necessary technical storage.</p><p><strong>Management</strong></p><p>You can delete stored data from your browser settings.</p>' }
  };

  var origText = new WeakMap(), origAttr = new WeakMap(), busy = false, mo;
  var ATTRS = ['aria-label','placeholder','alt'];
  /* On retient pour chaque texte : l'original (raw) et notre traduction (tr).
     On ne touche à un texte que s'il vaut encore ce que nous y avons mis. */
  function trText(n){
    var rec = origText.get(n);
    if(rec && n.nodeValue === rec.tr) return;
    var raw = n.nodeValue, key = raw.replace(/\s+/g,' ').trim();
    var out = (L()==='en' && key) ? lookup(key) : null;
    if(out == null){ origText.delete(n); return; }
    var tr = raw.match(/^\s*/)[0] + out + raw.match(/\s*$/)[0];
    origText.set(n, { raw:raw, tr:tr });
    n.nodeValue = tr;
  }
  function trAttrs(el){
    var o = origAttr.get(el) || {};
    ATTRS.forEach(function(a){
      if(!el.hasAttribute(a)) return;
      var v = el.getAttribute(a);
      if(o[a] && v === o[a].tr) return;
      var out = L()==='en' ? lookup(v.trim()) : null;
      if(out == null){ delete o[a]; return; }
      o[a] = { raw:v, tr:out };
      el.setAttribute(a, out);
    });
    origAttr.set(el, o);
  }
  function walk(node, fn){
    var w = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, { acceptNode:function(n){
      var p = n.parentNode && n.parentNode.nodeName; return (p==='SCRIPT'||p==='STYLE') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; } });
    var n; while((n = w.nextNode())) fn(n);
  }
  function applyAll(){
    busy = true;
    if(L()==='en'){
      walk(document.body, trText);
      document.querySelectorAll('[aria-label],[placeholder],[alt]').forEach(trAttrs);
    } else {
      walk(document.body, function(n){
        var rec = origText.get(n); if(!rec) return;
        if(n.nodeValue === rec.tr) n.nodeValue = rec.raw;
        origText.delete(n);
      });
      document.querySelectorAll('[aria-label],[placeholder],[alt]').forEach(function(el){
        var o = origAttr.get(el); if(!o) return;
        Object.keys(o).forEach(function(a){ if(el.getAttribute(a) === o[a].tr) el.setAttribute(a, o[a].raw); });
        origAttr.delete(el);
      });
    }
    var db = document.querySelector('[data-i18n-html="devbio"]');
    if(db){ if(!db.dataset.fr) db.dataset.fr = db.innerHTML; db.innerHTML = L()==='en' ? DEVBIO_EN : db.dataset.fr; }
    if(mo) mo.takeRecords();   /* ignore nos propres modifications (livrées en différé) */
    busy = false;
  }
  mo = new MutationObserver(function(list){
    if(busy || L()!=='en') return;
    busy = true;
    list.forEach(function(m){
      if(m.type==='characterData') trText(m.target);
      else if(m.type==='attributes') trAttrs(m.target);
      else m.addedNodes.forEach(function(n){
        if(n.nodeType===3) trText(n);
        else if(n.nodeType===1){ walk(n, trText); trAttrs(n); n.querySelectorAll('[aria-label],[placeholder],[alt]').forEach(trAttrs); }
      });
    });
    mo.takeRecords();
    busy = false;
  });
  mo.observe(document.body, { childList:true, subtree:true, characterData:true, attributes:true, attributeFilter:ATTRS });

  var META = {
    fr:{ title:'Synnox — Profil & Links', desc:'Profil de Synnox : liens vers ses serveurs Discord, chaînes YouTube, TikTok et GitHub, avec activité Discord en direct et une musique lofi de fond.' },
    en:{ title:'Synnox — Profile & Links', desc:"Synnox's profile: links to his Discord servers, YouTube, TikTok and GitHub, with live Discord activity and background lofi music." }
  };
  function setLang(l, save){
    window.SYN_LANG = l;
    root.lang = l;
    if(save){ try{ localStorage.setItem(LANG_KEY, l); }catch(e){} }
    document.title = META[l].title;
    var md = document.querySelector('meta[name="description"]'); if(md) md.content = META[l].desc;
    langBtn.textContent = l==='en' ? 'FR' : 'EN';
    langBtn.setAttribute('aria-label', l==='en' ? 'Passer en français' : 'Switch to English');
    applyAll(); syncTheme();
  }
  langBtn.addEventListener('click', function(){ setLang(L()==='en' ? 'fr' : 'en', true); });
  var savedLang = null; try{ savedLang = localStorage.getItem(LANG_KEY); }catch(e){}
  setLang(savedLang || ((navigator.language||'fr').slice(0,2)==='fr' ? 'fr' : 'en'), false);

  /* ---------- Soulignement d'onglets qui glisse ---------- */
  ['.tabs','.entreprise-tabs'].forEach(function(sel){
    var list = document.querySelector(sel); if(!list) return;
    var ink = document.createElement('i'); ink.className = 'tab-ink'; list.appendChild(ink);
    function move(){
      var a = list.querySelector('.active'); if(!a || !a.offsetWidth) return;
      ink.style.width = a.offsetWidth + 'px'; ink.style.transform = 'translateX(' + a.offsetLeft + 'px)';
    }
    list.addEventListener('click', function(){ setTimeout(move, 0); });
    if(window.ResizeObserver) new ResizeObserver(move).observe(list);
    addEventListener('resize', move);
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(move);
    move();
  });
})();
