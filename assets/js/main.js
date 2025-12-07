// Function for Resume Download
// Defined globally so the onclick event in HTML can find it
function downloadResume(event) {
  event.preventDefault();

  // TRACKING
  if (window.gtag) {
    gtag('event', 'resume_download', {
      event_category: 'engagement',
      event_label: 'Resume PDF',
      value: 1
    });
  }

  // Force download
  const a = document.createElement('a');
  a.href = 'AbuRahatSabir-Resume.pdf';
  a.download = 'AbuRahatSabir-Resume.pdf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Main Site Logic
document.addEventListener('DOMContentLoaded', () => {

  // 1. Scroll Animation
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealOptions = {
      threshold: 0.15,
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

  // 2. Stats Counter Animation
  const stats = document.querySelectorAll('.stat-number');
  const statsSection = document.querySelector('.stats-section');
  let hasAnimatedStats = false;

  function animateStats() {
    if (hasAnimatedStats) return;
    hasAnimatedStats = true;

    stats.forEach(counter => {
      const target = Number(counter.getAttribute('data-target')) || 0;
      const suffix = counter.getAttribute('data-suffix') || '';
      const duration = 2000;
      const startTime = performance.now();

      const updateCount = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuad = 1 - (1 - progress) * (1 - progress);
        const currentValue = Math.ceil(easeOutQuad * target);
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

  if (statsSection && stats.length) {
    if ('IntersectionObserver' in window) {
      const statsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateStats();
            observer.unobserve(statsSection);
          }
        });
      }, { threshold: 0.2 });

      statsObserver.observe(statsSection);
    } else {
      animateStats();
    }
  }

  // 3. Mobile Navigation Toggle + ESC + close-on-link
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

  if (navToggle && topNav) {
    navToggle.addEventListener('click', toggleNav);

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          closeNav();
        }
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeNav();
      }
    });
  }

  // 4. Active section highlighting in nav
  const sections = document.querySelectorAll('section.anchor-section[id]');
  const navLinkMap = new Map();

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      navLinkMap.set(href.slice(1), link);
    }
  });

  if ('IntersectionObserver' in window && sections.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute('id');
        if (!id) return;

        navLinks.forEach(link => link.classList.remove('active'));
        const activeLink = navLinkMap.get(id);
        if (activeLink) {
          activeLink.classList.add('active');
        }
      });
    }, { threshold: 0.4 });

    sections.forEach(section => sectionObserver.observe(section));
  }
});





// =========================================
//  WORK PAGE LOGIC: FILTERING & DEEP LINKING
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-card');
    const emptyState = document.getElementById('empty-state');

    // Only run if we are on the work page
    if(filterBtns.length === 0) return;

    // 1. Function to Apply Filter
    function applyFilter(category, updateUrl = true) {
        let visibleCount = 0;

        // Toggle UI States
        filterBtns.forEach(btn => {
            const isSelected = btn.dataset.filter === category;
            btn.classList.toggle('active', isSelected);
            btn.setAttribute('aria-selected', isSelected);
        });

        // Show/Hide Cards
        cards.forEach(card => {
            // Reset animation for re-trigger
            card.classList.remove('fade-in');
            void card.offsetWidth; // Force reflow

            if (category === 'all' || card.dataset.category === category) {
                card.classList.remove('hidden');
                card.classList.add('fade-in');
                visibleCount++;
            } else {
                card.classList.add('hidden');
            }
        });

        // Handle Empty State
        if (emptyState) {
            emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
        }

        // Update URL Hash (Deep Linking)
        if (updateUrl) {
            const hash = category === 'all' ? ' ' : `#${category}`;
            history.replaceState(null, null, hash);
        }
    }

    // 2. Event Listeners for Buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            applyFilter(btn.dataset.filter);
        });
    });

    // 3. Check Hash on Load (Deep Linking Support)
    const hash = window.location.hash.replace('#', '');
    if (hash) {
        // Verify the hash matches a valid button to avoid errors
        const validBtn = document.querySelector(`.filter-btn[data-filter="${hash}"]`);
        if (validBtn) applyFilter(hash, false);
    } else {
        applyFilter('all', false);
    }
});

