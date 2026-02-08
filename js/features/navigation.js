/**
 * Navigation Controller - MICA NOIR
 * Handles mobile toggle, scroll effects, and active states
 */

(function() {
  'use strict';

  function initNavigation() {
  const nav = document.getElementById('main-nav');
  const toggle = document.getElementById('nav-toggle');
  const links = document.querySelector('.nav__links');
  
  if (!nav || !toggle || !links) return;
  
  // Mobile toggle
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('nav__toggle--active');
    links.classList.toggle('nav__links--open');
    document.body.style.overflow = links.classList.contains('nav__links--open') ? 'hidden' : '';
  });
  
  // Close menu on link click (mobile)
  links.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('nav__toggle--active');
      links.classList.remove('nav__links--open');
      document.body.style.overflow = '';
    });
  });
  
  // Scroll effect
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    
    if (currentScroll > 50) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
    
    lastScroll = currentScroll;
  }, { passive: true });
  
  // Scroll Spy & Active Link
  const observerOptions = {
    root: null,
    rootMargin: '-10% 0px -10% 0px', // Trigger when section is central
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        // Map view IDs to routes (e.g. view-home -> #/)
        let hash = '#/';
        if (id === 'view-gallery') hash = '#/galeria';
        else if (id === 'view-archivo') hash = '#/galeria';
        else if (id === 'view-exposiciones') hash = '#/exposiciones';
        else if (id === 'view-about') hash = '#/about';
        else if (id === 'view-contacto') hash = '#/contacto';
        
        // Update active class
        links.querySelectorAll('.nav__link').forEach(link => {
          if (link.getAttribute('href') === hash) {
            link.classList.add('nav__link--active');
          } else {
            link.classList.remove('nav__link--active');
          }
        });

        // Update URL efficiently without jumping
        if (history.replaceState) {
          history.replaceState(null, null, hash);
        }
      }
    });
  }, observerOptions);

  document.querySelectorAll('.view').forEach(section => {
    observer.observe(section);
  });
  
  // Update on hash change (from clicks)
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash || '#/';
    links.querySelectorAll('.nav__link').forEach(link => {
      link.classList.toggle('nav__link--active', link.getAttribute('href') === hash);
    });
  });
  }

  // Auto-init when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
  } else {
    initNavigation();
  }

})();
