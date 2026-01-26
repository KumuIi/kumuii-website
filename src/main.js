import * as anime from 'animejs';
import { initScene } from './scene.js';

// Initialize 3D scene
initScene();

document.addEventListener('DOMContentLoaded', () => {

  // === HERO ANIMATIONS ===
  anime.default({
    targets: '.hero-title',
    scale: [0.5, 1],
    opacity: [0, 1],
    rotate: [-10, 0],
    duration: 1200,
    easing: 'spring(1, 80, 10, 0)'
  })

  anime.default({
    targets: '.hero-quote',
    translateY: [-50, 0],
    opacity: [0, 1],
    duration: 1000,
    delay: 300,
    easing: 'out(3)'
  })

  // === HEXAGON ANIMATIONS ===
  anime.default({
    targets: '.hex-item',
    scale: [0, 1],
    opacity: [0, 1],
    rotate: [180, 0],
    delay: anime.stagger(60, { grid: [3, 3], from: 'center' }),
    duration: 800,
    easing: 'spring(1, 80, 10, 0)'
  })

  // Hexagon hover rotation
  document.querySelectorAll('.hex-item').forEach(item => {
    item.addEventListener('mouseenter', function() {
      const hex = this.querySelector('.hexagon')
      anime.default({
        targets: hex,
        rotate: [0, 360],
        duration: 600,
        easing: 'spring(1, 80, 10, 0)'
      })
    })
  })

  // === WORK CARDS SCROLL ANIMATION ===
  const workCards = document.querySelectorAll('.work-card')

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const isLeft = entry.target.classList.contains('left')

        anime.default({
          targets: entry.target,
          translateX: [isLeft ? -100 : 100, 0],
          opacity: [0, 1],
          duration: 1000,
          easing: 'out(3)'
        })

        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.2 })

  workCards.forEach(card => observer.observe(card))

  // === SOCIAL ICONS ANIMATION ===
  anime.default({
    targets: '.social-icon',
    scale: [0, 1],
    rotate: [0, 360],
    opacity: [0, 1],
    delay: anime.stagger(100, { start: 1200 }),
    duration: 800,
    easing: 'spring(1, 80, 10, 0)'
  })

  // === FORM ANIMATION ===
  const formInputs = document.querySelectorAll('.contact-form input, .contact-form textarea')

  formInputs.forEach(input => {
    input.addEventListener('focus', () => {
      anime.default({
        targets: input,
        scale: [1, 1.02, 1],
        duration: 400,
        easing: 'out(2)'
      })
    })
  })

  // === FORM SUBMISSION ===
  const contactForm = document.getElementById('contact-form')

  contactForm?.addEventListener('submit', async (e) => {
    e.preventDefault()

    const button = contactForm.querySelector('button')
    const originalText = button.textContent

    anime.default({
      targets: button,
      scale: [1, 0.95, 1],
      duration: 400
    })

    button.textContent = 'Sending...'
    button.disabled = true

    // Simulate sending
    setTimeout(() => {
      button.textContent = '✓ Sent!'
      button.style.background = 'linear-gradient(135deg, #a5d5d8, #9b9eff)'

      anime.default({
        targets: button,
        scale: [1, 1.1, 1],
        duration: 600,
        easing: 'spring(1, 80, 10, 0)'
      })

      setTimeout(() => {
        contactForm.reset()
        button.textContent = originalText
        button.disabled = false
        button.style.background = ''
      }, 2000)
    }, 1500)
  })

  // === 3D MODEL FADE ON SCROLL ===
  const threeContainer = document.getElementById('three-container')
  const heroSection = document.getElementById('hero')

  window.addEventListener('scroll', () => {
    const heroHeight = heroSection.offsetHeight
    const scrollPosition = window.scrollY

    // Start fading after hero section
    if (scrollPosition > heroHeight * 0.5) {
      // Calculate opacity (1 to 0)
      const fadeStart = heroHeight * 0.5
      const fadeEnd = heroHeight * 1.2
      const fadeRange = fadeEnd - fadeStart
      const fadeProgress = (scrollPosition - fadeStart) / fadeRange
      const opacity = Math.max(0, 1 - fadeProgress)

      threeContainer.style.opacity = opacity
    } else {
      threeContainer.style.opacity = 1
    }
  })
})
