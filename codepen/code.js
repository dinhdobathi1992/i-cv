// Configuration for the effect (extracted from CodePen defaults)
const config = {
  // Theme colors (optional, for reference)
  theme: 'dark',

  // Icon (Blur Layer) Settings
  iconBlur: 28,          // Matches SVG stdDeviation
  iconSaturate: 5,       // High saturation for the glow
  iconBrightness: 1.3,
  iconContrast: 1.4,
  iconScale: 2.5,        // Scale of the blurred element
  iconOpacity: 0.25,     // Opacity of the glow

  // Border Settings
  borderWidth: 2,
  borderBlur: 10,
  borderSaturate: 4.2,
  borderBrightness: 2.5,
  borderContrast: 2.5,

  exclude: false,
};

// Apply configuration to CSS variables
const updateConfig = () => {
  const root = document.documentElement; // Or scope to specific container

  // Update SVG filter if it exists
  const blurFilter = document.querySelector('filter#blur feGaussianBlur');
  if (blurFilter) {
    blurFilter.setAttribute('stdDeviation', config.iconBlur);
  } else {
    console.warn('SVG filter #blur not found. The blur effect requires an inline SVG filter.');
  }

  // Update CSS variables
  // These drive the appearance defined in code.css
  root.style.setProperty('--icon-saturate', config.iconSaturate);
  root.style.setProperty('--icon-brightness', config.iconBrightness);
  root.style.setProperty('--icon-contrast', config.iconContrast);
  root.style.setProperty('--icon-scale', config.iconScale);
  root.style.setProperty('--icon-opacity', config.iconOpacity);

  root.style.setProperty('--border-width', config.borderWidth);
  root.style.setProperty('--border-blur', config.borderBlur);
  root.style.setProperty('--border-saturate', config.borderSaturate);
  root.style.setProperty('--border-brightness', config.borderBrightness);
  root.style.setProperty('--border-contrast', config.borderContrast);
};

// Pointer tracking logic
const initPointerTracking = () => {
  // Select both the original CodePen class 'article' and your project class '.highlight-card'
  const cards = document.querySelectorAll('.highlight-card, article');

  if (cards.length === 0) {
    // console.log('No cards found for pointer tracking');
    return;
  }

  document.addEventListener('pointermove', (event) => {
    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calculate pointer position relative to center of card
      const relativeX = event.clientX - centerX;
      const relativeY = event.clientY - centerY;

      // Normalize to -1 to 1 range based on dimensions
      // Factor can be adjusted to control sensitivity/range
      const x = relativeX / (rect.width / 2);
      const y = relativeY / (rect.height / 2);

      card.style.setProperty('--pointer-x', x.toFixed(3));
      card.style.setProperty('--pointer-y', y.toFixed(3));
    });
  });

  // Optional: Reset on leave
  cards.forEach((card) => {
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--pointer-x', '0');
      card.style.setProperty('--pointer-y', '0');
    });
  });
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  updateConfig();
  initPointerTracking();
  // console.log('Blur/Hover Effect Initialized');
});