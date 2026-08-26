// ===== Mobile menu toggle =====
(function(){
  const burger = document.querySelector('.burger');
  const navUl = document.querySelector('nav ul');
  const navCta = document.querySelector('.nav-cta');
  if(!burger || !navUl) return;
  burger.addEventListener('click', () => {
    const open = navUl.style.display === 'flex';
    navUl.style.cssText = open ? '' : 'display:flex; flex-direction:column; position:fixed; top:76px; left:0; right:0; background:#0b0d10; padding:24px 32px; gap:20px; border-bottom:1px solid rgba(247,249,250,0.16); z-index:99;';
    if(navCta) navCta.style.cssText = open ? '' : 'display:block; position:fixed; top:200px; left:32px; z-index:101;';
  });
  document.querySelectorAll('nav ul a').forEach(a => a.addEventListener('click', () => {
    navUl.style.display = 'none';
    if(navCta) navCta.style.display = '';
  }));
})();

// ===== Fade-in on scroll =====
(function(){
  const targets = document.querySelectorAll('.service-row, .step, .g-item, .t-card, .principle');
  if(!targets.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting){ e.target.style.opacity = 1; e.target.style.transform = 'translateY(0)'; }
    });
  }, {threshold:0.12});
  targets.forEach(el => {
    el.style.opacity = 0; el.style.transform = 'translateY(24px)'; el.style.transition = 'opacity .7s ease, transform .7s ease';
    io.observe(el);
  });
})();

// ===== Gallery filter + lightbox =====
(function(){
  const galleryGrid = document.getElementById('galleryGrid');
  if(!galleryGrid) return;
  const filterBtns = document.querySelectorAll('.gal-f');
  const galItems = Array.from(galleryGrid.querySelectorAll('.g-item'));

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      galItems.forEach(item => {
        item.classList.toggle('hidden', !(f === 'all' || item.dataset.cat === f));
      });
    });
  });

  const lightbox = document.getElementById('lightbox');
  if(!lightbox) return;
  const lbImg = document.getElementById('lbImg');
  const lbCat = document.getElementById('lbCat');
  const lbTitle = document.getElementById('lbTitle');
  let visibleItems = [];
  let currentIdx = 0;

  function renderLightbox(){
    const item = visibleItems[currentIdx];
    const img = item.querySelector('img');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCat.textContent = item.dataset.cat;
    const titleEl = item.querySelector('.g-title');
    lbTitle.textContent = titleEl ? titleEl.textContent : '';
  }
  function openLightbox(item){
    visibleItems = galItems.filter(i => !i.classList.contains('hidden'));
    currentIdx = visibleItems.indexOf(item);
    renderLightbox();
    lightbox.classList.add('open');
  }
  galItems.forEach(item => item.addEventListener('click', () => openLightbox(item)));

  const lbClose = document.getElementById('lbClose');
  const lbNext = document.getElementById('lbNext');
  const lbPrev = document.getElementById('lbPrev');
  if(lbClose) lbClose.addEventListener('click', () => lightbox.classList.remove('open'));
  if(lbNext) lbNext.addEventListener('click', () => { currentIdx = (currentIdx + 1) % visibleItems.length; renderLightbox(); });
  if(lbPrev) lbPrev.addEventListener('click', () => { currentIdx = (currentIdx - 1 + visibleItems.length) % visibleItems.length; renderLightbox(); });
  lightbox.addEventListener('click', (e) => { if(e.target === lightbox) lightbox.classList.remove('open'); });
  document.addEventListener('keydown', (e) => {
    if(!lightbox.classList.contains('open')) return;
    if(e.key === 'Escape') lightbox.classList.remove('open');
    if(e.key === 'ArrowRight' && lbNext) lbNext.click();
    if(e.key === 'ArrowLeft' && lbPrev) lbPrev.click();
  });
})();

// ===== Video rail (nav arrows + hover-to-play thumbnails + lightbox player) =====
(function(){
  const videoRail = document.getElementById('videoRail');
  if(videoRail){
    const railPrev = document.getElementById('railPrev');
    const railNext = document.getElementById('railNext');
    const scrollAmt = () => Math.min(600, videoRail.clientWidth * 0.7);
    if(railNext) railNext.addEventListener('click', () => videoRail.scrollBy({left: scrollAmt(), behavior:'smooth'}));
    if(railPrev) railPrev.addEventListener('click', () => videoRail.scrollBy({left: -scrollAmt(), behavior:'smooth'}));
  }

  const thumbVideos = document.querySelectorAll('.v-thumb');
  thumbVideos.forEach(v => {
    const play = () => v.play().catch(()=>{});
    const stop = () => { v.pause(); v.currentTime = 0; };
    const item = v.closest('.v-item');
    if(!item) return;
    item.addEventListener('mouseenter', play);
    item.addEventListener('mouseleave', stop);
    item.addEventListener('touchstart', play, {passive:true});
    item.addEventListener('touchend', stop);
  });

  const videoLightbox = document.getElementById('videoLightbox');
  if(!videoLightbox) return;
  const vPlayer = document.getElementById('vPlayer');
  const vCat = document.getElementById('vCat');
  const vTitle = document.getElementById('vTitle');

  document.querySelectorAll('.v-item').forEach(item => {
    item.addEventListener('click', () => {
      vPlayer.src = item.dataset.video;
      const catEl = item.querySelector('.g-cat');
      vCat.textContent = catEl ? catEl.textContent : '';
      vTitle.textContent = '';
      videoLightbox.classList.add('open');
      vPlayer.play().catch(()=>{});
    });
  });
  function closeVideo(){
    videoLightbox.classList.remove('open');
    vPlayer.pause();
    vPlayer.src = '';
  }
  const vClose = document.getElementById('vClose');
  if(vClose) vClose.addEventListener('click', closeVideo);
  videoLightbox.addEventListener('click', (e) => { if(e.target === videoLightbox) closeVideo(); });
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape' && videoLightbox.classList.contains('open')) closeVideo(); });
})();

// ===== Contact form (front-end demo state; wire to your form handler's _next redirect in production) =====
(function(){
  const form = document.querySelector('form.quote');
  if(!form) return;
  form.addEventListener('submit', function(e){
    e.preventDefault();
    const btn = this.querySelector('.submit-btn');
    const original = btn.textContent;
    btn.textContent = 'Request Sent';
    btn.style.background = '#fff';
    setTimeout(()=>{ btn.textContent = original; btn.style.background = ''; }, 3000);
  });
})();
