/* 
  =========================================
  Illustration Portfolio - Global Interactions
  Handling custom cursor, grid filtering, form validation, and page events
  =========================================
*/

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Global Modules
  initCustomCursor();
  initPortfolioFilters();
  initContactForm();
  initPageTransitions();
  initMasonryGrid();
});

function initCustomCursor() {
  // Custom cursor disabled as per user preference
}

/**
 * Portfolio Filtration Mechanics
 * Performs smooth reflow transitions on filtering tags.
 */
function initPortfolioFilters() {
  const filters = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');
  const grid = document.querySelector('.gallery-grid');

  if (!filters.length || !cards.length || !grid) return;

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active states on button panel
      filters.forEach(f => f.classList.remove('active'));
      btn.classList.add('active');

      const selectedCategory = btn.getAttribute('data-filter');

      // Filter and trigger fade animations
      cards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');

        if (selectedCategory === 'all' || cardCategory === selectedCategory) {
          // Reset classes to trigger fade-in
          card.classList.remove('fade-out');
          card.classList.add('fade-in');
          
          // Let CSS display active elements
          setTimeout(() => {
            card.style.display = 'block';
            if (typeof window.resizeAllGridItems === 'function') {
              window.resizeAllGridItems();
            }
          }, 50);
        } else {
          // Fade out elements
          card.classList.remove('fade-in');
          card.classList.add('fade-out');
          
          // Terminate layout presence after transition ends
          setTimeout(() => {
            card.style.display = 'none';
            if (typeof window.resizeAllGridItems === 'function') {
              window.resizeAllGridItems();
            }
          }, 300); // matches fade duration
        }
      });

      // Final balancing check after animations fully resolve
      setTimeout(() => {
        if (typeof window.resizeAllGridItems === 'function') {
          window.resizeAllGridItems();
        }
      }, 350);
    });
  });
}

/**
 * Animated Contact Inquiries Handler
 * Validates fields and manages floating label resets.
 */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const inputs = document.querySelectorAll('.form-input');

  if (!form) return;

  // Manage initial label alignment if values are prefilled by browser
  inputs.forEach(input => {
    // Check values on load
    if (input.value !== '') {
      input.placeholder = '';
    }
  });

  // Handle inquiry submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Collect variables
    const name = document.getElementById('formName').value.trim();
    const email = document.getElementById('formEmail').value.trim();
    const subject = document.getElementById('formSubject') ? document.getElementById('formSubject').value.trim() : '';
    const message = document.getElementById('formMessage').value.trim();

    if (!name || !email || !message) {
      alert('Please fill out all required fields.');
      return;
    }

    // Capture submit button and transition to loading state
    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'SENDING...';
    submitBtn.disabled = true;

    // Perform a real AJAX submission to FormSubmit.co
    fetch('https://formsubmit.co/ajax/anabenillustration@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: name,
        email: email,
        _subject: subject || `New Portfolio Inquiry from ${name}`,
        message: message
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success === 'true' || data.success === true) {
        // Create success banner
        const successBanner = document.createElement('div');
        successBanner.className = 'success-banner';
        successBanner.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>Thank you, ${name}! Your inquiry was sent successfully. We will get back to you shortly.</span>
        `;

        // Insert banner above form
        form.parentNode.insertBefore(successBanner, form);

        // Reset form variables
        form.reset();

        // Animate inputs back to baseline
        inputs.forEach(input => {
          const label = input.nextElementSibling;
          if (label && label.classList.contains('form-label')) {
            label.style.transform = '';
          }
        });

        // Clear banner after 6 seconds
        setTimeout(() => {
          successBanner.style.opacity = '0';
          successBanner.style.transition = 'opacity 0.5s ease';
          setTimeout(() => successBanner.remove(), 500);
        }, 6000);
      } else {
        alert('Oops! Something went wrong while sending your inquiry. Please try again.');
      }
    })
    .catch(error => {
      console.warn('AJAX submit failed or was blocked (likely due to local file:// CORS restrictions). Falling back to standard form submission...', error);
      submitBtn.textContent = 'REDIRECTING...';
      form.submit();
    })
    .finally(() => {
      // Only reset button state if form wasn't submitted natively (which redirects)
      setTimeout(() => {
        if (submitBtn.textContent === 'REDIRECTING...') return;
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }, 1000);
    });
  });
}

/**
 * Single-Page Fade Out Page Transition Effects
 * Ensures seamless navigation shifts.
 */
function initPageTransitions() {
  const transitionOverlays = document.querySelectorAll('a:not([target="_blank"]):not([href^="#"]):not(.social-item-link)');
  
  transitionOverlays.forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const destination = anchor.getAttribute('href');
      
      // If it's a valid local HTML link
      if (destination && destination !== '#') {
        e.preventDefault();
        
        // Trigger body fade animation out
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
          window.location.href = destination;
        }, 300);
      }
    });
  });
  
  // Fade in body on load
  document.body.style.opacity = '0';
  setTimeout(() => {
    document.body.style.opacity = '1';
    document.body.style.transition = 'opacity 0.4s ease';
  }, 100);
}

/**
 * Modern CSS Grid Staggered Masonry Layout Engine
 * Calculates visual height bounds for cards and sets grid row-spans.
 */
function initMasonryGrid() {
  const grid = document.querySelector('.gallery-grid');
  if (!grid) return;

  function resizeAllGridItems() {
    const isMobile = window.innerWidth <= 768;
    const cards = grid.querySelectorAll('.project-card');

    if (isMobile) {
      grid.style.gridAutoRows = '';
      cards.forEach(card => {
        card.style.gridRow = '';
        card.style.gridColumn = '';
      });
      return;
    }

    // Read the column gap dynamically from CSS root variables
    const rootStyle = getComputedStyle(document.documentElement);
    const gapStr = rootStyle.getPropertyValue('--column-gap').trim();
    let verticalGap = 40; // Fallback to 40px
    
    if (gapStr) {
      if (gapStr.endsWith('rem')) {
        const remVal = parseFloat(gapStr);
        const baseFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        verticalGap = remVal * baseFontSize;
      } else if (gapStr.endsWith('px')) {
        verticalGap = parseFloat(gapStr);
      }
    }

    // 1. Reset inline styles so we can measure natural heights
    grid.style.gridAutoRows = '';
    cards.forEach(card => {
      card.style.gridRow = '';
      card.style.gridColumn = '';
    });

    // Force browser reflow to get correct natural auto-layout heights
    grid.offsetHeight;

    // 2. Measure natural heights of all currently visible cards
    const cardData = [];
    cards.forEach(card => {
      if (card.style.display === 'none' || card.classList.contains('fade-out')) {
        return;
      }
      const cardHeight = card.getBoundingClientRect().height;
      cardData.push({
        el: card,
        height: cardHeight,
        isLarge: card.classList.contains('size-large')
      });
    });

    // 3. Set the grid back to 1px rows
    grid.style.gridAutoRows = '1px';

    // 4. Place cards explicitly by balancing column heights
    const numCols = window.innerWidth <= 1100 ? 2 : 3;
    const colHeights = Array(numCols).fill(1); // 1-indexed grid row starts

    cardData.forEach(data => {
      const card = data.el;
      const cardHeight = Math.ceil(data.height);
      const gapVal = Math.ceil(verticalGap);
      
      if (data.isLarge && numCols >= 2) {
        if (numCols === 2) {
          // In 2-column layout, large card must span both columns 1 and 2
          const startRow = Math.max(colHeights[0], colHeights[1]);
          card.style.gridColumn = '1 / span 2';
          card.style.gridRow = `${startRow} / span ${cardHeight}`;
          
          const newHeight = startRow + cardHeight + gapVal;
          colHeights[0] = newHeight;
          colHeights[1] = newHeight;
        } else {
          // In 3-column layout, decide whether to place in cols 1-2 or cols 2-3
          const h12 = Math.max(colHeights[0], colHeights[1]);
          const h23 = Math.max(colHeights[1], colHeights[2]);
          
          if (h12 <= h23) {
            const startRow = h12;
            card.style.gridColumn = '1 / span 2';
            card.style.gridRow = `${startRow} / span ${cardHeight}`;
            
            const newHeight = startRow + cardHeight + gapVal;
            colHeights[0] = newHeight;
            colHeights[1] = newHeight;
          } else {
            const startRow = h23;
            card.style.gridColumn = '2 / span 2';
            card.style.gridRow = `${startRow} / span ${cardHeight}`;
            
            const newHeight = startRow + cardHeight + gapVal;
            colHeights[1] = newHeight;
            colHeights[2] = newHeight;
          }
        }
      } else {
        // 1-column card
        const minCol = colHeights.indexOf(Math.min(...colHeights));
        const startRow = colHeights[minCol];
        
        card.style.gridColumn = `${minCol + 1}`;
        card.style.gridRow = `${startRow} / span ${cardHeight}`;
        
        colHeights[minCol] = startRow + cardHeight + gapVal;
      }
    });
  }

  // Attach event triggers
  window.addEventListener('load', resizeAllGridItems);
  window.addEventListener('resize', resizeAllGridItems);

  // Trigger immediate layout for preloaded or cached assets
  resizeAllGridItems();

  // Also bind to image load events inside the grid cards to trigger layout when loaded
  const images = grid.querySelectorAll('.project-image');
  images.forEach(img => {
    if (img.complete) {
      resizeAllGridItems();
    } else {
      img.addEventListener('load', resizeAllGridItems);
    }
  });

  // Expose function globally for the filter system to call
  window.resizeAllGridItems = resizeAllGridItems;
}
