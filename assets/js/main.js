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

document.addEventListener('DOMContentLoaded', () => {
    // Selectors
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-card');

    // --- Filtering Logic ---
    function filterProjects(category) {
        // 1. Update Buttons
        filterBtns.forEach(btn => {
            if (btn.dataset.filter === category) {
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
            } else {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            }
        });

        // 2. Show/Hide Cards with Animation
        cards.forEach(card => {
            // Remove animation class to reset
            card.classList.remove('fade-in');
            // Force reflow to restart animation next time
            void card.offsetWidth;
            if (category === 'all' || card.dataset.category === category) {
                card.classList.remove('hidden');
                card.classList.add('fade-in');
            } else {
                card.classList.add('hidden');
            }
        });
    }

    // --- Event Listeners ---
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.filter;
            filterProjects(category);

            // Update URL hash without scrolling
            if(history.pushState) {
                history.pushState(null, null, category === 'all' ? ' ' : `#${category}`);
            } else {
                window.location.hash = category === 'all' ? '' : category;
            }
        });
    });

    // --- Deep Linking on Load ---
    // Check if user came with a specific hashtag (e.g., work.html#automation)
    const hash = window.location.hash.replace('#', '');
    if (hash) {
        // Check if the hash matches a valid filter
        const validCategory = [...filterBtns].some(btn => btn.dataset.filter === hash) ? hash : null;
        
        if (validCategory) {
            filterProjects(validCategory);
        }
    }
});
