/* ============================================
   FILMATIX — Main Script (Premium with Motion)
   ============================================ */

import Lenis from 'https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/+esm';
import { animate, inView, stagger, scroll } from 'https://cdn.jsdelivr.net/npm/motion@11.11.13/+esm';

// --- Preloader & Media Optimization ---
const preloader = document.getElementById('preloader');
const progressBar = document.getElementById('preloader-progress');
const body = document.body;

function initSiteAnimations() {
  body.classList.remove('loading');
  if (preloader) preloader.classList.add('preloader--done');

  // Start smooth scrolling once loaded
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // --- Sticky Navigation ---
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  function handleScroll() {
    if (window.scrollY > 40) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  }

  lenis.on('scroll', handleScroll);
  handleScroll();

  // --- Mobile Menu ---
  navToggle.addEventListener('click', function () {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('open');
    if (navMenu.classList.contains('open')) {
      lenis.stop();
    } else {
      lenis.start();
    }
  });

  navMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navToggle.classList.remove('active');
      navMenu.classList.remove('open');
      lenis.start();
    });
  });

  // --- Smooth Scroll for Anchor Links ---
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        var offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
        lenis.scrollTo(target, { offset: -offset });
      }
    });
  });

  // --- Entrance Animations (Framer Motion) ---
  const heroElements = document.querySelectorAll('.hero__content > *');
  heroElements.forEach(el => el.style.opacity = 0);
  animate(
    '.hero__content > *',
    { opacity: [0, 1], y: [40, 0], scale: [0.98, 1] },
    { duration: 1.2, delay: stagger(0.15), easing: [0.22, 1, 0.36, 1] }
  );

  const heroBg = document.querySelector('.hero__bg');
  if (heroBg) {
    scroll(
      animate(heroBg, { y: ["0%", "40%"], scale: [1, 1.1] }),
      { target: document.querySelector('.hero'), offset: ["start start", "end start"] }
    );
  }

  const sectionTitles = document.querySelectorAll('.section__title');
  sectionTitles.forEach(title => {
    title.style.opacity = 0;
    inView(title, () => {
      animate(title, { opacity: [0, 1], y: [30, 0] }, { duration: 1, easing: [0.22, 1, 0.36, 1] });
    }, { margin: "-10% 0px -10% 0px" });
  });

  const fadeElements = document.querySelectorAll('.fade-in:not(.tier):not(.process__step):not(.portfolio-item):not(.section__title)');
  fadeElements.forEach(el => {
    inView(el, () => {
      animate(el, { opacity: [0, 1], y: [40, 0] }, { duration: 1, easing: [0.22, 1, 0.36, 1] });
    }, { margin: "-10% 0px -10% 0px" });
  });

  const tiersSection = document.querySelector('.tiers');
  if (tiersSection) {
    const tiers = tiersSection.querySelectorAll('.tier');
    tiers.forEach(t => t.style.opacity = 0);
    inView(tiersSection, () => {
      animate('.tier', { opacity: [0, 1], y: [60, 0], scale: [0.95, 1] }, { duration: 1.2, delay: stagger(0.2), easing: [0.22, 1, 0.36, 1] });
    }, { margin: "-20%" });
  }

  const processSection = document.querySelector('.process');
  if (processSection) {
    const steps = processSection.querySelectorAll('.process__step');
    steps.forEach(s => s.style.opacity = 0);
    inView(processSection, () => {
      animate('.process__step', { opacity: [0, 1], y: [40, 0] }, { duration: 1, delay: stagger(0.15), easing: [0.22, 1, 0.36, 1] });
    }, { margin: "-20%" });
  }

  const portfolioGrid = document.querySelector('.portfolio-grid');
  if (portfolioGrid) {
    const items = portfolioGrid.querySelectorAll('.portfolio-item');
    items.forEach(i => i.style.opacity = 0);
    inView(portfolioGrid, () => {
      animate('.portfolio-item', { opacity: [0, 1], scale: [0.9, 1], y: [40, 0] }, { duration: 1.2, delay: stagger(0.15), easing: [0.22, 1, 0.36, 1] });
    }, { margin: "-15%" });
  }

  const sliderContainer = document.querySelector('.slider-section');
  const sliderElement = document.querySelector('.artisan-slider');
  if (sliderContainer && sliderElement) {
    scroll(
      animate(sliderElement, { scale: [0.95, 1.05] }),
      { target: sliderContainer, offset: ["start end", "end start"] }
    );
  }

  // --- Artisan Slider ---
  var slider = document.getElementById('artisanSlider');
  if (slider) {
    var container = slider.querySelector('.artisan-slider__container');
    var afterLayer = slider.querySelector('.artisan-slider__after');
    var handle = document.getElementById('sliderHandle');
    var isDragging = false;

    function getSliderPosition(e) {
      var rect = container.getBoundingClientRect();
      var clientX = e.touches ? e.touches[0].clientX : e.clientX;
      var x = clientX - rect.left;
      return Math.max(0, Math.min(1, x / rect.width));
    }

    function updateSlider(pct) {
      var percent = pct * 100;
      afterLayer.style.clipPath = 'inset(0 0 0 ' + percent + '%)';
      handle.style.left = percent + '%';
    }

    function onPointerDown(e) {
      e.preventDefault();
      isDragging = true;
      updateSlider(getSliderPosition(e));
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      e.preventDefault();
      updateSlider(getSliderPosition(e));
    }

    function onPointerUp() {
      isDragging = false;
    }

    container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    container.addEventListener('touchstart', onPointerDown, { passive: false });
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);
  }

  // --- Nav Highlight ---
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav__link');

  function highlightNav() {
    var scrollPos = window.scrollY + 120;
    sections.forEach(function (section) {
      var top = section.offsetTop;
      var height = section.offsetHeight;
      var id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(function (link) {
          link.style.color = '';
          if (link.getAttribute('href') === '#' + id) {
            link.style.color = 'var(--text-primary)';
          }
        });
      }
    });
  }
  window.addEventListener('scroll', highlightNav, { passive: true });
  highlightNav();

  // --- Video Players ---
  document.querySelectorAll('.portfolio-item__video, .portfolio-featured__video').forEach(function (video) {
    video.style.cursor = 'pointer';
    video.addEventListener('click', function () {
      if (video.muted) {
        document.querySelectorAll('.portfolio-item__video, .portfolio-featured__video').forEach(function (v) {
          if (v !== video) {
            v.muted = true;
            v.controls = false;
          }
        });
        video.muted = false;
        video.controls = true;
        video.play();
      } else {
        video.muted = true;
        video.controls = false;
      }
    });
  });
}

// === PRELOADER LOGIC ===
function preloadMedia() {
  const mediaElements = [
    ...document.querySelectorAll('img'),
    ...document.querySelectorAll('video[preload="auto"]') // only wait for critical videos
  ];
  
  let loadedCount = 0;
  const totalMedia = mediaElements.length;
  
  if (totalMedia === 0) {
    initSiteAnimations();
    return;
  }
  
  function updateProgress() {
    loadedCount++;
    const percent = Math.floor((loadedCount / totalMedia) * 100);
    if (progressBar) progressBar.style.width = percent + '%';
    
    if (loadedCount >= totalMedia) {
      setTimeout(initSiteAnimations, 400); // slight delay for smooth transition
    }
  }

  mediaElements.forEach(media => {
    if (media.tagName.toLowerCase() === 'img') {
      if (media.complete) {
        updateProgress();
      } else {
        media.addEventListener('load', updateProgress);
        media.addEventListener('error', updateProgress);
      }
    } else if (media.tagName.toLowerCase() === 'video') {
      if (media.readyState >= 3) {
        updateProgress();
      } else {
        media.addEventListener('canplay', updateProgress);
        media.addEventListener('error', updateProgress);
      }
    }
  });
  
  // Fallback in case of hanging loads
  setTimeout(() => {
    if (body.classList.contains('loading')) {
      initSiteAnimations();
    }
  }, 5000); // Max wait 5 seconds
}

// Initiate preloading
document.addEventListener('DOMContentLoaded', preloadMedia);
