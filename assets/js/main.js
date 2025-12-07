// assets/js/work.js
// Combined, cleaned, and robust site & Work page JS
// - downloadResume (global, used by header onclick)
// - reveal on scroll (IntersectionObserver fallback)
// - stats counter animation (IntersectionObserver fallback)
// - mobile nav toggle + ESC handling
// - section scrollspy (anchor-section elements)
// - work-page filtering with deep-link support (accepts #exec OR #cat-exec)
// - respectful of reduced-motion via CSS; minimal DOM ops

(function () {
  'use strict';

  /* =========================
     Resume download (global)
     ========================= */
  window.downloadResume = function downloadResume(event) {
    if (event && event.preventDefault) event.preventDefault();

    try {
      if (window.gtag) {
        window.gtag('event', 'resume_download', {
          event_category: 'engagement',
          event_label: 'Resume PDF',
          value: 1
        });
      }
    } catch (e) {
      // gtag may not exist — ignore
    }

    // Force download
    const a = document.createElement('a');
    a.href = 'AbuRahatSabir-Resume.pdf';
    a.download = 'AbuRahatSabir-Resume.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  /* =========================
     DOM Ready: main behavior
     ========================= */
  document.addEventListener('DOMContentLoaded', function () {
    //
    // 1) Reveal on scroll (IntersectionObserver)
    //
    (function initRevealOnScroll() {
      const revealElements = document.querySelectorAll('.reveal');
      if (!revealElements.length) return;

      if ('IntersectionObserver' in window) {
        const revealOptions = {
          threshold: 0.12,
          rootMargin: '0px 0px -50px 0px'
        };

        const revealOnScroll = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          });
        }, revealOptions);

        revealElements.forEach(el => revealOnScroll.observe(el));
      } else {
        revealElements.forEach(el => el.classList.add('active'));
      }
    })();


    //
    // 2) Stats counter animation
    //
    (function initStats() {
      const stats = document.querySelectorAll('.stat-number');
      const statsSection = document.querySelector('.stats-section');
      if (!stats.length || !statsSection) return;

      let hasAnimatedStats = false;

      function animateStats() {
        if (hasAnimatedStats) return;
        hasAnimatedStats = true;

        stats.forEach(counter => {
          const target = Number(counter.getAttribute('data-target')) || 0;
          const suffix = counter.getAttribute('data-suffix') || '';
          const duration = 1800;
          const startTime = performance.now();

          const updateCount = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOutQuad = 1 - (1 - progress) * (1 - progress);
            const currentValue = Math.round(easeOutQuad * target);

            counter.innerText = currentValue + suffix;

            if (progress < 1) {
              requestAnimationFrame(updateCount);
            } else {
              counter.innerText = target + suffix;
            }
          };

          requestAnimationFrame(updateCount);
        });
      }

      if ('IntersectionObserver' in window) {
        const statsObserver = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              animateStats();
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.2 });

        statsObserver.observe(statsSection);
      } else {
        animateStats();
      }
    })();


    //
    // 3) Mobile nav toggle + ESC + close-on-link
    //
    (function initNavToggle() {
      const navToggle = document.querySelector('.nav-toggle');
      const topNav = document.querySelector('.top-nav');
      const navLinks = document.querySelectorAll('.top-nav a');

      function closeNav() {
        if (!navToggle || !topNav) return;
        navToggle.setAttribute('aria-expanded', 'false');
        topNav.classList.remove('is-open');
      }

      function toggleNav() {
        if (!navToggle || !topNav) return;
        const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', String(!isOpen));
        topNav.classList.toggle('is-open', !isOpen);
      }

      if (!navToggle || !topNav) return;

      navToggle.addEventListener('click', toggleNav);

      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          if (window.innerWidth <= 768) closeNav();
        });
      });

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeNav();
      });
    })();


    //
    // 4) Active section highlighting (scrollspy)
    //    - sections must have class 'anchor-section' and IDs
    //
    (function initScrollSpy() {
      const sections = document.querySelectorAll('section.anchor-section[id]');
      if (!sections.length) return;

      const navLinks = document.querySelectorAll('.top-nav a');
      const navLinkMap = new Map();

      navLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        if (href.startsWith('#')) {
          navLinkMap.set(href.slice(1), link);
        } else if (href.includes('#')) {
          // e.g. index.html#about
          const id = href.split('#').pop();
          navLinkMap.set(id, link);
        }
      });

      if ('IntersectionObserver' in window) {
        const sectionObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const id = entry.target.getAttribute('id');
            if (!id) return;

            navLinks.forEach(link => link.classList.remove('active'));
            const activeLink = navLinkMap.get(id);
            if (activeLink) activeLink.classList.add('active');
          });
        }, { threshold: 0.4 });

        sections.forEach(section => sectionObserver.observe(section));
      }
    })();


    //
    // 5) Work page: filtering logic + deep-link handling
    //
    (function initWorkFiltering() {
      const filterBtns = Array.from(document.querySelectorAll('.filter-btn'));
      const cards = Array.from(document.querySelectorAll('.project-card'));
      const gridEl = document.getElementById('projects-grid');
      const emptyEl = document.getElementById('empty');
      const ANIM_CLASS = 'fade-in';
      const HIDDEN_CLASS = 'hidden';

      if (!filterBtns.length || !cards.length) {
        return; // nothing to do on pages without these elements
      }

      // Helper: set active button aria states
      function setActiveButton(category) {
        filterBtns.forEach(b => {
          const match = b.dataset.filter === category;
          b.classList.toggle('active', match);
          b.setAttribute('aria-selected', match ? 'true' : 'false');
        });
      }

      // Helper: show/hide cards
      function showCardsFor(category) {
        let visible = 0;
        cards.forEach(card => {
          // reset animation
          card.classList.remove(ANIM_CLASS);
          void card.offsetWidth; // reflow

          const matches = (category === 'all') || (card.dataset.category === category);
          if (matches) {
            card.classList.remove(HIDDEN_CLASS);
            card.classList.add(ANIM_CLASS);
            visible++;
          } else {
            card.classList.add(HIDDEN_CLASS);
          }
        });

        if (gridEl && emptyEl) {
          if (visible === 0) {
            gridEl.style.display = 'none';
            emptyEl.hidden = false;
          } else {
            gridEl.style.display = '';
            emptyEl.hidden = true;
          }
        }

        // Update aria-live label if present
        if (gridEl) {
          const msg = visible === 1 ? '1 project shown' : `${visible} projects shown`;
          gridEl.setAttribute('aria-label', 'Work grid — ' + msg);
        }

        return visible;
      }

      // Update hash (use simple format: #<category>)
      function updateHash(category) {
        // use replaceState so we don't create extra history entries
        if (category === 'all') {
          history.replaceState(null, '', window.location.pathname + window.location.search);
        } else {
          history.replaceState(null, '', '#'+category);
        }
      }

      // Core: apply filter
      function applyFilter(category, options = { updateHash: true }) {
        setActiveButton(category);
        showCardsFor(category);
        if (options.updateHash) updateHash(category);
      }

      // Wire buttons
      filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
          const category = this.dataset.filter || 'all';
          applyFilter(category, { updateHash: true });
        });
      });

      // Accept both '#cat-automation' or '#automation' on load
      (function initFromHash() {
        let raw = (window.location.hash || '').replace('#', '');
        if (!raw) {
          applyFilter('all', { updateHash: false });
          return;
        }

        // tolerate `cat-` prefix
        if (raw.startsWith('cat-')) raw = raw.replace('cat-', '');

        // validate
        const valid = filterBtns.some(b => b.dataset.filter === raw);
        if (!valid) {
          applyFilter('all', { updateHash: false });
        } else {
          applyFilter(raw, { updateHash: false });
          // ensure we scroll to top of grid if deep link came from another page
          if (gridEl) gridEl.scrollIntoView({ behavior: 'instant' in document ? 'instant' : 'auto', block: 'start' });
        }
      })();

      // expose small API
      window.ARS_Work = {
        applyFilter,
        getCategories: () => filterBtns.map(b => b.dataset.filter)
      };
    })();

  }); // end DOMContentLoaded

})(); // end IIFE
