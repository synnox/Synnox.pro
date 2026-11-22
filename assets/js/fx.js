/* Fond animé réactif à la souris + viseur */
(function(){
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Fond : poussière en suspension, déplacée par un courant d'air doux ---------- */
  var cv = document.createElement('canvas');
  cv.id = 'bgCanvas'; cv.setAttribute('aria-hidden','true');
  document.body.prepend(cv);
  var ctx = cv.getContext('2d'), W, H, R = 150, ps = [], col = '29,78,216';
  function setCol(){
    var h = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    if(/^#[0-9a-f]{6}$/i.test(h)) col = parseInt(h.slice(1,3),16)+','+parseInt(h.slice(3,5),16)+','+parseInt(h.slice(5,7),16);
  }
  setCol(); document.addEventListener('synnox:theme', function(){ setCol(); if(reduce) frame(0); });
  var m = { x:-9999, y:-9999, vx:0, vy:0, on:false };

  function seed(){
    var n = Math.max(50, Math.min(150, Math.round(W*H/11000)));
    ps = [];
    for(var i = 0; i < n; i++){
      ps.push({ x:Math.random()*W, y:Math.random()*H, vx:0, vy:0,
                z:.35 + Math.random()*.65, ph:Math.random()*6.28 });
    }
  }
  function resize(){
    var d = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W*d; cv.height = H*d;
    ctx.setTransform(d,0,0,d,0,0);
    seed();
    if(reduce) frame(0);
  }
  function frame(t){
    ctx.clearRect(0,0,W,H);
    m.vx *= .9; m.vy *= .9;
    for(var i = 0; i < ps.length; i++){
      var p = ps[i], glow = 0;
      if(!reduce){
        /* courant d'air lent qui varie selon la position et le temps */
        var f = Math.sin(p.x*.0028 + t*.00012) + Math.cos(p.y*.0035 - t*.00009);
        var ang = f*1.4 - .6;
        p.vx += Math.cos(ang)*.006*p.z;
        p.vy += Math.sin(ang)*.006*p.z - .0015*p.z;
        /* le curseur déplace l'air : sillage + léger écart */
        if(m.on){
          var dx = p.x - m.x, dy = p.y - m.y, d = Math.sqrt(dx*dx + dy*dy);
          if(d < R){
            var k = 1 - d/R; k *= k; glow = k;
            p.vx += (m.vx*.03 + dx/(d||1)*.12)*k*p.z;
            p.vy += (m.vy*.03 + dy/(d||1)*.12)*k*p.z;
          }
        }
        p.vx *= .97; p.vy *= .97;
        p.x += p.vx; p.y += p.vy;
        if(p.x < -10) p.x = W + 10; else if(p.x > W + 10) p.x = -10;
        if(p.y < -10) p.y = H + 10; else if(p.y > H + 10) p.y = -10;
      }
      var tw = .75 + .25*Math.sin(t*.001 + p.ph);
      var alpha = Math.min(.55, (.14 + .26*p.z)*tw + glow*.3);
      var r = .8 + p.z*1.6;
      ctx.fillStyle = 'rgba(' + col + ',' + (alpha*.18).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(p.x, p.y, r*3, 0, 6.2832); ctx.fill();   /* halo doux */
      ctx.fillStyle = 'rgba(' + col + ',' + alpha.toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.2832); ctx.fill();
    }
  }
  function loop(t){ frame(t); if(!document.hidden) requestAnimationFrame(loop); }
  addEventListener('resize', resize);
  resize();
  if(!reduce){
    requestAnimationFrame(loop);
    document.addEventListener('visibilitychange', function(){ if(!document.hidden) requestAnimationFrame(loop); });
    document.addEventListener('pointermove', function(e){
      if(m.on){ m.vx += (e.clientX - m.x)*.5; m.vy += (e.clientY - m.y)*.5; }
      m.x = e.clientX; m.y = e.clientY; m.on = true;
    });
    document.documentElement.addEventListener('mouseleave', function(){ m.on = false; });
    document.addEventListener('pointerup', function(e){ if(e.pointerType === 'touch') m.on = false; });
  }

  /* ---------- Viseur (souris uniquement) ---------- */
  if(!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  var ret = document.createElement('div'), ring = document.createElement('i'), dot = document.createElement('div');
  ret.id = 'reticle'; ring.className = 'r-ring'; dot.id = 'reticleDot';
  ret.appendChild(ring); document.body.appendChild(ret); document.body.appendChild(dot);
  var tx = -100, ty = -100, rx = -100, ry = -100, shown = false;
  var TARGET = 'a,button,input,textarea,[role="tab"],label,.modal-btn';

  document.addEventListener('pointermove', function(e){
    tx = e.clientX; ty = e.clientY;
    dot.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0)';
    if(!shown){ shown = true; rx = tx; ry = ty; document.body.classList.add('aim-on'); }
  });
  document.documentElement.addEventListener('mouseleave', function(){ shown = false; document.body.classList.remove('aim-on'); });
  document.addEventListener('mouseover', function(e){
    document.body.classList.toggle('aim-lock', !!(e.target.closest && e.target.closest(TARGET)));
  });
  document.addEventListener('mousedown', function(){ document.body.classList.add('aim-down'); });
  document.addEventListener('mouseup',   function(){ document.body.classList.remove('aim-down'); });
  (function follow(){
    var f = reduce ? 1 : .2;
    rx += (tx - rx)*f; ry += (ty - ry)*f;
    ret.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
    requestAnimationFrame(follow);
  })();
})();
