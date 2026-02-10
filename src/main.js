import { initScene } from './scene.js';
import { initTransitions } from './transitions.js';

// If returning from sub-page with hash, scroll IMMEDIATELY before anything loads
if (window.location.hash && sessionStorage.getItem('playEnterTransition') === 'true') {
  // Prevent default scroll restoration
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  // Wait for element to exist, then scroll
  const scrollToHash = () => {
    const target = document.querySelector(window.location.hash);
    if (target) {
      window.scrollTo(0, target.offsetTop);
    }
  };

  // Try immediately
  scrollToHash();

  // And try again on DOMContentLoaded in case element wasn't ready
  document.addEventListener('DOMContentLoaded', scrollToHash, { once: true });
}

initScene();

document.addEventListener('DOMContentLoaded', () => {

  // Remove the transition cover once blocks are ready
  const transitionCover = document.querySelector('.transition-cover');
  if (transitionCover) {
    console.log('Transition cover found, will remove it');

    // Keep it visible until blocks animate, then remove it
    setTimeout(() => {
      if (transitionCover.parentNode) {
        transitionCover.remove();
        console.log('Transition cover removed (150ms)');
      }
    }, 150);

    // Fallback: Remove after 1.5 seconds if still there
    setTimeout(() => {
      if (transitionCover.parentNode) {
        transitionCover.remove();
        console.log('Transition cover removed (fallback 1.5s)');
      }
    }, 1500);
  }

  // Initialize page transitions
  initTransitions();

  // Navigation
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navbar = document.querySelector('.nav-bar');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        if (navMenu?.classList.contains('active')) {
          navMenu.classList.remove('active');
        }
      }
    });
  });

  // Change navbar style on scroll
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
      navbar.style.background = 'rgba(15, 23, 42, 0.95)';
      navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.3)';
    } else {
      navbar.style.background = 'rgba(15, 23, 42, 0.8)';
      navbar.style.boxShadow = 'none';
    }
  }, { passive: true });

  // Hero entrance animation
  anime.timeline()
    .add({
      targets: '.hero-badge',
      opacity: [0, 1],
      translateY: [-20, 0],
      duration: 600,
      easing: 'easeOutCubic'
    })
    .add({
      targets: '.hero-title',
      opacity: [0, 1],
      translateY: [40, 0],
      scale: [0.95, 1],
      duration: 800,
      easing: 'easeOutQuart'
    }, '-=400')
    .add({
      targets: '.hero-subtitle',
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 600,
      easing: 'easeOutCubic'
    }, '-=500')
    .add({
      targets: '.hero-cta',
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 600,
      easing: 'easeOutCubic'
    }, '-=400')
    .add({
      targets: '.hero-quote',
      opacity: [0, 1],
      translateX: [60, 0],
      duration: 700,
      easing: 'easeOutCubic'
    }, '-=500')
    .add({
      targets: '.scroll-indicator',
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 500,
      easing: 'easeOutCubic'
    }, '-=400');

  function splitTextToChars(element) {
    const text = element.textContent;
    element.innerHTML = '';

    text.split('').forEach(char => {
      const span = document.createElement('span');
      span.style.display = 'inline-block';
      span.textContent = char === ' ' ? '\u00A0' : char;
      element.appendChild(span);
    });

    return element.querySelectorAll('span');
  }

  // Scroll-triggered animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
        animateElement(entry.target);
        entry.target.classList.add('animated');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -10% 0px'
  });

  document.querySelectorAll('.section-title, .stat-item, .skill-card, .skill-item, .work-card, .contact-wrapper').forEach(el => {
    observer.observe(el);
  });

  function animateElement(element) {

    if (element.classList.contains('section-title')) {
      const chars = splitTextToChars(element);

      anime({
        targets: chars,
        opacity: [0, 1],
        translateY: [30, 0],
        rotateZ: [10, 0],
        duration: 600,
        delay: anime.stagger(30),
        easing: 'easeOutExpo'
      });
    }

    else if (element.classList.contains('stat-item') ||
             element.classList.contains('skill-card') ||
             element.classList.contains('skill-item')) {
      element.style.opacity = '1';
      element.style.transform = 'scale(1)';
    }

    else if (element.classList.contains('work-card')) {
      const fromLeft = element.classList.contains('left');

      anime({
        targets: element,
        opacity: [0, 1],
        translateX: [fromLeft ? -80 : 80, 0],
        translateY: [40, 0],
        duration: 800,
        easing: 'easeOutQuart'
      });
    }

    else if (element.classList.contains('contact-wrapper')) {
      anime({
        targets: element,
        opacity: [0, 1],
        translateY: [50, 0],
        scale: [0.95, 1],
        duration: 800,
        easing: 'easeOutQuart'
      });
    }
  }

  // Button hover effects
  document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      anime({
        targets: btn,
        scale: 1.05,
        duration: 300,
        easing: 'easeOutCubic'
      });
    });

    btn.addEventListener('mouseleave', () => {
      anime({
        targets: btn,
        scale: 1,
        duration: 300,
        easing: 'easeOutCubic'
      });
    });
  });

  // Social icons entrance
  const socialIcons = document.querySelectorAll('.social-icon');

  anime({
    targets: socialIcons,
    opacity: [0, 1],
    scale: [0, 1],
    duration: 500,
    delay: anime.stagger(80),
    easing: 'easeOutBack'
  });

  // Contact form
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    emailjs.init('sJkTKDehva4zknlV3');

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn = contactForm.querySelector('button[type="submit"]');
      const originalText = btn.textContent;

      anime({
        targets: btn,
        scale: [1, 0.95, 1],
        duration: 400
      });

      btn.textContent = 'Sending...';
      btn.disabled = true;

      try {
        await emailjs.sendForm('service_onk3svz', 'template_ehoz2is', contactForm);

        btn.textContent = '✓ Sent!';
        btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';

        anime({
          targets: btn,
          scale: [1, 1.1, 1],
          duration: 600,
          easing: 'easeOutElastic(1, .5)'
        });

        setTimeout(() => {
          contactForm.reset();
          btn.textContent = originalText;
          btn.disabled = false;
          btn.style.background = '';
        }, 3000);

      } catch (error) {
        console.error('Error:', error);
        btn.textContent = '✗ Failed';
        btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';

        setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled = false;
          btn.style.background = '';
        }, 3000);
      }
    });
  }

  // Fade out 3D background after hero
  const threeContainer = document.getElementById('three-container');
  const hero = document.getElementById('hero');

  if (threeContainer && hero) {
    window.addEventListener('scroll', () => {
      const heroHeight = hero.offsetHeight;
      const scroll = window.pageYOffset;

      if (scroll > heroHeight * 0.3) {
        const start = heroHeight * 0.3;
        const end = heroHeight * 0.9;
        const progress = Math.min((scroll - start) / (end - start), 1);
        threeContainer.style.opacity = 0.4 * (1 - progress);
      } else {
        threeContainer.style.opacity = 0.4;
      }
    }, { passive: true });
  }

});
