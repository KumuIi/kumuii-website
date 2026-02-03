import { animate } from 'animejs';

class LayeredImageReveal {
  constructor() {
    // Get all image elements
    this.stemLeft = document.querySelector('.reveal-img');      // stemleft.webp
    this.flowersLeft = document.querySelector('.reveal-img2');  // flowersleft.webp
    this.stemDown = document.querySelector('.reveal-img3');     // stemdown.webp
    this.flowersDown = document.querySelector('.reveal-img4');  // flowersdown.webp
    
    // Track scroll state
    this.scrollAnimations = {
      stemDown: null,
      flowersDown: null
    };
    
    this.maxStemDownReveal = 0;
    this.maxFlowersDownReveal = 0;
    this.ticking = false;
    
    // Configuration
    this.config = {
      // Page load animations - both 5 seconds, same speed
      stemLeftDuration: 7000,
      flowersLeftDelay: 500,
      flowersLeftDuration: 7000,
      
      // Scroll animations
      scrollRange: 1500,
      stemDownStart: 0,
      flowersDownStart: 500,
    };
    
    this.init();
  }
  
  init() {
    // Set initial states - all hidden
    this.setClipPath(this.stemLeft, 'left-to-right', 0);
    this.setClipPath(this.flowersLeft, 'left-to-right', 0);
    this.setClipPath(this.stemDown, 'top-to-bottom', 0);
    this.setClipPath(this.flowersDown, 'top-to-bottom', 0);
    
    // Start page load animations
    this.animatePageLoad();
    
    // Set up scroll listener
    window.addEventListener('scroll', this.requestTick.bind(this), { passive: true });
  }
  
  setClipPath(element, direction, percent) {
    const percentage = percent * 100;
    
    if (direction === 'left-to-right') {
      // Reveal from left to right (clip from left side, move left edge right)
      element.style.clipPath = `inset(0 0 0 ${100 - percentage}%)`;
    } else if (direction === 'top-to-bottom') {
      // Reveal from top to bottom (bottom edge moves down)
      element.style.clipPath = `inset(0 0 ${100 - percentage}% 0)`;
    }
  }
  
  animatePageLoad() {
    // Animate Stem Left: 0 → 100% over 5 seconds
    const stemLeftObj = { reveal: 0 };
    animate(stemLeftObj, {
      reveal: 1,
      duration: this.config.stemLeftDuration,
      ease: 'inOut(3)',
      onUpdate: () => {
        this.setClipPath(this.stemLeft, 'left-to-right', stemLeftObj.reveal);
      }
    });
    
    // Animate Flowers Left: 0 → 100% over 5 seconds (same speed, same start time)
    const flowersLeftObj = { reveal: 0 };
    animate(flowersLeftObj, {
      reveal: 1,
      duration: this.config.flowersLeftDuration,
      delay: this.config.flowersLeftDelay,
      ease: 'inOut(3)',
      onUpdate: () => {
        this.setClipPath(this.flowersLeft, 'left-to-right', flowersLeftObj.reveal);
      }
    });
  }
  
  requestTick() {
    if (!this.ticking) {
      requestAnimationFrame(this.handleScroll.bind(this));
      this.ticking = true;
    }
  }
  
  handleScroll() {
    this.ticking = false;
    
    const scrollY = window.scrollY;
    const scrollRange = this.config.scrollRange;
    
    // Calculate Stem Down reveal (0px → 1000px = 0% → 100%)
    let stemDownTarget = Math.min(scrollY / scrollRange, 1);
    stemDownTarget = Math.max(0, stemDownTarget);
    
    // Calculate Flowers Down reveal (500px → 1000px = 0% → 100%)
    let flowersDownTarget = 0;
    if (scrollY >= this.config.flowersDownStart) {
      const flowersScrollProgress = (scrollY - this.config.flowersDownStart) / 
                                   (scrollRange - this.config.flowersDownStart);
      flowersDownTarget = Math.min(flowersScrollProgress, 1);
    }
    
    // Animate Stem Down (only move forward)
    if (stemDownTarget > this.maxStemDownReveal) {
      this.maxStemDownReveal = stemDownTarget;
      
      if (this.scrollAnimations.stemDown) {
        this.scrollAnimations.stemDown.pause();
      }
      
      const stemDownObj = { reveal: this.maxStemDownReveal };
      
      this.scrollAnimations.stemDown = animate(stemDownObj, {
        reveal: stemDownTarget,
        duration: 150,
        ease: 'outQuad',
        onUpdate: () => {
          this.setClipPath(this.stemDown, 'top-to-bottom', stemDownObj.reveal);
        }
      });
    }
    
    // Animate Flowers Down (only move forward)
    if (flowersDownTarget > this.maxFlowersDownReveal) {
      this.maxFlowersDownReveal = flowersDownTarget;
      
      if (this.scrollAnimations.flowersDown) {
        this.scrollAnimations.flowersDown.pause();
      }
      
      const flowersDownObj = { reveal: this.maxFlowersDownReveal };
      
      this.scrollAnimations.flowersDown = animate(flowersDownObj, {
        reveal: flowersDownTarget,
        duration: 150,
        ease: 'outQuad',
        onUpdate: () => {
          this.setClipPath(this.flowersDown, 'top-to-bottom', flowersDownObj.reveal);
        }
      });
    }
  }
  
  destroy() {
    window.removeEventListener('scroll', this.requestTick);
    if (this.scrollAnimations.stemDown) this.scrollAnimations.stemDown.pause();
    if (this.scrollAnimations.flowersDown) this.scrollAnimations.flowersDown.pause();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new LayeredImageReveal();
});
