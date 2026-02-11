// Register the GSAP Flip plugin so it can be used
gsap.registerPlugin(Flip);

// Preloads images (and background images if used)
const preloadImages = (selector = 'img') => {
  return new Promise((resolve) => {
    imagesLoaded(
      document.querySelectorAll(selector),
      { background: true },
      resolve
    );
  });
};

// Wait until the DOM is fully loaded before running the script
document.addEventListener('DOMContentLoaded', async function () {
  // Get the grid gallery container element
  const gridGallery = document.getElementById('grid-gallery');
  // Stop execution if gridGallery does not exist
  if (!gridGallery) return;

  // Keep the loading state until images are ready
  await preloadImages('.image');

  // Remove the "loading" class from the body (usually used for preload states)
  document.body.classList.remove('loading');

  // Select all grid size configuration buttons
  const triggerButtons = document.querySelectorAll(
    '.configuration_grid_size button'
  );

  // Select all grid gallery items
  const allGridItem = document.querySelectorAll('.grid_gallery_item');

  // Flag to prevent multiple animations at the same time
  // currentGridSize stores the active grid size
  let animated = false,
    currentGridSize = gridGallery.dataset.sizeGrid || '75%';

  // Loop through each configuration button
  triggerButtons.forEach((btn) => {
    // Add click event listener to each button
    btn.addEventListener('click', () => {
      // Prevent interaction if an animation is already running
      if (animated) return;

      // Get the target grid size from data-size attribute
      const targetSize = btn.dataset.size;

      // If the clicked size is already active, do nothing
      if (targetSize === currentGridSize) return;

      // Lock animation state
      animated = true;

      // Capture the current position and size of all grid items
      const state = Flip.getState(allGridItem);

      // Update grid size using data attribute (used by CSS)
      gridGallery.dataset.sizeGrid = targetSize;

      // Update current grid size state
      currentGridSize = targetSize;

      // Remove "active" class from all buttons
      triggerButtons.forEach((btn) => {
        btn.classList.remove('active');
      });

      // Add "active" class to the clicked button
      btn.classList.add('active');

      // Animate elements from the previous state to the new layout
      Flip.from(state, {
        duration: 0.8, // Animation duration in seconds
        ease: 'expo.inOut', // Smooth easing for natural motion
        onComplete: () => {
          // Unlock animation after completion
          animated = false;
        },
      });
    });
  });

  // ===== FILTER FUNCTIONALITY =====
  const filterButtons = document.querySelectorAll('.filter-btn');
  let currentFilter = 'all';

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Prevent interaction if an animation is already running
      if (animated) return;

      const targetFilter = btn.dataset.filter;

      // If the clicked filter is already active, do nothing
      if (targetFilter === currentFilter) return;

      // Lock animation state
      animated = true;

      // Capture the current state of all grid items
      const state = Flip.getState(allGridItem);

      // Update current filter
      currentFilter = targetFilter;

      // Remove "active" class from all filter buttons
      filterButtons.forEach((filterBtn) => {
        filterBtn.classList.remove('active');
      });

      // Add "active" class to the clicked button
      btn.classList.add('active');

      // Filter items
      allGridItem.forEach((item) => {
        const itemTags = item.dataset.tags || '';
        
        if (targetFilter === 'all') {
          item.classList.remove('hidden');
        } else {
          if (itemTags.includes(targetFilter)) {
            item.classList.remove('hidden');
          } else {
            item.classList.add('hidden');
          }
        }
      });

      // Animate the layout change
      Flip.from(state, {
        duration: 0.6,
        ease: 'expo.inOut',
        absolute: true,
        onComplete: () => {
          // Update images array after filtering
          updateImagesArray();
          animated = false;
        },
      });
    });
  });

  // ===== LIGHTBOX FUNCTIONALITY =====
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxOverlay = document.querySelector('.lightbox__overlay');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const lightboxCurrent = document.getElementById('lightboxCurrent');
  const lightboxTotal = document.getElementById('lightboxTotal');

  // Array to store all image sources
  let images = [];
  let currentIndex = 0;

  // Function to update images array based on visible items
  function updateImagesArray() {
    images = [];
    const galleryImages = document.querySelectorAll('.grid_gallery_item:not(.hidden) .image');
    galleryImages.forEach((item) => {
      const bgImage = window
        .getComputedStyle(item)
        .backgroundImage.match(/url\(['"]?([^'")\]]+)/)[1];
      images.push(bgImage);
    });
    lightboxTotal.textContent = images.length;
  }

  // Collect all image URLs from grid items initially
  updateImagesArray();

  // Function to open lightbox
  function openLightbox(index) {
    currentIndex = index;
    lightboxImage.src = images[index];
    lightboxCurrent.textContent = index + 1;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // Function to close lightbox
  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
  }

  // Function to show next image
  function nextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    lightboxImage.src = images[currentIndex];
    lightboxCurrent.textContent = currentIndex + 1;
  }

  // Function to show previous image
  function prevImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    lightboxImage.src = images[currentIndex];
    lightboxCurrent.textContent = currentIndex + 1;
  }

  // Add click event to all gallery images using event delegation
  gridGallery.addEventListener('click', (e) => {
    const imageElement = e.target.closest('.grid_gallery_item:not(.hidden) .image');
    if (!imageElement) return;

    // Find the index of the clicked image among visible items
    const visibleImages = document.querySelectorAll('.grid_gallery_item:not(.hidden) .image');
    const index = Array.from(visibleImages).indexOf(imageElement);
    
    if (index !== -1) {
      openLightbox(index);
    }
  });

  // Set cursor pointer for all images
  document.querySelectorAll('.grid_gallery_item .image').forEach(item => {
    item.style.cursor = 'pointer';
  });

  // Close lightbox on close button click
  lightboxClose.addEventListener('click', closeLightbox);

  // Close lightbox on overlay click
  lightboxOverlay.addEventListener('click', closeLightbox);

  // Navigate images
  lightboxPrev.addEventListener('click', prevImage);
  lightboxNext.addEventListener('click', nextImage);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;

    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'Escape') closeLightbox();
  });
});
