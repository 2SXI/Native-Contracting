// ===== Mobile menu toggle =====
(function(){
  const burger = document.querySelector('.burger');
  const navUl = document.querySelector('nav ul');
  const navCta = document.querySelector('.nav-cta');
  if(!burger || !navUl) return;

  // Give the CTA a home inside the menu list itself, so it scrolls/flows
  // with the links instead of floating at a fixed pixel position on top of them.
  let ctaHolder = null;
  if(navCta){
    ctaHolder = document.createElement('li');
    ctaHolder.className = 'nav-cta-item';
  }

  function closeMenu(){
    navUl.classList.remove('nav-open');
    if(ctaHolder && ctaHolder.parentNode === navUl){
      navUl.removeChild(ctaHolder);
    }
    if(navCta && ctaHolder && navCta.parentNode === ctaHolder){
      // put the CTA back where it originally lived, right after the nav element
      navUl.parentNode.insertBefore(navCta, burger);
    }
  }

  function openMenu(){
    navUl.classList.add('nav-open');
    if(navCta && ctaHolder){
      ctaHolder.appendChild(navCta);
      navUl.appendChild(ctaHolder);
    }
  }

  burger.addEventListener('click', () => {
    const isOpen = navUl.classList.contains('nav-open');
    if(isOpen){ closeMenu(); } else { openMenu(); }
  });

  document.querySelectorAll('nav ul a').forEach(a => a.addEventListener('click', closeMenu));
  if(navCta) navCta.addEventListener('click', closeMenu);
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

// ===== Landing page gallery preview: filter tabs + click to full gallery =====
(function(){
  const grid = document.getElementById('gpGrid');
  if(!grid) return;
  const tabs = document.querySelectorAll('.gp-tab');
  const items = Array.from(grid.querySelectorAll('.g-item'));

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const f = tab.dataset.filter;
      items.forEach(item => {
        item.classList.toggle('hidden', !(f === 'all' || item.dataset.cat === f));
      });
    });
  });

  items.forEach(item => {
    item.addEventListener('click', () => { window.location.href = 'gallery.html'; });
  });
})();

// ===== Ask Assistant (client-side FAQ matching) =====
(function(){
  const fab = document.getElementById('askFab');
  const panel = document.getElementById('askPanel');
  const closeBtn = document.getElementById('askClose');
  const body = document.getElementById('askBody');
  const form = document.getElementById('askForm');
  const input = document.getElementById('askInput');
  const chips = document.querySelectorAll('.ask-chip');
  if(!fab || !panel || !form) return;

  const KB = [
    {
      keywords: ['area','areas','cover','coverage','location','suburb','suburbs','where','belvedere','avondale','borrowdale','mount pleasant','harare'],
      answer: "We work across Harare and surrounding suburbs including Belvedere, Avondale, Borrowdale and Mount Pleasant. Our head office is at 55 Lawley Avenue, Belvedere. <a href=\"contact.html\">Contact us</a> to confirm coverage for your specific location."
    },
    {
      keywords: ['quote','estimate','price','pricing','cost','how much','get a quote'],
      answer: "Call or WhatsApp us on +263 776 229 503, email info@nativecon.co.zw, or fill out the form on our <a href=\"contact.html\">Contact page</a> and we'll arrange a free site visit."
    },
    {
      keywords: ['registered','registration','insured','insurance','nssa','cifoz','nec','zimra','legit','legal','compliant','compliance'],
      answer: "Yes — we're registered with NSSA, the Construction Industry Federation of Zimbabwe (CIFOZ), the National Employment Council (NEC), and ZIMRA. This covers our crews and protects your project."
    },
    {
      keywords: ['boq','bill of quantities','accurate','accuracy','guarantee','sue','final invoice','change','revise'],
      answer: "Every project starts with a site visit followed by a formal, itemised bill of quantities (BOQ) so you have a clear estimate of scope and cost up front. Because on-site conditions and client-requested changes can affect a build, the BOQ may be revised if the scope changes once work is underway — we'll always discuss any changes with you first."
    },
    {
      keywords: ['subcontract','subcontractor','own crew','who does the work','workers','staff'],
      answer: "No — we use our own supervised crews for structural, civil and finishing work, so the people on your site are directly accountable to us, not an outside subcontractor."
    },
    {
      keywords: ['service','services','offer','what do you do','building','paving','plumbing','roofing','aluminium','landscaping','durawall','tiling','painting','renovation','demolition','cement'],
      answer: "We offer architectural design and BOQs, building, paving and driveways, plumbing and reticulation, roofing, aluminium works, landscaping, Durawalls, tiling, painting, renovations, demolition and cement supply. See the full list on our <a href=\"services.html\">Services page</a>."
    },
    {
      keywords: ['how long','timeline','duration','time','weeks','months','renovation time'],
      answer: "Timelines vary by scope — a bathroom or paving job may take days, while a full renovation can take several weeks to months. We'll give you a project timeline as part of your BOQ."
    },
    {
      keywords: ['gallery','photos','pictures','examples','previous work','portfolio','video'],
      answer: "Yes — visit our <a href=\"gallery.html\">Gallery page</a> for photos and video footage of completed and active projects across Harare."
    },
    {
      keywords: ['contact','phone','number','call','whatsapp','email','office','address'],
      answer: "You can reach us on +263 776 229 503 (call/WhatsApp), info@nativecon.co.zw, or visit us at 55 Lawley Avenue, Belvedere, Harare. Full details on our <a href=\"contact.html\">Contact page</a>."
    },
    {
      keywords: ['hours','open','opening','closing','time open','when open'],
      answer: "Our office hours are Monday – Friday, 8:00 – 17:00. You can still WhatsApp or email us outside those hours and we'll respond as soon as we're back."
    },
    {
      keywords: ['company','name','trading','native contracting','native construction'],
      answer: "We're Native Contracting Zimbabwe, trading as Native Construction — a Harare-based building and civil works contractor."
    }
  ];

  const FALLBACK = "I don't have a direct answer for that yet. You can reach the team on WhatsApp (+263 776 229 503) or through our <a href=\"contact.html\">Contact page</a> and they'll help you personally.";

  function addMsg(text, cls){
    const div = document.createElement('div');
    div.className = 'ask-msg ' + cls;
    div.innerHTML = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function findAnswer(q){
    const query = q.toLowerCase();
    let best = null, bestScore = 0;
    KB.forEach(entry => {
      let score = 0;
      entry.keywords.forEach(k => { if(query.includes(k)) score += k.split(' ').length; });
      if(score > bestScore){ bestScore = score; best = entry; }
    });
    return bestScore > 0 ? best.answer : FALLBACK;
  }

  function ask(text){
    if(!text.trim()) return;
    addMsg(text.replace(/</g,'&lt;'), 'user');
    setTimeout(() => addMsg(findAnswer(text), 'bot'), 350);
  }

  function openPanel(){ panel.classList.add('open'); input && input.focus(); }
  function closePanel(){ panel.classList.remove('open'); }

  fab.addEventListener('click', () => {
    panel.classList.contains('open') ? closePanel() : openPanel();
  });
  if(closeBtn) closeBtn.addEventListener('click', closePanel);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = input.value;
    input.value = '';
    ask(val);
  });

  chips.forEach(chip => {
    chip.addEventListener('click', () => ask(chip.dataset.q));
  });
})();

// ===== Back to top button =====
(function(){
  const btn = document.getElementById('toTop');
  if(!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 500);
  }, {passive:true});
  btn.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
})();

// ===== Animated stat counters (hero snapshot) =====
(function(){
  const stats = document.querySelectorAll('.hero-stats .n');
  if(!stats.length) return;
  const parsed = Array.from(stats).map(el => {
    const raw = el.textContent.trim();
    const match = raw.match(/^(\d+)(.*)$/);
    return match ? {el, target:parseInt(match[1],10), suffix:match[2]} : null;
  }).filter(Boolean);
  if(!parsed.length) return;

  function animate(item){
    const duration = 1100;
    const start = performance.now();
    function tick(now){
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = Math.round(item.target * eased);
      item.el.textContent = val + item.suffix;
      if(progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if(e.isIntersecting){
        parsed.forEach(animate);
        obs.disconnect();
      }
    });
  }, {threshold:0.4});
  io.observe(stats[0].closest('.hero-stats'));
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
