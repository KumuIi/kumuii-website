import { initScene } from './scene.js';

// Initialize 3D scene
initScene();

// =============================================
// WAIT FOR DOM
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  
  // =============================================
  // NAVIGATION
  // =============================================
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navbar = document.querySelector('.nav-bar');
  
  // Mobile menu toggle
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }
  
  // Smooth scroll
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
  
  // Navbar background on scroll
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
      navbar.style.background = 'rgba(15, 23, 42, 0.95)';
      navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.3)';
    } else {
      navbar.style.background = 'rgba(15, 23, 42, 0.8)';
      navbar.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
  }, { passive: true });
  
  // =============================================
  // HERO ANIMATIONS (Page Load)
  // =============================================
  
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
  
  // =============================================
  // TEXT SPLITTING HELPER
  // =============================================
  
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
  
  // =============================================
  // SCROLL ANIMATIONS
  // =============================================
  
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
  
  // Observe all elements
  document.querySelectorAll('.section-title, .stat-item, .skill-card, .skill-item, .work-card, .contact-wrapper').forEach(el => {
    observer.observe(el);
  });
  
  function animateElement(element) {
    
    // SECTION TITLES - Character by character animation
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
    
    // STATS (with counter)
    else if (element.classList.contains('stat-item')) {
      anime({
        targets: element,
        opacity: [0, 1],
        scale: [0.8, 1],
        translateY: [30, 0],
        duration: 500,
        easing: 'easeOutBack'
      });
      
      // Animate number
      const number = element.querySelector('.stat-number');
      if (number) {
        const target = parseInt(number.textContent);
        const obj = { value: 0 };
        anime({
          targets: obj,
          value: target,
          duration: 1200,
          easing: 'easeOutExpo',
          round: 1,
          update: () => {
            number.textContent = Math.round(obj.value);
          }
        });
      }
    }
    
    // SKILL CARDS - FASTER
    else if (element.classList.contains('skill-card')) {
      const container = element.parentElement;
      const cards = Array.from(container.querySelectorAll('.skill-card'));
      const index = cards.indexOf(element);
      
      anime({
        targets: element,
        opacity: [0, 1],
        translateY: [60, 0],
        scale: [0.9, 1],
        duration: 500,
        delay: index * 60,
        easing: 'easeOutQuart'
      });
    }
    
    // SKILL ITEMS - MUCH FASTER
    else if (element.classList.contains('skill-item')) {
      const section = element.closest('.skills-section');
      const items = Array.from(section.querySelectorAll('.skill-item'));
      const index = items.indexOf(element);
      
      anime({
        targets: element,
        opacity: [0, 1],
        scale: [0, 1],
        duration: 400,
        delay: index * 30,
        easing: 'easeOutBack'
      });
    }
    
    // WORK CARDS
    else if (element.classList.contains('work-card')) {
      const container = element.parentElement;
      const index = Array.from(container.children).indexOf(element);
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
    
    // CONTACT WRAPPER
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
  
  // =============================================
  // BUTTON HOVERS
  // =============================================
  
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
  
  // =============================================
  // WORK CARD HOVERS
  // =============================================
  
  document.querySelectorAll('#my-work .work-card').forEach(card => {
    const image = card.querySelector('.work-image img');
    
    card.addEventListener('mouseenter', () => {
      if (image) {
        anime({
          targets: image,
          scale: 1.15,
          duration: 600,
          easing: 'easeOutCubic'
        });
      }
    });
    
    card.addEventListener('mouseleave', () => {
      if (image) {
        anime({
          targets: image,
          scale: 1,
          duration: 400,
          easing: 'easeOutCubic'
        });
      }
    });
  });
  
  // =============================================
  // SOCIAL ICONS
  // =============================================
  
  const socialIcons = document.querySelectorAll('.social-icon');
  
  // Initial animation
  anime({
    targets: socialIcons,
    opacity: [0, 1],
    scale: [0, 1],
    duration: 500,
    delay: anime.stagger(80),
    easing: 'easeOutBack'
  });
  
  // Hover effect
  socialIcons.forEach(icon => {
    icon.addEventListener('mouseenter', () => {
      anime({
        targets: icon,
        scale: 1.2,
        rotate: 360,
        duration: 400,
        easing: 'easeOutCubic'
      });
    });
    
    icon.addEventListener('mouseleave', () => {
      anime({
        targets: icon,
        scale: 1,
        rotate: 0,
        duration: 300,
        easing: 'easeOutCubic'
      });
    });
  });
  
  // =============================================
  // FORM INTERACTIONS
  // =============================================
  
  const inputs = document.querySelectorAll('.contact-form input, .contact-form textarea');
  
  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      anime({
        targets: input,
        scale: 1.02,
        duration: 300,
        easing: 'easeOutCubic'
      });
    });
    
    input.addEventListener('blur', () => {
      anime({
        targets: input,
        scale: 1,
        duration: 300,
        easing: 'easeOutCubic'
      });
    });
  });
  
  // Form submission
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
  
  // =============================================
  // 3D CONTAINER FADE
  // =============================================
  
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
