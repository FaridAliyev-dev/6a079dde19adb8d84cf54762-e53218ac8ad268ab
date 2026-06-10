import './style.css';
import { initLanguageSwitcher } from './i18n.js';

document.addEventListener('DOMContentLoaded', () => {
  initLanguageSwitcher();

  // 0. Hamburger mobile menu toggle
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (hamburgerBtn && mobileMenu) {
    hamburgerBtn.addEventListener('click', () => {
      hamburgerBtn.classList.toggle('active');
      mobileMenu.classList.toggle('open');
      // Lock body scroll when menu is open
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });

    // Close menu when clicking a mobile link
    mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburgerBtn.classList.remove('active');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }
  
  // 1. Intersection Observer for scroll animations
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Run once
        
        // Remove animation delays and slow transitions after initial reveal
        setTimeout(() => {
          entry.target.style.transitionDelay = '0s';
          if (entry.target.classList.contains('pillar-card') || entry.target.classList.contains('step')) {
            entry.target.style.transition = 'transform 0.1s ease-out, box-shadow 0.3s ease';
          }
        }, 1000);
      }
    });
  }, observerOptions);

  // Apply fade-in class and observe elements
  const animateElements = document.querySelectorAll('.section-title, .section-desc, .pillar-card, .feature-item, .step, .tech-container, .logo-grid, .hero-mockup');

  animateElements.forEach((el, index) => {
    el.classList.add('fade-in');
    // Add staggered delay based on child index if needed, but for simplicity we let intersection handle it
    // For grid items we can add small delays
    if (el.classList.contains('pillar-card') || el.classList.contains('feature-item') || el.classList.contains('step')) {
      el.style.transitionDelay = `${(index % 3) * 0.1}s`;
    }
    observer.observe(el);
  });

  // 2. Sticky Navbar glass effect on scroll
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.style.background = 'rgba(255, 255, 255, 0.85)';
      navbar.style.boxShadow = '0 4px 20px rgba(15, 23, 42, 0.05)';
    } else {
      navbar.style.background = 'var(--glass-bg)';
      navbar.style.boxShadow = 'none';
    }
  });

  // 3. Mouse tracking for pillar cards and steps
  document.querySelectorAll('.pillar-card, .step').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--x', `${x}px`);
      card.style.setProperty('--y', `${y}px`);

      // 3D tilt effect - made slightly stronger
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -15; // max 15 deg
      const rotateY = ((x - centerX) / centerX) * 15;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });

  // 4. Sticky Scroll for How It Works - REMOVED AS REQUESTED

  // 5. Documentation Scroll Tracking
  const docsSections = document.querySelectorAll('.docs-section');
  const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
  const indicator = document.querySelector('.sidebar-indicator');

  if (docsSections.length > 0 && sidebarLinks.length > 0) {
    const docsObserverOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px', // Trigger when section is in the upper middle
      threshold: 0
    };

    const updateIndicator = (activeLink) => {
      if (indicator && activeLink) {
        const navRect = document.querySelector('.sidebar-nav').getBoundingClientRect();
        const linkRect = activeLink.getBoundingClientRect();
        
        indicator.style.height = `${linkRect.height}px`;
        indicator.style.top = `${linkRect.top - navRect.top}px`;

        // Ensure the active link's group is visible in the sidebar for a more stable feel
        const group = activeLink.closest('.sidebar-group');
        if (group) {
          group.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    };

    window.updateDocIndicator = updateIndicator;

    const docsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          sidebarLinks.forEach(link => {
            const isActive = link.getAttribute('href') === `#${id}`;
            link.classList.toggle('active', isActive);
            if (isActive) {
              updateIndicator(link);
            }
          });
        }
      });
    }, docsObserverOptions);

    docsSections.forEach(section => docsObserver.observe(section));
    
    // Initial position
    const activeLink = document.querySelector('.sidebar-nav a.active');
    if (activeLink) updateIndicator(activeLink);

    // Update on resize
    window.addEventListener('resize', () => {
      const active = document.querySelector('.sidebar-nav a.active');
      if (active) updateIndicator(active);
    });
  }
});

