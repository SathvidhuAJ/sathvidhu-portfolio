(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  // Role Typing Effect
  const typedRoleEl = $('#typedRole');
  if (typedRoleEl && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const roles = [
      "Software Developer",
      "Full-Stack Developer",
      "Web Application Developer",
      "Backend & Cloud Developer"
    ];
    let roleIndex = 0;
    let charIndex = roles[0].length;
    let isDeleting = false;

    function typeLoop() {
      const currentRole = roles[roleIndex];
      if (isDeleting) {
        charIndex--;
        typedRoleEl.textContent = currentRole.substring(0, charIndex);
        if (charIndex === 0) {
          isDeleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
          setTimeout(typeLoop, 450);
          return;
        }
        setTimeout(typeLoop, 45);
      } else {
        charIndex++;
        typedRoleEl.textContent = currentRole.substring(0, charIndex);
        if (charIndex === currentRole.length) {
          isDeleting = true;
          setTimeout(typeLoop, 2200);
          return;
        }
        setTimeout(typeLoop, 70);
      }
    }
    setTimeout(typeLoop, 2000);
  }

  // Canvas Particles & Interactive Physics
  const canvas = $('#particleCanvas');
  if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const ctx = canvas.getContext('2d');
    let width = 0, height = 0;
    let particles = [];
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    const particleCount = isTouchDevice ? 25 : 55;
    let mouse = { x: -1000, y: -1000, active: false };

    function resizeCanvas() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    window.addEventListener('mousemove', e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      mouse.active = false;
    });

    class Particle {
      constructor() {
        this.reset(true);
      }
      reset(initial = false) {
        this.x = Math.random() * (width || window.innerWidth);
        this.y = initial ? Math.random() * (height || window.innerHeight) : (Math.random() < 0.5 ? -10 : (height || window.innerHeight) + 10);
        this.radius = Math.random() * 1.4 + 0.8;
        this.baseVx = (Math.random() - 0.5) * 0.35;
        this.baseVy = (Math.random() - 0.5) * 0.35 - 0.12;
        this.vx = this.baseVx;
        this.vy = this.baseVy;
        this.alpha = Math.random() * 0.4 + 0.15;
        this.angle = Math.random() * Math.PI * 2;
        this.angleSpeed = Math.random() * 0.02 - 0.01;
      }
      update() {
        this.angle += this.angleSpeed;
        this.vx = this.baseVx + Math.sin(this.angle) * 0.12;
        this.vy = this.baseVy + Math.cos(this.angle) * 0.12;

        if (mouse.active && !isTouchDevice) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110 && dist > 0) {
            const force = (110 - dist) / 110;
            this.x += (dx / dist) * force * 1.5;
            this.y += (dy / dist) * force * 1.5;
          }
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < -20 || this.x > width + 20 || this.y < -20 || this.y > height + 20) {
          this.reset();
        }
      }
      draw() {
        ctx.fillStyle = `rgba(110, 168, 255, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);

      // Proximity connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            const opacity = (1 - dist / 90) * 0.12;
            ctx.strokeStyle = `rgba(110, 168, 255, ${opacity})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      requestAnimationFrame(animateParticles);
    }

    animateParticles();
  }

  // Mouse Glow & Custom Cursor & Parallax
  const cursorGlow = $('#cursorGlow');
  const customCursor = $('#customCursor');
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let glowX = mouseX, glowY = mouseY;
  let cursorX = mouseX, cursorY = mouseY;

  if (!isTouchDevice && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    function renderMouseEffects() {
      glowX += (mouseX - glowX) * 0.08;
      glowY += (mouseY - glowY) * 0.08;
      if (cursorGlow) {
        cursorGlow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;
      }

      cursorX += (mouseX - cursorX) * 0.22;
      cursorY += (mouseY - cursorY) * 0.22;
      if (customCursor) {
        customCursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
      }

      // Parallax effect on data-parallax elements
      const parallaxEls = $$('[data-parallax]');
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const deltaX = (mouseX - centerX) / centerX;
      const deltaY = (mouseY - centerY) / centerY;

      parallaxEls.forEach(el => {
        const factor = parseFloat(el.dataset.parallax) || 0.04;
        const moveX = deltaX * factor * 100;
        const moveY = deltaY * factor * 100;
        el.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
      });

      requestAnimationFrame(renderMouseEffects);
    }
    requestAnimationFrame(renderMouseEffects);

    // Custom Cursor Hover Expansion
    function bindCursorHovers() {
      const hoverTargets = $$('a, button, .project-card, .tech-card, .filter-chip, .filter, .social-icon-card');
      hoverTargets.forEach(el => {
        el.addEventListener('mouseenter', () => customCursor && customCursor.classList.add('active'));
        el.addEventListener('mouseleave', () => customCursor && customCursor.classList.remove('active'));
      });
    }
    setTimeout(bindCursorHovers, 300);

    // Magnetic Buttons (2-4px movement)
    const magneticBtns = $$('.btn.magnetic, .resume-btn.magnetic');
    magneticBtns.forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const btnCenterX = rect.left + rect.width / 2;
        const btnCenterY = rect.top + rect.height / 2;
        const moveX = (e.clientX - btnCenterX) * 0.12;
        const moveY = (e.clientY - btnCenterY) * 0.12;
        btn.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  // Sliding Nav Indicator & Navbar Scroll State
  const navWrap = $('.nav-wrap');
  const navIndicator = $('#navIndicator');
  const navLinksList = $$('.nav-link');

  function updateNavIndicator() {
    const activeLink = $('.nav-link.active');
    if (activeLink && navIndicator && navLinksList.length) {
      const parentRect = activeLink.parentElement.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      navIndicator.style.left = `${linkRect.left - parentRect.left}px`;
      navIndicator.style.width = `${linkRect.width}px`;
      navIndicator.style.opacity = '1';
    }
  }

  window.addEventListener('scroll', () => {
    if (navWrap) {
      navWrap.classList.toggle('scrolled', window.scrollY > 40);
    }
  }, { passive: true });

  window.addEventListener('resize', updateNavIndicator, { passive: true });
  setTimeout(updateNavIndicator, 250);

  const sectionLinks = navLinksList.filter(link => link.hash && document.querySelector(link.hash));
  // Use native smooth scrolling and close the mobile menu after navigation.
  sectionLinks.forEach(link => link.addEventListener('click', event => {
    const target = document.querySelector(link.hash);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', link.hash);
    $('#navLinks')?.classList.remove('open');
    $('#menuToggle')?.setAttribute('aria-expanded', 'false');
  }));



  // Tech Stack Filtering & Rendering
  const techStackContainer = $('#techStack');
  const techFiltersContainer = $('#techFilters');
  const techCategories = ['All', 'Frontend', 'Backend', 'Database', 'Mobile & Cloud', 'Tools'];
  let activeTechCategory = 'All';

  if (techFiltersContainer) {
    techCategories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = `filter-chip ${cat === activeTechCategory ? 'active' : ''}`;
      btn.textContent = cat;
      btn.type = 'button';
      btn.addEventListener('click', () => {
        activeTechCategory = cat;
        $$('.filter-chip', techFiltersContainer).forEach(b => b.classList.toggle('active', b === btn));
        renderTechStack();
      });
      techFiltersContainer.appendChild(btn);
    });
  }

  function renderTechStack() {
    if (!techStackContainer) return;
    const items = activeTechCategory === 'All' 
      ? TECH_STACK 
      : TECH_STACK.filter(t => t.category === activeTechCategory);

    techStackContainer.innerHTML = items.map(t => `
      <div class="tech-card reveal" style="--brand-color: ${t.color}">
        <div class="tech-card-glow"></div>
        <div class="tech-icon-wrapper" style="color: ${t.color}">
          ${t.svg}
        </div>
        <div class="tech-info">
          <div class="tech-header">
            <strong class="tech-title">${t.name}</strong>
            <span class="tech-cat-badge">${t.category}</span>
          </div>
          <small class="tech-desc">${t.desc}</small>
        </div>
      </div>
    `).join('');

    observeReveals(techStackContainer);
  }

  renderTechStack();

  // Projects Filtering & Rendering
  function validProjectUrl(value, github = false) {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && !url.username && !url.password &&
        (!github || (url.hostname === 'github.com' && /^\/Sathvidhu\/[^/]+$/.test(url.pathname)));
    } catch { return false; }
  }
  PROJECTS.forEach(project => {
    if (!validProjectUrl(project.github, true)) project.github = '';
    if (!validProjectUrl(project.liveDemo)) project.liveDemo = '';
  });
  const filters = $('#filters');
  const categories = ['All', ...new Set(PROJECTS.map(p => p.category))];
  let activeFilter = 'All';
  if (filters) {
    categories.forEach(category => {
      const button = document.createElement('button');
      button.className = `filter ${category === activeFilter ? 'active' : ''}`;
      button.textContent = category;
      button.dataset.filter = category;
      button.type = 'button';
      button.addEventListener('click', () => {
        activeFilter = category;
        $$('.filter', filters).forEach(b => b.classList.toggle('active', b === button));
        renderProjects();
      });
      filters.appendChild(button);
    });
  }

  const track = $('#projectTrack');
  function artFor(project) {
    const artClass = project.image === 'walleto' ? 'art-walleto' : project.image === 'rj' ? 'art-rj' : project.image === 'driveflow' ? 'art-drive' : '';
    return `<div class="project-art ${artClass}"><div class="project-art-inner"><div class="art-top"><i></i><i></i><i></i></div><div class="art-body"><div class="art-title">${project.name}</div><div class="art-row"><div class="art-box wide"><div class="art-line"></div><div class="art-line short"></div></div><div class="art-box"></div></div><div class="art-row"><div class="art-box"></div><div class="art-box wide"></div></div></div>${project.name === 'SeatTreat' ? '<div class="art-seat">S3 • Verified</div>' : ''}</div></div>`;
  }

  function renderProjects() {
    if (!track) return;
    const visible = activeFilter === 'All' ? PROJECTS : PROJECTS.filter(p => p.category === activeFilter);
    const countEl = $('#projectCount');
    if (countEl) countEl.textContent = `${String(visible.length).padStart(2,'0')} projects`;

    track.innerHTML = visible.map((p, i) => `
      <article class="project-card reveal" data-project="${PROJECTS.indexOf(p)}">
        <div class="project-visual">${artFor(p)}</div>
        <div class="project-body">
          <div class="project-top">
            <span class="project-category">${p.type}</span>
          </div>
          <h3>${p.name}</h3>
          <p class="project-desc">${p.description}</p>
          <div class="tech-tags">${p.technologies.map(t => `<span class="tech-tag">${t}</span>`).join('')}</div>
          <div class="project-actions">
            <button class="mini-btn primary view-project" type="button">View Project ↗</button>
            ${p.github ? `<a class="mini-btn" href="${p.github}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>` : ''}
            ${p.liveDemo ? `<a class="mini-btn" href="${p.liveDemo}" target="_blank" rel="noopener noreferrer">Live Demo ↗</a>` : ''}
          </div>
        </div>
      </article>
    `).join('');
    
    $$('.view-project', track).forEach(button => button.addEventListener('click', e => openModal(Number(e.currentTarget.closest('.project-card').dataset.project))));
    track.scrollLeft = 0;
    observeReveals(track);
  }

  renderProjects();

  // Project Carousel Interaction Logic
  const dragHint = $('#dragHint');
  const hintText = $('#hintText');
  const prevProjectBtn = $('#prevProjectBtn');
  const nextProjectBtn = $('#nextProjectBtn');
  let hintDismissed = false;

  if (hintText) {
    hintText.textContent = isTouchDevice ? 'Swipe to explore' : 'Drag to explore';
  }

  function dismissHint() {
    if (hintDismissed) return;
    hintDismissed = true;
    if (dragHint) {
      dragHint.classList.add('fade-out');
      setTimeout(() => { dragHint.style.display = 'none'; }, 300);
    }
  }

  let discoveryDone = false;
  const projectsSection = $('#projects');
  if ('IntersectionObserver' in window && projectsSection && track) {
    const discoveryObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !discoveryDone) {
          discoveryDone = true;
          if (track.scrollLeft === 0) {
            track.classList.add('discovery-nudge');
            setTimeout(() => { track.classList.remove('discovery-nudge'); }, 1000);
          }
          discoveryObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });
    discoveryObserver.observe(projectsSection);
  }

  function scrollProjects(direction) {
    dismissHint();
    if (!track) return;
    const card = track.querySelector('.project-card');
    const cardWidth = card ? card.offsetWidth + 15 : 350;
    track.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
  }

  if (prevProjectBtn) prevProjectBtn.addEventListener('click', () => scrollProjects(-1));
  if (nextProjectBtn) nextProjectBtn.addEventListener('click', () => scrollProjects(1));

  if (track) {
    track.setAttribute('tabindex', '0');
    track.setAttribute('aria-label', 'Projects list. Use left and right arrow keys to scroll through projects.');
    track.addEventListener('keydown', e => {
      if (e.target !== track) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); scrollProjects(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); scrollProjects(1); }
    });

    let down = false, startX = 0, scrollLeft = 0;
    track.addEventListener('pointerdown', e => { 
      if (e.pointerType !== 'mouse' || e.button !== 0 || e.target.closest('a, button')) return;
      down = true; 
      track.classList.add('dragging'); 
      startX = e.clientX; 
      scrollLeft = track.scrollLeft; 
      track.setPointerCapture(e.pointerId); 
    });
    track.addEventListener('pointermove', e => { 
      if (!down) return; 
      const diff = Math.abs(e.clientX - startX);
      if (diff > 8) dismissHint();
      track.scrollLeft = scrollLeft - (e.clientX - startX) * 1.15; 
    });
    ['pointerup','pointercancel','pointerleave'].forEach(evt => track.addEventListener(evt, () => { 
      down = false; 
      track.classList.remove('dragging'); 
    }));
    track.addEventListener('scroll', () => {
      if (track.scrollLeft > 15) dismissHint();
    }, { passive: true });
  }

  const backdrop = $('#modalBackdrop');
  let modalTrigger;
  function openModal(index) {
    modalTrigger = document.activeElement;
    const p = PROJECTS[index];
    const catEl = $('#modalCategory');
    if (catEl) catEl.textContent = p.category + ' / ' + p.type;
    $('#modalTitle').textContent = p.name;
    $('#modalDescription').textContent = p.description;
    $('#modalProblem').textContent = p.problem;
    $('#modalSolution').textContent = p.solution;
    $('#modalFeatures').innerHTML = p.features.map(f => `<li>${f}</li>`).join('');
    $('#modalTech').innerHTML = p.technologies.map(t => `<span class="tech-tag">${t}</span>`).join('');
    $('#modalVisual').innerHTML = artFor(p).replace('project-art','project-art modal-art');
    const actions = [];
    if (p.github) actions.push(`<a class="btn btn-ghost" href="${p.github}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>`);
    if (p.liveDemo) actions.push(`<a class="btn btn-primary" href="${p.liveDemo}" target="_blank" rel="noopener noreferrer">Live Demo ↗</a>`);
    $('#modalActions').innerHTML = actions.join('');
    if (backdrop) {
      backdrop.inert = false;
      backdrop.classList.add('open'); backdrop.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; $('#modalClose').focus();
    }
  }
  function closeModal(){if(backdrop){modalTrigger?.focus();backdrop.inert = true;backdrop.classList.remove('open');backdrop.setAttribute('aria-hidden','true');document.body.style.overflow='';}}
  backdrop?.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const controls = $$('button, a[href]', backdrop);
    const first = controls[0], last = controls[controls.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  const closeBtn = $('#modalClose');
  if (closeBtn) closeBtn.addEventListener('click', closeModal); 
  if (backdrop) backdrop.addEventListener('click', e => { if(e.target===backdrop) closeModal(); }); 
  document.addEventListener('keydown', e => { if(e.key==='Escape') closeModal(); });

  const menuToggle = $('#menuToggle'), navLinks = $('#navLinks');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => { const open = navLinks.classList.toggle('open'); menuToggle.setAttribute('aria-expanded', String(open)); });
    $$('.nav-link, .resume-btn').forEach(a => a.addEventListener('click', () => { navLinks.classList.remove('open'); menuToggle.setAttribute('aria-expanded','false'); }));
  }

  const sections = ['home','about','techStackSection','projects','contact'].map(id => document.getElementById(id)).filter(Boolean);
  const navItems = $$('.nav-link');
  if ('IntersectionObserver' in window && sections.length) {
    const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => { 
      if(entry.isIntersecting){
        navItems.forEach(a => {
          const isCurrent = a.getAttribute('href') === '#'+entry.target.id;
          a.classList.toggle('active', isCurrent);
        });
        updateNavIndicator();
      } 
    }), {rootMargin:'-35% 0px -55%'});
    sections.forEach(s => sectionObserver.observe(s));
  }

  function observeReveals(root=document){
    const elements = $$('.reveal',root).filter(el => !el.dataset.observed);
    if(!('IntersectionObserver' in window)){elements.forEach(el=>el.classList.add('visible'));return;}
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}), {threshold:.08});
    elements.forEach(el=>{el.dataset.observed='1';observer.observe(el);});
  }
  observeReveals();

  const form = $('#contactForm'), status = $('#formStatus');
  if (form) {
    let sending = false;
    const button = $('button[type="submit"]', form);
    const buttonLabel = button.innerHTML;
    const fields = ['name', 'email', 'subject', 'message'];
    function validate(key) {
      const input = form.elements.namedItem(key);
      const value = input.value.trim();
      let error = !value ? `Please enter your ${key}.` : '';
      if (!error && key === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Please enter a valid email address.';
      if (!error && value.length > input.maxLength) error = `Please use at most ${input.maxLength} characters.`;
      input.classList.toggle('invalid', !!error);
      input.setAttribute('aria-invalid', String(!!error));
      document.getElementById(key + 'Error').textContent = error;
      return !error;
    }
    fields.forEach(key => form.elements.namedItem(key).addEventListener('input', () => {
      if (form.elements.namedItem(key).getAttribute('aria-invalid') === 'true') validate(key);
      if (!sending) status.textContent = '';
    }));
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (sending) return;
      const invalid = fields.filter(key => !validate(key));
      if (invalid.length) {
        status.textContent = 'Please check the highlighted fields.';
        status.style.color = '#e8a5af';
        form.elements.namedItem(invalid[0]).focus();
        return;
      }
      if (form.elements.namedItem('bot-field')?.value.trim()) return;
      sending = true;
      button.disabled = true;
      button.textContent = 'Sending…';
      form.setAttribute('aria-busy', 'true');
      status.textContent = 'Sending your message…';
      status.style.color = '#80c99f';
      const data = new URLSearchParams(new FormData(form));
      fields.forEach(key => data.set(key, data.get(key).trim()));
      data.set('form-name', 'contact');
      try {
        const response = await fetch(form.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: data.toString(),
          signal: AbortSignal.timeout(20000)
        });
        if (!response.ok) throw new Error('Submission failed');
        status.textContent = 'Thank you! Your message has been submitted.';
        form.reset();
      } catch (error) {
        status.style.color = '#e8a5af';
        status.textContent = error.name === 'TimeoutError'
          ? 'The request timed out. Your message may have arrived. Please email sathvidhu@gmail.com before retrying.'
          : 'Your submission could not be confirmed. Please try again or email sathvidhu@gmail.com.';
      } finally {
        sending = false;
        button.disabled = false;
        button.innerHTML = buttonLabel;
        form.removeAttribute('aria-busy');
      }
    });
  }
})();
