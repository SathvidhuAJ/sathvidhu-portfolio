(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  const techStack = $('#techStack');
  TECH_STACK.forEach(([name, desc, icon]) => {
    const card = document.createElement('div');
    card.className = 'tech-card reveal';
    card.innerHTML = `<div class="tech-icon">${icon.slice(0,2).toUpperCase()}</div><div><strong>${name}</strong><small>${desc}</small></div>`;
    techStack.appendChild(card);
  });

  const filters = $('#filters');
  const categories = ['All', ...new Set(PROJECTS.map(p => p.category))];
  let activeFilter = 'All';
  categories.forEach(category => {
    const button = document.createElement('button');
    button.className = `filter ${category === activeFilter ? 'active' : ''}`;
    button.textContent = category;
    button.dataset.filter = category;
    button.type = 'button';
    button.addEventListener('click', () => {
      activeFilter = category;
      $$('.filter').forEach(b => b.classList.toggle('active', b === button));
      renderProjects();
    });
    filters.appendChild(button);
  });

  const track = $('#projectTrack');
  function artFor(project) {
    const artClass = project.image === 'walleto' ? 'art-walleto' : project.image === 'rj' ? 'art-rj' : project.image === 'driveflow' ? 'art-drive' : '';
    return `<div class="project-art ${artClass}"><div class="project-art-inner"><div class="art-top"><i></i><i></i><i></i></div><div class="art-body"><div class="art-title">${project.name}</div><div class="art-row"><div class="art-box wide"><div class="art-line"></div><div class="art-line short"></div></div><div class="art-box"></div></div><div class="art-row"><div class="art-box"></div><div class="art-box wide"></div></div></div>${project.name === 'SeatTreat' ? '<div class="art-seat">S3 • Verified</div>' : ''}</div></div>`;
  }

  function renderProjects() {
    const visible = activeFilter === 'All' ? PROJECTS : PROJECTS.filter(p => p.category === activeFilter);
    $('#projectCount').textContent = `${String(visible.length).padStart(2,'0')} projects`;
    track.innerHTML = visible.map((p, i) => `<article class="project-card reveal" data-project="${PROJECTS.indexOf(p)}"><div class="project-visual">${artFor(p)}</div><div class="project-body"><div class="project-top"><span class="project-category">${p.type}</span><span class="project-index">${String(i+1).padStart(2,'0')}</span></div><h3>${p.name}</h3><p class="project-desc">${p.description}</p><div class="tech-tags">${p.technologies.map(t => `<span class="tech-tag">${t}</span>`).join('')}</div><div class="project-actions"><button class="mini-btn primary view-project" type="button">View Project ↗</button>${p.github ? `<a class="mini-btn" href="${p.github}" target="_blank" rel="noreferrer">GitHub ↗</a>` : ''}${p.liveDemo ? `<a class="mini-btn" href="${p.liveDemo}" target="_blank" rel="noreferrer">Live Demo ↗</a>` : ''}</div></div></article>`).join('');
    $$('.view-project', track).forEach(button => button.addEventListener('click', e => openModal(Number(e.currentTarget.closest('.project-card').dataset.project))));
    observeReveals(track);
  }
  renderProjects();

  let down = false, startX = 0, scrollLeft = 0;
  track.addEventListener('pointerdown', e => { down = true; track.classList.add('dragging'); startX = e.clientX; scrollLeft = track.scrollLeft; track.setPointerCapture(e.pointerId); });
  track.addEventListener('pointermove', e => { if (!down) return; track.scrollLeft = scrollLeft - (e.clientX - startX) * 1.15; });
  ['pointerup','pointercancel','pointerleave'].forEach(evt => track.addEventListener(evt, () => { down = false; track.classList.remove('dragging'); }));

  const backdrop = $('#modalBackdrop');
  function openModal(index) {
    const p = PROJECTS[index];
    $('#modalCategory').textContent = p.category + ' / ' + p.type;
    $('#modalTitle').textContent = p.name;
    $('#modalDescription').textContent = p.description;
    $('#modalProblem').textContent = p.problem;
    $('#modalSolution').textContent = p.solution;
    $('#modalFeatures').innerHTML = p.features.map(f => `<li>${f}</li>`).join('');
    $('#modalTech').innerHTML = p.technologies.map(t => `<span class="tech-tag">${t}</span>`).join('');
    $('#modalVisual').innerHTML = artFor(p).replace('project-art','project-art modal-art');
    const actions = [];
    if (p.github) actions.push(`<a class="btn btn-ghost" href="${p.github}" target="_blank" rel="noreferrer">GitHub ↗</a>`);
    if (p.liveDemo) actions.push(`<a class="btn btn-primary" href="${p.liveDemo}" target="_blank" rel="noreferrer">Live Demo ↗</a>`);
    $('#modalActions').innerHTML = actions.join('');
    backdrop.classList.add('open'); backdrop.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; $('#modalClose').focus();
  }
  function closeModal(){backdrop.classList.remove('open');backdrop.setAttribute('aria-hidden','true');document.body.style.overflow='';}
  $('#modalClose').addEventListener('click', closeModal); backdrop.addEventListener('click', e => { if(e.target===backdrop) closeModal(); }); document.addEventListener('keydown', e => { if(e.key==='Escape') closeModal(); });

  const menuToggle = $('#menuToggle'), navLinks = $('#navLinks');
  menuToggle.addEventListener('click', () => { const open = navLinks.classList.toggle('open'); menuToggle.setAttribute('aria-expanded', String(open)); });
  $$('.nav-link, .resume-btn').forEach(a => a.addEventListener('click', () => { navLinks.classList.remove('open'); menuToggle.setAttribute('aria-expanded','false'); }));

  const sections = ['home','projects','contact'].map(id => document.getElementById(id));
  const navItems = $$('.nav-link');
  const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => { if(entry.isIntersecting){navItems.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#'+entry.target.id));} }), {rootMargin:'-35% 0px -55%'});
  sections.forEach(s => sectionObserver.observe(s));

  function observeReveals(root=document){
    const elements = $$('.reveal',root).filter(el => !el.dataset.observed);
    if(!('IntersectionObserver' in window)){elements.forEach(el=>el.classList.add('visible'));return;}
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}), {threshold:.1});
    elements.forEach(el=>{el.dataset.observed='1';observer.observe(el);});
  }
  observeReveals();

  const form = $('#contactForm'), status = $('#formStatus');
  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;
    const values = Object.fromEntries(new FormData(form));
    const rules = {name:['Please enter your name.', v=>v.trim().length>=2],email:['Please enter a valid email.',v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)],subject:['Please add a subject.',v=>v.trim().length>=3],message:['Please write a short message.',v=>v.trim().length>=10]};
    Object.entries(rules).forEach(([key,[msg,check]])=>{const input=form.elements[key], small=$('small',input.parentElement); const bad=!check(values[key]||''); input.classList.toggle('invalid',bad); small.textContent=bad?msg:''; if(bad)valid=false;});
    if(!valid){status.textContent='Please check the highlighted fields.';status.style.color='#bd818a';return;}
    const recipient='your@email.com';
    const subject=encodeURIComponent(values.subject); const body=encodeURIComponent(`Name: ${values.name}\nEmail: ${values.email}\n\n${values.message}`);
    status.textContent='Opening your email client…'; status.style.color='#80c99f';
    window.location.href=`mailto:${recipient}?subject=${subject}&body=${body}`;
  });
})();