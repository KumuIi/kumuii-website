// =============================================
// SIMPLIFIED TRANSITIONS INIT FOR SUB-PAGES
// =============================================

const BLOCK_SIZE = 60;
let transitionBlocks = [];
let transitionContainer = null;

// Fisher-Yates shuffle for unbiased randomization
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

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

  const fragment = document.createDocumentFragment();

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
      fragment.appendChild(block);
      transitionBlocks.push(block);
    }
  }

  transitionContainer.appendChild(fragment);
}

// Play the "enter" animation (randomly remove blocks to reveal page)
function playEnterAnimation() {
  const shuffledBlocks = shuffleArray([...transitionBlocks]);
  const blockCount = shuffledBlocks.length;

  shuffledBlocks.forEach((block, i) => {
    block.style.opacity = '1';
    block.style.transition = 'opacity 0.3s ease-out';

    const delay = (i / blockCount) * 400;
    setTimeout(() => {
      block.style.opacity = '0';
    }, delay);
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Remove the transition cover once blocks are ready
  const transitionCover = document.querySelector('.transition-cover');
  if (transitionCover) {
    // Keep it visible until blocks animate, then remove it
    setTimeout(() => {
      transitionCover.remove();
    }, 150);
  }

  // Create page loader overlay to prevent white flash
  let pageLoader = document.querySelector('.page-loader');
  if (!pageLoader) {
    pageLoader = document.createElement('div');
    pageLoader.className = 'page-loader';
    document.body.appendChild(pageLoader);
  }

  createTransitionGrid();

  // Check if we should play enter animation
  if (sessionStorage.getItem('playEnterTransition') === 'true') {
    sessionStorage.removeItem('playEnterTransition');

    // Make sure all blocks are visible first
    for (let i = 0; i < transitionBlocks.length; i++) {
      transitionBlocks[i].style.opacity = '1';
    }

    // Wait a bit, then play the reveal animation
    setTimeout(playEnterAnimation, 100);
  }
  // On first load, loader stays hidden (no flash)

  // Handle window resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(createTransitionGrid, 250);
  });

  // Intercept back button clicks
  const backButtons = document.querySelectorAll('.exit-btn, a[href*="index.html"]');
  backButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();

      const shuffledBlocks = shuffleArray([...transitionBlocks]);
      const blockCount = shuffledBlocks.length;

      // Randomly fill blocks to cover the page
      shuffledBlocks.forEach((block, i) => {
        block.style.opacity = '0';
        block.style.transition = 'opacity 0.3s ease-out';

        const delay = (i / blockCount) * 400;
        setTimeout(() => {
          block.style.opacity = '1';
        }, delay);
      });

      // Navigate after animation
      setTimeout(() => {
        sessionStorage.setItem('playEnterTransition', 'true');
        window.location.href = btn.href;
      }, 800);
    });
  });
});
