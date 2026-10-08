/* 
  =========================================
  Illustration Portfolio - Global Interactions
  Handling grid filtering, form validation, and page events
  =========================================
*/

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Global Modules
  initPortfolioFilters();
  initContactForm();
  initMasonryGrid();
});

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
          card.style.display = 'block';
        } else {
          // Hidden cards leave the layout immediately (.fade-out sets display: none)
          card.classList.remove('fade-in');
          card.classList.add('fade-out');
          card.style.display = 'none';
        }
      });

      // One layout pass for the new set of cards
      if (typeof window.resizeAllGridItems === 'function') {
        window.resizeAllGridItems();
      }
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
          <span>Thank you, ${name}! Your inquiry was sent successfully. I will get back to you shortly.</span>
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
        throw new Error('FormSubmit did not report success');
      }
    })
    .catch(error => {
      // Keep the visitor's text in the form and point them to direct email
      console.warn('Inquiry submission failed.', error);
      alert('Sorry, your message could not be sent. Please try again, or email me directly at anabenillustration@gmail.com.');
    })
    .finally(() => {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    });
  });
}



/**
 * Modern CSS Grid Staggered Masonry Layout Engine
 * Places each card in the shortest column (on a 1px row grid), then stretches
 * single-column cards slightly so every column ends at the same line.
 * Stretched images are cropped with object-fit: cover.
 */
function initMasonryGrid() {
  const grid = document.querySelector('.gallery-grid');
  if (!grid) return;

  function clearCard(card) {
    card.style.gridRow = '';
    card.style.gridColumn = '';
    const wrapper = card.querySelector('.card-image-wrapper');
    if (wrapper) wrapper.style.height = '';
    const img = card.querySelector('.project-image');
    if (img) img.classList.remove('is-cropped');
  }

  function resizeAllGridItems() {
    const isMobile = window.innerWidth <= 768;
    const cards = grid.querySelectorAll('.project-card');

    if (isMobile) {
      grid.style.gridAutoRows = '';
      cards.forEach(clearCard);
      return;
    }

    // Nothing to measure while the page isn't rendered (e.g. a hidden tab)
    if (!grid.clientWidth) return;

    // Dynamically apply 1px rows for calculations only once JavaScript runs
    grid.style.gridAutoRows = '1px';

    // Read the column gap dynamically from CSS root variables to ensure perfect alignment
    const rootStyle = getComputedStyle(document.documentElement);
    const gapStr = rootStyle.getPropertyValue('--column-gap').trim();
    let verticalGap = 40; // Fallback to 40px (2.5rem at 16px base font size)
    
    if (gapStr) {
      if (gapStr.endsWith('rem')) {
        const remVal = parseFloat(gapStr);
        const baseFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        verticalGap = remVal * baseFontSize;
      } else if (gapStr.endsWith('px')) {
        verticalGap = parseFloat(gapStr);
      }
    }

    const colCount = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    const colWidth = (grid.clientWidth - verticalGap * (colCount - 1)) / colCount;
    let colBottoms = new Array(colCount).fill(0);
    let placed = [];

    // Stack cards in their assigned columns, scaling heights per column group
    function stack(scaleOf) {
      colBottoms = new Array(colCount).fill(0);
      placed.forEach(p => {
        const top = Math.max(...colBottoms.slice(p.col, p.col + p.span));
        p.top = top;
        p.height = p.baseHeight * scaleOf(p.col);
        for (let c = p.col; c < p.col + p.span; c++) colBottoms[c] = top + p.height + verticalGap;
      });
    }

    // 1. Masonry: each card goes to the shortest column (or column pair for large cards)
    const items = [];
    cards.forEach(card => {
      clearCard(card);
      if (card.style.display === 'none' || card.classList.contains('fade-out')) return;

      const img = card.querySelector('.project-image');
      if (!img) return;

      // Prefer the declared size so lazy images that haven't loaded yet are laid out correctly
      const ratio = (img.getAttribute('height') / img.getAttribute('width')) ||
        (img.naturalHeight / img.naturalWidth) || 1;
      // Cards have a 1px border on each side
      const heightFor = span => (colWidth * span + verticalGap * (span - 1) - 2) * ratio + 2;
      const wide = card.classList.contains('size-large') && colCount > 1;
      items.push({ card, wide, heightFor });
    });

    // Explore arrangements: when another column is nearly as short, also try the
    // card there, and let wide cards drop to one column. Keep the most even ones.
    const tolerance = colWidth * 0.75;
    let candidates = [];
    (function search(i, bottoms, content, gaps, cols, spans) {
      if (i === items.length) {
        const end = Math.max(...bottoms);
        let cost = 0;
        for (let c = 0; c < colCount; c++) {
          if (content[c] > 0) cost = Math.max(cost, (end - bottoms[c] + gaps[c]) / content[c]);
        }
        candidates.push({ cost, cols: cols.slice(), spans: spans.slice() });
        return;
      }
      const spanChoices = items[i].wide ? [2, 1] : [1];
      spanChoices.forEach(span => {
        const height = items[i].heightFor(span);
        const options = [];
        for (let c = 0; c + span <= colCount; c++) {
          options.push({ c, top: Math.max(...bottoms.slice(c, c + span)) });
        }
        options.sort((a, b) => a.top - b.top || a.c - b.c);
        options.filter((o, k) => k === 0 || (k === 1 && o.top - options[0].top <= tolerance)).forEach(o => {
          const b = bottoms.slice(), ct = content.slice(), g = gaps.slice();
          for (let c = o.c; c < o.c + span; c++) {
            g[c] += o.top - b[c];
            b[c] = o.top + height + verticalGap;
            ct[c] += height;
          }
          cols.push(o.c);
          spans.push(span);
          search(i + 1, b, ct, g, cols, spans);
          cols.pop();
          spans.pop();
        });
      });
    })(0, new Array(colCount).fill(0), new Array(colCount).fill(0), new Array(colCount).fill(0), [], []);
    // Keep the most even few for each wide/narrow combination
    candidates.sort((a, b) => a.cost - b.cost);
    const perShape = {};
    candidates = candidates.filter(cand => {
      const key = cand.spans.join('');
      perShape[key] = (perShape[key] || 0) + 1;
      return perShape[key] <= 10;
    });

    let groupOf = [];
    const root = c => (groupOf[c] === c ? c : (groupOf[c] = root(groupOf[c])));

    function useArrangement(cand) {
      placed = items.map((it, i) => {
        const span = cand.spans[i];
        const height = it.heightFor(span);
        return { card: it.card, col: cand.cols[i], span, top: 0, height, baseHeight: height };
      });
      // Columns joined by large cards form a group that must stretch together
      groupOf = [...Array(colCount).keys()];
      placed.forEach(p => {
        for (let c = p.col + 1; c < p.col + p.span; c++) groupOf[root(c)] = root(p.col);
      });
    }

    // Level every column at `target`; returns the worst crop (0..1) it causes
    function balance(target) {
      const groups = [...new Set([...Array(colCount).keys()].map(root))];

      // 2. Scale each group evenly (binary search) so its longest column lands
      //    on the target, sharing the difference across every card in the group.
      const scales = {};
      groups.forEach(g => { scales[g] = 1; });
      groups.forEach(g => {
        const cols = [...Array(colCount).keys()].filter(c => root(c) === g);
        let lo = 0.6, hi = 1.6;
        for (let i = 0; i < 20; i++) {
          const mid = (lo + hi) / 2;
          stack(c => (root(c) === g ? mid : scales[root(c)]));
          if (Math.max(...cols.map(c => colBottoms[c])) > target) hi = mid; else lo = mid;
        }
        scales[g] = lo;
      });
      stack(c => scales[root(c)]);

      // 3. Close the remaining gaps: in each column, the run of single-column cards
      //    before a large card (or the grid's end) grows to fill the space below it.
      for (let c = 0; c < colCount; c++) {
        const inCol = placed.filter(p => p.col <= c && c < p.col + p.span).sort((a, b) => a.top - b.top);
        let run = [];
        const fill = limit => {
          if (!run.length) return;
          const last = run[run.length - 1];
          const slack = limit - (last.top + last.height + verticalGap);
          if (slack > 0.5) {
            const total = run.reduce((s, p) => s + p.height, 0);
            let shift = 0;
            run.forEach(p => {
              p.top += shift;
              const extra = slack * (p.height / total);
              p.height += extra;
              shift += extra;
            });
          }
          run = [];
        };
        inCol.forEach(p => {
          if (p.span > 1) fill(p.top);
          else run.push(p);
        });
        fill(target);
      }

      // A column ending in a wide card can't always stretch to the line
      const ends = new Array(colCount).fill(0);
      placed.forEach(p => {
        for (let c = p.col; c < p.col + p.span; c++) ends[c] = Math.max(ends[c], p.top + p.height);
      });
      const used = ends.filter(e => e > 0);
      if (Math.max(...used) - Math.min(...used) > 1) return 1;

      return Math.max(0, ...placed.map(p =>
        1 - Math.min(p.height, p.baseHeight) / Math.max(p.height, p.baseHeight)));
    }

    // Try finishing lines between the shortest and tallest natural columns and
    // return the one that crops the artwork least (cards may grow or shrink).
    function bestTarget() {
      stack(() => 1);
      const filled = colBottoms.filter(b => b > 0);
      const lowest = Math.min(...filled);
      const highest = Math.max(...filled);
      let best = { crop: Infinity, target: highest };
      for (let i = 0; i <= 30; i++) {
        const t = lowest + (highest - lowest) * (i / 30);
        const crop = balance(t);
        if (crop < best.crop - 1e-4) best = { crop, target: t };
      }
      return best;
    }

    // Pick the arrangement that crops least; keeping wide cards wide is
    // preferred unless narrowing one saves a noticeable amount of cropping.
    let choice = null;
    candidates.forEach(cand => {
      useArrangement(cand);
      const { crop, target } = bestTarget();
      const narrowed = cand.spans.filter((s, i) => items[i].wide && s === 1).length;
      const score = crop + narrowed * 0.12;
      if (!choice || score < choice.score) choice = { score, target, cand };
    });
    if (!choice) return;
    useArrangement(choice.cand);
    balance(choice.target);

    // 4. Apply explicit positions on the 1px row grid
    placed.forEach(p => {
      // Round edges, not sizes, so neighbouring columns end on the same pixel
      const start = Math.round(p.top);
      const end = Math.round(p.top + p.height + verticalGap);
      p.card.style.gridColumn = `${p.col + 1} / span ${p.span}`;
      p.card.style.gridRow = `${start + 1} / span ${end - start}`;
      if (Math.abs(p.height - p.baseHeight) > 0.5) {
        p.card.querySelector('.card-image-wrapper').style.height = `${end - start - verticalGap - 2}px`;
        p.card.querySelector('.project-image').classList.add('is-cropped');
      }
    });
  }

  // Batch bursts of resize/load events into a single layout pass
  let pending = null;
  function scheduleLayout() {
    clearTimeout(pending);
    pending = setTimeout(resizeAllGridItems, 100);
  }

  // Attach event triggers
  window.addEventListener('load', scheduleLayout);
  window.addEventListener('resize', scheduleLayout);

  // Trigger immediate layout for preloaded or cached assets
  resizeAllGridItems();

  // Re-layout once images report their real proportions
  const images = grid.querySelectorAll('.project-image');
  images.forEach(img => {
    if (!img.complete) img.addEventListener('load', scheduleLayout);
  });

  // Expose function globally for the filter system to call
  window.resizeAllGridItems = resizeAllGridItems;
}
