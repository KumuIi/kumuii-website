// =============================================
// BLOCK REVEAL PAGE TRANSITIONS
// =============================================

const BLOCK_SIZE = 60;
let transitionBlocks = [];
let transitionContainer = null;

// Create the transition grid overlay
function createTransitionGrid() {
  if (!transitionContainer) {
    transitionContainer = document.createElement('div');
    transitionContainer.className = 'transition-grid';
    document.body.appendChild(transitionContainer);
  }

  transitionContainer.innerHTML = '';
  transitionBlocks = [];

  const gridWidth = window.innerWidth;
  const gridHeight = window.innerHeight;
  const columns = Math.ceil(gridWidth / BLOCK_SIZE);
  const rows = Math.ceil(gridHeight / BLOCK_SIZE) + 1;
  const offsetX = (gridWidth - columns * BLOCK_SIZE) / 2;
  const offsetY = (gridHeight - rows * BLOCK_SIZE) / 2;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const block = document.createElement('div');
      block.className = 'transition-block';
      block.style.cssText = `
        width: ${BLOCK_SIZE}px;
        height: ${BLOCK_SIZE}px;
        left: ${col * BLOCK_SIZE + offsetX}px;
        top: ${row * BLOCK_SIZE + offsetY}px;
      `;
      transitionContainer.appendChild(block);
      transitionBlocks.push(block);
    }
  }

  // Set initial state - hidden
  anime.set(transitionBlocks, { opacity: 0, scale: 1 });
}

// Play the "leave" animation (randomly fill blocks until screen is covered)
function playLeaveAnimation() {
  return new Promise((resolve) => {
    // Create a shuffled array of indices for random order
    const shuffledIndices = [...Array(transitionBlocks.length).keys()]
      .sort(() => Math.random() - 0.5);

    // Create shuffled blocks array
    const shuffledBlocks = shuffledIndices.map(i => transitionBlocks[i]);

    anime({
      targets: shuffledBlocks,
      opacity: [0, 1],
      duration: 300,
      delay: anime.stagger(400 / transitionBlocks.length),
      easing: 'easeOutQuad',
      complete: resolve
    });
  });
}

// Play the "enter" animation (randomly remove blocks to reveal page)
function playEnterAnimation() {
  return new Promise((resolve) => {
    anime.set(transitionBlocks, { opacity: 1, scale: 1 });

    // Create a shuffled array of indices for random order
    const shuffledIndices = [...Array(transitionBlocks.length).keys()]
      .sort(() => Math.random() - 0.5);

    // Create shuffled blocks array
    const shuffledBlocks = shuffledIndices.map(i => transitionBlocks[i]);

    anime({
      targets: shuffledBlocks,
      opacity: [1, 0],
      duration: 300,
      delay: anime.stagger(400 / transitionBlocks.length),
      easing: 'easeInQuad',
      complete: resolve
    });
  });
}

// Handle page navigation with transition
export function navigateWithTransition(url) {
  playLeaveAnimation().then(() => {
    // Store flag to play enter animation on new page
    sessionStorage.setItem('playEnterTransition', 'true');
    window.location.href = url;
  });
}

// Initialize transitions on page load
export function initTransitions() {
  // Create page loader overlay to prevent white flash
  let pageLoader = document.querySelector('.page-loader');
  if (!pageLoader) {
    pageLoader = document.createElement('div');
    pageLoader.className = 'page-loader';
    document.body.appendChild(pageLoader);
  }

  // Create the grid
  createTransitionGrid();

  // Recreate grid on window resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(createTransitionGrid, 250);
  });

  // Check if we should play enter animation
  if (sessionStorage.getItem('playEnterTransition') === 'true') {
    sessionStorage.removeItem('playEnterTransition');

    // Make sure anime.js is loaded and blocks are ready
    let attempts = 0;
    const maxAttempts = 40; // Max 2 seconds (40 * 50ms)

    const waitForAnime = () => {
      attempts++;

      if (typeof anime !== 'undefined' && transitionBlocks.length > 0) {
        console.log('Anime loaded, playing enter animation');

        // Make sure all blocks are visible first
        anime.set(transitionBlocks, { opacity: 1 });

        // Wait a bit, then play the reveal animation
        setTimeout(() => {
          playEnterAnimation().then(() => {
            console.log('Animation complete');
          });
        }, 100);
      } else if (attempts < maxAttempts) {
        // Retry after a short delay
        setTimeout(waitForAnime, 50);
      } else {
        // Fallback: manually fade out blocks
        console.warn('Anime.js not loaded, using fallback animation');
        transitionBlocks.forEach((block, i) => {
          block.style.opacity = '1';
          block.style.transition = 'opacity 0.3s ease-out';
          const delay = (i / transitionBlocks.length) * 400;
          setTimeout(() => {
            block.style.opacity = '0';
          }, delay);
        });
      }
    };

    waitForAnime();
  }
  // On first load, loader stays hidden (no flash)

  // Intercept all navigation links for transitions
  interceptNavigationLinks();
}

// Intercept clicks on navigation links
function interceptNavigationLinks() {
  // Handle all links that go to different pages (not anchors)
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');

    // Check if it's a link and not an anchor link
    if (link && link.href && !link.href.includes('#') && !link.target) {
      // Check if it's an internal link (same origin or relative)
      const isInternal = link.href.startsWith(window.location.origin) ||
                         link.getAttribute('href').startsWith('/') ||
                         link.getAttribute('href').startsWith('./') ||
                         link.getAttribute('href').startsWith('../');

      if (isInternal) {
        e.preventDefault();
        navigateWithTransition(link.href);
      }
    }
  });
}
