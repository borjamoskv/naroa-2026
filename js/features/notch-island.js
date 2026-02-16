/**
 * NOTCH — ISLA MÁGICA
 * Dynamic Island-style navigation for naroa.online
 * 
 * Collapsed: Shows current section + scroll progress ring
 * Expanded: Full nav + MICA quick input
 * Contextual: Morphs based on what's happening
 */

(function() {
  'use strict';

  const SECTIONS = [
    { id: 'view-hero',        hash: '#/',            icon: '◈', label: 'Inicio',      hint: '' },
    { id: 'view-galeria',     hash: '#/galeria',     icon: '◐', label: 'Galería',     hint: 'Obras' },
    { id: 'view-exposiciones',hash: '#/exposiciones',icon: '▣', label: 'Exposiciones', hint: '' },
    { id: 'view-blog',        hash: '#/blog',        icon: '▤', label: 'Blog',        hint: '' },
    { id: 'view-juegos',      hash: '#/juegos',      icon: '◇', label: 'Juegos',      hint: '' },
    { id: 'view-contacto',    hash: '#/contacto',    icon: '◌', label: 'Contacto',    hint: '' }
  ];

  let notchEl = null;
  let isExpanded = false;
  let currentSection = SECTIONS[0];

  function createNotch() {
    // Remove any existing notch
    const existing = document.querySelector('.notch');
    if (existing) existing.remove();

    notchEl = document.createElement('div');
    notchEl.className = 'notch';
    notchEl.id = 'magic-notch';
    notchEl.setAttribute('role', 'navigation');
    notchEl.setAttribute('aria-label', 'Navegación principal');

    notchEl.innerHTML = `
      <!-- Collapsed view -->
      <div class="notch__dot"></div>
      <span class="notch__label">
        <span class="notch__icon">${currentSection.icon}</span>
        <span class="notch__label-text">${currentSection.label}</span>
      </span>
      <svg class="notch__progress" viewBox="0 0 20 20">
        <circle class="notch__progress-circle" cx="10" cy="10" r="7"/>
        <circle class="notch__progress-bar" cx="10" cy="10" r="7"/>
      </svg>
      
      <!-- Close button -->
      <button class="notch__close" aria-label="Cerrar menú">✕</button>
      
      <!-- Expanded: Nav links -->
      <nav class="notch__nav">
        ${SECTIONS.map(s => `
          <a href="${s.hash}" class="notch__link${s.id === currentSection.id ? ' active' : ''}" data-section="${s.id}">
            <span class="notch__link-icon">${s.icon}</span>
            <span class="notch__link-label">${s.label}</span>
            ${s.hint ? `<span class="notch__link-hint">${s.hint}</span>` : ''}
          </a>
        `).join('')}
      </nav>
      
      <!-- Expanded: MICA Quick Input -->
      <div class="notch__mica">
        <input 
          type="text" 
          class="notch__mica-input" 
          placeholder="💬 Pregunta a MICA..." 
          aria-label="Pregunta a MICA"
        />
      </div>
    `;

    document.body.appendChild(notchEl);
    bindEvents();
    startScrollProgress();
    observeSections();
  }

  function bindEvents() {
    // Toggle expand/collapse on click (collapsed state)
    notchEl.addEventListener('click', (e) => {
      // Don't toggle if clicking a link, input, or close button
      if (e.target.closest('.notch__link') || 
          e.target.closest('.notch__mica-input') ||
          e.target.closest('.notch__close')) return;
      
      if (!isExpanded) {
        expand();
      }
    });

    // Close button
    const closeBtn = notchEl.querySelector('.notch__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        collapse();
      });
    }

    // Nav link clicks
    notchEl.querySelectorAll('.notch__link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const hash = link.getAttribute('href');
        const sectionId = link.dataset.section;
        
        // Navigate
        navigateToSection(sectionId, hash);
        
        // Update active state
        notchEl.querySelectorAll('.notch__link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Collapse after short delay
        setTimeout(() => collapse(), 300);
      });
    });

    // MICA input
    const micaInput = notchEl.querySelector('.notch__mica-input');
    if (micaInput) {
      micaInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && micaInput.value.trim()) {
          const query = micaInput.value.trim();
          if (query.toLowerCase().includes('juego') || query.toLowerCase().includes('sphere') || query.toLowerCase().includes('weaver')) {
            if (window.MicaOrganicSphere) {
              window.MicaOrganicSphere.open();
              micaInput.value = '';
              collapse();
              return;
            }
          }
          
          // Dispatch to MICA if available
          if (window.MICA && window.MICA.processQuery) {
            window.MICA.processQuery(query);
          }
          micaInput.value = '';
          collapse();
        }
      });
      
      // Prevent collapse when focusing input
      micaInput.addEventListener('focus', (e) => e.stopPropagation());
    }

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (isExpanded && !notchEl.contains(e.target)) {
        collapse();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isExpanded) {
        collapse();
      }
    });
  }

  function expand() {
    isExpanded = true;
    notchEl.classList.add('expanded');
    // Focus MICA input after animation
    setTimeout(() => {
      const input = notchEl.querySelector('.notch__mica-input');
      if (input) input.focus();
    }, 400);
  }

  function collapse() {
    isExpanded = false;
    notchEl.classList.remove('expanded');
  }

  function navigateToSection(sectionId, hash) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', hash);
    }
  }

  function updateLabel(section) {
    currentSection = section;
    const iconEl = notchEl.querySelector('.notch__icon');
    const textEl = notchEl.querySelector('.notch__label-text');
    if (iconEl) iconEl.textContent = section.icon;
    if (textEl) textEl.textContent = section.label;
    
    // Update active nav link
    notchEl.querySelectorAll('.notch__link').forEach(link => {
      link.classList.toggle('active', link.dataset.section === section.id);
    });
  }

  function startScrollProgress() {
    const progressBar = notchEl.querySelector('.notch__progress-bar');
    if (!progressBar) return;

    const circumference = 2 * Math.PI * 7; // r=7
    progressBar.style.strokeDasharray = circumference;
    let ticking = false;
    
    function update() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      const offset = circumference - (progress * circumference);
      progressBar.style.strokeDashoffset = offset;
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    // Initial update
    update();
  }

  function observeSections() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
          const section = SECTIONS.find(s => s.id === entry.target.id);
          if (section && section.id !== currentSection.id) {
            updateLabel(section);
          }
        }
      });
    }, { threshold: [0.3, 0.5, 0.7] });

    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
  }

  // ─── Hide old navigation ───
  function hideOldNav() {
    const oldNav = document.querySelector('.nav-mobile, .main-nav, header nav');
    if (oldNav) {
      oldNav.style.display = 'none';
    }
  }

  // ─── INIT ───
  function init() {
    createNotch();
    hideOldNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.MagicNotch = { expand, collapse, navigateToSection, updateLabel };

  // ─── MAGNETIC PHYSICS ───
  function initMagneticPhysics() {
    const threshold = 150; // Distance to trigger magnetic effect
    const magneticPower = 0.3; // Strength of attraction

    window.addEventListener('mousemove', (e) => {
      if (isExpanded || !notchEl) return; // Disable when expanded

      const rect = notchEl.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < threshold) {
        // Move notch towards mouse
        const moveX = dx * magneticPower;
        const moveY = dy * magneticPower;

        gsap.to(notchEl, {
          x: moveX,
          y: moveY,
          duration: 0.5,
          ease: 'power3.out'
        });
      } else {
        // Snap back
        gsap.to(notchEl, {
          x: 0,
          y: 0,
          duration: 1.2,
          ease: 'elastic.out(1, 0.3)'
        });
      }
    });

    // Reset on mouse leave window
    document.addEventListener('mouseleave', () => {
      if (!isExpanded && notchEl) {
        gsap.to(notchEl, { x: 0, y: 0, duration: 1.2, ease: 'elastic.out(1, 0.3)' });
      }
    });
  }

  // Initialize physics after creation
  const originalInit = init;
  init = function() {
    originalInit();
    initMagneticPhysics();
  };

})();
