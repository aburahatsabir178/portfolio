// Function for Resume Download
function downloadResume(event) {
  event.preventDefault();
  if (window.gtag) {
    gtag('event', 'resume_download', {
      event_category: 'engagement',
      event_label: 'Resume PDF',
      value: 1
    });
  }
  const a = document.createElement('a');
  a.href = 'AbuRahatSabir-Resume.pdf';
  a.download = 'AbuRahatSabir-Resume.pdf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// 1. General Site Logic (Scroll, Stats, Mobile Nav)
document.addEventListener('DOMContentLoaded', () => {
  // Scroll Animation
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealOnScroll = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
    revealElements.forEach(el => revealOnScroll.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('active'));
  }

  // Stats Counter
  const statsSection = document.querySelector('.stats-section');
  const stats = document.querySelectorAll('.stat-number');
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
        const progress = Math.min((now - startTime) / duration, 1);
        const easeOutQuad = 1 - (1 - progress) * (1 - progress);
        counter.innerText = Math.ceil(easeOutQuad * target) + suffix;
        if (progress < 1) requestAnimationFrame(updateCount);
        else counter.innerText = target + suffix;
      };
      requestAnimationFrame(updateCount);
    });
  }

  if (statsSection && stats.length) {
    const statsObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animateStats();
        statsObserver.unobserve(statsSection);
      }
    }, { threshold: 0.2 });
    statsObserver.observe(statsSection);
  }

  // Mobile Nav
  const navToggle = document.querySelector('.nav-toggle');
  const topNav = document.querySelector('.top-nav');
  if (navToggle && topNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isOpen);
      topNav.classList.toggle('is-open', !isOpen);
    });
    document.querySelectorAll('.top-nav a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          navToggle.setAttribute('aria-expanded', 'false');
          topNav.classList.remove('is-open');
        }
      });
    });
  }
});

// 2. Work Page Filtering Logic
document.addEventListener('DOMContentLoaded', () => {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');
  const emptyState = document.getElementById('empty-state');

  // Exit if not on work page
  if (filterBtns.length === 0) return;

  function applyFilter(category, updateUrl = true) {
    let visibleCount = 0;

    filterBtns.forEach(btn => {
      const isSelected = btn.dataset.filter === category;
      btn.classList.toggle('active', isSelected);
      btn.setAttribute('aria-selected', isSelected);
    });

    cards.forEach(card => {
      card.classList.remove('fade-in');
      void card.offsetWidth; // Force reflow for animation
      
      if (category === 'all' || card.dataset.category === category) {
        card.classList.remove('hidden');
        card.classList.add('fade-in');
        visibleCount++;
      } else {
        card.classList.add('hidden');
      }
    });

    if (emptyState) {
      emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
    }

    if (updateUrl) {
      const hash = category === 'all' ? ' ' : `#${category}`;
      history.replaceState(null, null, hash);
    }
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
  });

  // Deep Linking check
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    const validBtn = document.querySelector(`.filter-btn[data-filter="${hash}"]`);
    if (validBtn) applyFilter(hash, false);
  } else {
    applyFilter('all', false);
  }
});
