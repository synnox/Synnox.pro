/* Ressources en ligne : icônes de technos, carte du serveur Discord (compteurs en direct) */
(function(){
  var ICONS = 'https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/';
  var STACK = [
    ['Python','python/python-original.svg'], ['C++','cplusplus/cplusplus-original.svg'],
    ['JavaScript','javascript/javascript-original.svg'], ['HTML','html5/html5-original.svg'],
    ['CSS','css3/css3-original.svg'], ['Git','git/git-original.svg'], ['GitHub','github/github-original.svg']
  ];

  /* bandeau défilant des technologies (liste dupliquée pour une boucle continue) */
  function item(t, hidden){
    return '<li'+(hidden?' aria-hidden="true"':'')+'><img src="'+ICONS+t[1]+'" alt="" width="26" height="26" loading="lazy" onerror="this.parentNode.style.display=\'none\'"><span>'+t[0]+'</span></li>';
  }
  var html = '<ul class="stack-track" aria-label="Technologies">'+
    STACK.map(function(t){return item(t,false);}).join('')+
    STACK.map(function(t){return item(t,true);}).join('')+'</ul>';
  Array.prototype.forEach.call(document.querySelectorAll('.stack'), function(el){ el.innerHTML = html; });

  /* carte du serveur Discord : nom, icône, membres et connectés en direct */
  var panel = document.getElementById('panel-reseaux');
  if(!panel) return;
  fetch('https://discord.com/api/v9/invites/344pkQeu2q?with_counts=true')
    .then(function(r){ if(!r.ok) throw 0; return r.json(); })
    .then(function(d){
      var g = d.guild; if(!g) return;
      var icon = g.icon ? 'https://cdn.discordapp.com/icons/'+g.id+'/'+g.icon+(g.icon.indexOf('a_')===0?'.gif':'.png')+'?size=96' : '';
      var card = document.createElement('a');
      card.className = 'server-card';
      card.href = 'https://discord.gg/344pkQeu2q'; card.target = '_blank'; card.rel = 'noopener noreferrer';
      card.setAttribute('aria-label','Rejoindre le serveur '+g.name);
      card.innerHTML =
        (icon ? '<img src="'+esc(icon)+'" alt="" width="48" height="48">' : '')+
        '<div class="server-info"><div class="server-name">'+esc(g.name)+'</div>'+
        '<div class="server-stats"><span class="live-dot" aria-hidden="true"></span>'+
        esc(d.approximate_presence_count)+' en ligne · '+esc(d.approximate_member_count)+' membres</div></div>'+
        '<span class="server-join">Rejoindre</span>';
      panel.insertBefore(card, panel.firstChild);
    })
    .catch(function(){ /* hors ligne ou bloqué : la carte n'est simplement pas affichée */ });
})();

/* Fiches projets (mode Entreprise). Pour ajouter une capture : img:'./assets/img/mon-projet.png' */
(function(){
  var box = document.getElementById('projectCards'); if(!box) return;
  var PROJECTS = [
    { repo:'web-template', title:'Web Template', desc:'Modèle de site web', img:'' },
    { repo:'Sn-Hub',       title:'Sn Hub',       desc:'Plateforme communautaire Discord', img:'' }
  ];
  var COLORS = {JavaScript:'#f1e05a',Python:'#3572A5','C++':'#f34b7d',HTML:'#e34c26',CSS:'#563d7c',TypeScript:'#3178c6',C:'#555555'};
  box.innerHTML = PROJECTS.map(function(p){
    return '<article class="project">'+
      (p.img ? '<img class="project-img" src="'+esc(p.img)+'" alt="" loading="lazy">' : '')+
      '<div class="project-body"><h3>'+esc(p.title)+'</h3><p>'+esc(p.desc)+'</p><div class="project-meta" data-repo="'+esc(p.repo)+'"></div></div>'+
      '<a class="project-link" href="https://github.com/synnox/'+esc(p.repo)+'" target="_blank" rel="noopener noreferrer"><span>Voir le code</span><i class="fas fa-arrow-right" aria-hidden="true"></i></a></article>';
  }).join('');
  function fill(){
    var repos = null; try{ repos = (JSON.parse(localStorage.getItem('synnox_github_repos_v1'))||{}).repos; }catch(e){}
    if(!Array.isArray(repos)) return;
    box.querySelectorAll('.project-meta').forEach(function(el){
      var r = repos.filter(function(x){ return x && x.name === el.dataset.repo; })[0];
      if(r && r.language) el.innerHTML = '<span class="repo-lang"><span class="repo-dot" style="background:'+(COLORS[r.language]||'#888')+'"></span>'+esc(r.language)+'</span>';
    });
  }
  fill(); setTimeout(fill, 1800); setTimeout(fill, 5000);
})();
