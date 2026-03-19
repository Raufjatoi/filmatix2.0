import React, { useState, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { ReactLenis, useLenis } from '@studio-freight/react-lenis';
import { motion } from 'framer-motion';
import './index.css';

// Reusable Lazy Iframe Component (Conditional Facade)
const LazyIframe = ({ className, src, width, height, title, aspectRatio }) => {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '2500px 0px', // Massively pre-load 2.5 screens in advance!
  });

  const videoIdMatch = src.match(/video\/(\d+)/);
  const videoId = videoIdMatch ? videoIdMatch[1] : null;
  // Automatically pull the highest quality thumbnail available for this Vimeo video
  const thumbnailUrl = videoId ? `https://vumbnail.com/${videoId}.jpg` : null;

  return (
    <div ref={ref} className={className} style={{ 
      ...(aspectRatio ? { aspectRatio } : { width: '100%', height: '100%' }),
      position: 'relative',
      backgroundColor: '#111',
      backgroundImage: thumbnailUrl ? `url(${thumbnailUrl})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      overflow: 'hidden'
    }}>
      {inView && (
        <iframe
          src={src}
          width={width}
          height={height}
          frameBorder="0"
          onLoad={() => {
            // Buffer to give Vimeo's internal black screen time to evaluate physics and autoplay
            setTimeout(() => setIframeLoaded(true), 2500);
          }}
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
          title={title}
          style={{ 
            width: '100%', height: '100%', objectFit: 'cover', border: 'none', 
            position: 'absolute', top: 0, left: 0, zIndex: 2, 
            opacity: iframeLoaded ? 1 : 0, transition: 'opacity 1s ease' 
          }}
        />
      )}
    </div>
  );
};

export default function App() {
  const lenis = useLenis();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);
  const sliderContainerRef = useRef(null);
  const isDragging = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    setIsNavOpen(false);
    if (lenis && targetId !== '#') {
      const target = document.querySelector(targetId);
      if (target) {
        lenis.scrollTo(target, { offset: -72 });
      }
    }
  };

  const getSliderPosition = (e) => {
    if (!sliderContainerRef.current) return 50;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    return Math.max(0, Math.min(1, x / rect.width)) * 100;
  };

  const onPointerDown = (e) => {
    e.preventDefault();
    isDragging.current = true;
    setSliderPos(getSliderPosition(e));
  };

  const onPointerMove = (e) => {
    if (!isDragging.current) return;
    if (e.cancelable) e.preventDefault();
    setSliderPos(getSliderPosition(e));
  };

  const onPointerUp = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);
    return () => {
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchend', onPointerUp);
    };
  }, []);

  const fadeUpVariant = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <ReactLenis root options={{ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) }}>
      
      {/* NAVIGATION */}
      <nav className={`nav ${isScrolled ? 'nav--scrolled' : ''}`} id="nav">
        <div className="nav__inner">
          <a href="#" className="nav__logo" onClick={(e) => handleNavClick(e, '#hero')}>FILMATIX</a>
          <button className={`nav__toggle ${isNavOpen ? 'active' : ''}`} onClick={() => setIsNavOpen(!isNavOpen)} aria-label="Toggle menu">
            <span></span><span></span><span></span>
          </button>
          <div className={`nav__menu ${isNavOpen ? 'open' : ''}`} id="navMenu">
            <a href="#services" className="nav__link" onClick={(e) => handleNavClick(e, '#services')}>Services</a>
            <a href="#portfolio" className="nav__link" onClick={(e) => handleNavClick(e, '#portfolio')}>Portfolio</a>
            <a href="#process" className="nav__link" onClick={(e) => handleNavClick(e, '#process')}>Process</a>
            <a href="#about" className="nav__link" onClick={(e) => handleNavClick(e, '#about')}>About</a>
            <a href="#contact" className="nav__link" onClick={(e) => handleNavClick(e, '#contact')}>Contact</a>
            <a href="#contact" className="btn btn--accent nav__cta" onClick={(e) => handleNavClick(e, '#contact')}>Book a Call</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero" id="hero">
        <div className="hero__bg"></div>
        <motion.div 
          className="hero__content"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
        >
          <motion.h1 className="hero__title" variants={fadeUpVariant}>AI Filmmaking.<br />Art-Directed.</motion.h1>
          <motion.p className="hero__subtitle" variants={fadeUpVariant}>Brief-driven AI production for fashion, beauty, and brand content — with full creative control.</motion.p>
          <motion.a href="#portfolio" className="btn btn--accent btn--lg" variants={fadeUpVariant} onClick={(e) => handleNavClick(e, '#portfolio')}>See Our Work</motion.a>
          <motion.p className="hero__tagline" variants={fadeUpVariant}>No one-click tools. No AI slop. Just studio-grade results.</motion.p>
        </motion.div>
      </section>

      {/* ARTISAN SLIDER */}
      <section className="section slider-section" id="slider">
        <div className="container">
          <motion.h2 className="section__title" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} variants={fadeUpVariant}>
            The Difference Is in the Details
          </motion.h2>
          <motion.div className="artisan-slider" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} variants={fadeUpVariant}>
            <div 
              className="artisan-slider__container" 
              ref={sliderContainerRef}
              onMouseDown={onPointerDown}
              onMouseMove={onPointerMove}
              onTouchStart={onPointerDown}
              onTouchMove={onPointerMove}
              style={{ paddingBottom: 0 }}
            >
              <div className="artisan-slider__before">
                <div className="artisan-slider__image artisan-slider__image--before">
                  <LazyIframe 
                    src="https://player.vimeo.com/video/1175076344?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479&amp;background=1" 
                    width="1732" height="1192" title="Baccarat_Rouge_540_Label_Before" 
                  />
                </div>
                <span className="artisan-slider__label artisan-slider__label--before">One-Click AI Output</span>
              </div>
              <div className="artisan-slider__after" style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}>
                <div className="artisan-slider__image artisan-slider__image--after">
                  <LazyIframe 
                    src="https://player.vimeo.com/video/1175076084?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479&amp;background=1" 
                    width="1732" height="1192" title="Baccarat_Rouge_540_Label_After" 
                  />
                </div>
                <span className="artisan-slider__label artisan-slider__label--after">Filmatix Manual Finish</span>
              </div>
              <div className="artisan-slider__handle" style={{ left: `${sliderPos}%` }}>
                <div className="artisan-slider__handle-line"></div>
                <div className="artisan-slider__handle-circle">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M8 5L3 12L8 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 5L21 12L16 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
          <motion.p className="slider-section__text" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} variants={fadeUpVariant}>
            We don't prompt — we architect reality. Every frame is hand-finished for lighting, composition, skin texture, and brand accuracy.
          </motion.p>
        </div>
      </section>

      {/* SERVICE TIERS */}
      <section className="section section--alt" id="services">
        <div className="container">
          <motion.h2 className="section__title" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} variants={fadeUpVariant}>
            Three Ways to Work With Us
          </motion.h2>
          <motion.div className="tiers" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} variants={{ visible: { transition: { staggerChildren: 0.2 } } }}>
            <motion.div className="tier" variants={fadeUpVariant}>
              <div className="tier__number">01</div>
              <h3 className="tier__name">Product to Model</h3>
              <p className="tier__label">ESSENTIALS</p>
              <p className="tier__price">Starting from $XXX</p>
              <p className="tier__desc">From product photo on white to AI-generated images with models wearing and using your products. Studio-quality stills ready for e-commerce, social media, and marketing.</p>
              <ul className="tier__list">
                <li>Product placed on AI-generated model</li>
                <li>Multiple poses and angles</li>
                <li>Background customization</li>
                <li>High-resolution output</li>
                <li>2 rounds of revision</li>
              </ul>
              <a href="#contact" className="btn btn--outline" onClick={(e) => handleNavClick(e, '#contact')}>Get Started</a>
            </motion.div>

            <motion.div className="tier tier--featured" variants={fadeUpVariant}>
              <div className="tier__badge">Most Popular</div>
              <div className="tier__number">02</div>
              <h3 className="tier__name">Image + Video Production</h3>
              <p className="tier__label">CREATIVE</p>
              <p className="tier__price">Starting from $XXXX</p>
              <p className="tier__desc">Everything in Essentials, plus AI-generated video content and creative editorial imagery. Full motion reels, lookbook videos, and social-ready content.</p>
              <ul className="tier__list">
                <li>Everything in Tier 1</li>
                <li>AI-generated video reels (15–60 seconds)</li>
                <li>Creative editorial images</li>
                <li>Multiple outfit/location variations</li>
                <li>Custom music and sound design</li>
                <li>3 rounds of revision</li>
              </ul>
              <a href="#contact" className="btn btn--accent" onClick={(e) => handleNavClick(e, '#contact')}>Get Started</a>
            </motion.div>

            <motion.div className="tier" variants={fadeUpVariant}>
              <div className="tier__number">03</div>
              <h3 className="tier__name">Custom Solutions</h3>
              <p className="tier__label">CREATIVE PARTNER</p>
              <p className="tier__price">Let's Talk</p>
              <p className="tier__desc">Full creative partnership. We become your AI production team — building custom campaigns, virtual model rosters, serialized content, and brand-ready assets at scale.</p>
              <ul className="tier__list">
                <li>Dedicated creative direction</li>
                <li>Custom AI model/character creation</li>
                <li>Campaign concepting and storyboarding</li>
                <li>Ongoing content production</li>
                <li>Brand style guide integration</li>
                <li>Priority revisions</li>
                <li>Priority turnaround</li>
              </ul>
              <a href="#contact" className="btn btn--outline" onClick={(e) => handleNavClick(e, '#contact')}>Contact Us</a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* PORTFOLIO */}
      <section className="section" id="portfolio">
        <div className="container">
          <motion.h2 className="section__title" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} variants={fadeUpVariant}>
            Selected Work
          </motion.h2>
          <motion.div className="portfolio-featured" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} variants={fadeUpVariant}>
            <LazyIframe 
              className="portfolio-featured__video" 
              src="https://player.vimeo.com/video/1175078063?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479&amp;background=1" 
              width="1920" height="1080" title="Outfit_Story" 
            />
          </motion.div>
          <motion.div className="portfolio-grid" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-15%" }} variants={{ visible: { transition: { staggerChildren: 0.15 } } }}>
            {[
              { src: 'https://player.vimeo.com/video/1175078897', width: 1080, height: 1920, title: 'ZARA_style_fashion', tag: 'Fashion Film', desc: 'Spring/Summer Lookbook' },
              { src: 'https://player.vimeo.com/video/1175077038', width: 1168, height: 1776, title: 'Hair_Products_Promo', tag: 'Product Reel', desc: 'Haircare Product Reel' },
              { src: 'https://player.vimeo.com/video/1175077565', width: 1184, height: 1760, title: 'makeup-Before_After', tag: 'Beauty', desc: 'Beauty Transformation' },
              { src: 'https://player.vimeo.com/video/1175076593', width: 1176, height: 1756, title: 'fashion_bike_2', tag: 'Editorial', desc: 'Editorial Fashion Film' },
              { src: 'https://player.vimeo.com/video/1175077814', width: 1072, height: 1932, title: 'Mugler_Perfume', tag: 'Fashion Film', desc: 'Fragrance Campaign' },
              { src: 'https://player.vimeo.com/video/1175076461', width: 1176, height: 1756, title: '2_products', tag: 'Product Reel', desc: 'Product Showcase' },
            ].map((video, idx) => (
              <motion.div key={idx} className="portfolio-item" variants={fadeUpVariant} style={{ aspectRatio: `${video.width} / ${video.height}` }}>
                <LazyIframe 
                  className="portfolio-item__video" 
                  src={`${video.src}?badge=0&autopause=0&player_id=0&app_id=58479&background=1`} 
                  width={video.width} height={video.height} title={video.title} 
                />
                <div className="portfolio-item__overlay">
                  <span className="portfolio-item__tag">{video.tag}</span>
                  <h4 className="portfolio-item__title">{video.desc}</h4>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="section section--alt" id="process">
        <div className="container">
          <motion.h2 className="section__title" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} variants={fadeUpVariant}>
            How We Work
          </motion.h2>
          <motion.div className="process" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-20%" }} variants={{ visible: { transition: { staggerChildren: 0.15 } } }}>
            {[
              { number: '01', name: 'Brief', desc: 'You share your vision, product photos, and creative direction.' },
              { number: '02', name: 'Draft', desc: 'We generate first high-fidelity drafts for your review.' },
              { number: '03', name: 'Refinement', desc: 'Collaborative polish — lighting, composition, brand accuracy.' },
              { number: '04', name: 'Delivery', desc: 'Pixel-perfect final assets, ready for any platform.' }
            ].map((step, idx) => (
              <React.Fragment key={idx}>
                <motion.div className="process__step" variants={fadeUpVariant}>
                  <div className="process__number">{step.number}</div>
                  <h4 className="process__name">{step.name}</h4>
                  <p className="process__desc">{step.desc}</p>
                </motion.div>
                {idx < 3 && <div className="process__connector"></div>}
              </React.Fragment>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="section" id="about">
        <div className="container">
          <motion.h2 className="section__title" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} variants={fadeUpVariant}>
            The Anti-Slop Philosophy
          </motion.h2>
          <div className="about">
            <motion.div className="about__text" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} variants={fadeUpVariant}>
              <p>Traditional production means casting calls, model fees, studio rentals, crew coordination, location scouting, and weeks of turnaround — all before a single frame is delivered. For one campaign. One look. One season.</p>
              <p>AI changes the math. But most AI output is generic, inconsistent, and unusable for brands with real standards. That's the slop. And that's what we refuse to deliver.</p>
              <p>Filmatix sits in the gap between traditional production overhead and one-click AI shortcuts. We use AI as the production tool — but every frame is art-directed, brief-driven, and hand-finished to match the quality your brand demands.</p>
              <p>The result: consistent virtual models that can wear anything, hold real products with readable labels, and appear across campaigns without a single booking fee. Fashion films, product reels, and editorial content — delivered in days, not months. At a fraction of the cost.</p>
              <p>Same creative control. No production logistics.</p>
            </motion.div>
            <motion.div className="about__image" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} variants={fadeUpVariant}>
              <img src="/images/Anti_Slop_Philosophy.png" alt="The Anti-Slop Philosophy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="section" id="contact">
        <div className="container">
          <motion.h2 className="section__title" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} variants={fadeUpVariant}>
            Let's Build Something
          </motion.h2>
          <motion.p className="section__subtitle" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} variants={fadeUpVariant}>
            Book a 15-minute call to discuss your project.
          </motion.p>
          <motion.div className="contact" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} variants={fadeUpVariant}>
            <form className="contact__form" id="contactForm" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const subject = encodeURIComponent(`Inquiry from ${formData.get('name')} (${formData.get('company') || 'N/A'})`);
              const body = encodeURIComponent(`Name: ${formData.get('name')}\nCompany: ${formData.get('company') || 'N/A'}\nProject Type: ${formData.get('projectType') || 'None'}\n\n${formData.get('message')}`);
              window.location.href = `mailto:contact@amdelllc.com?subject=${subject}&body=${body}`;
            }}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Name</label>
                  <input type="text" id="name" name="name" className="form-input" required />
                </div>
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input type="email" id="email" name="email" className="form-input" required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="company" className="form-label">Company</label>
                  <input type="text" id="company" name="company" className="form-input" />
                </div>
                <div className="form-group">
                  <label htmlFor="projectType" className="form-label">Project Type</label>
                  <select id="projectType" name="projectType" className="form-input form-select" defaultValue="">
                    <option value="" disabled>Select a project type</option>
                    <option value="product-stills">Product Stills</option>
                    <option value="video-reels">Video Reels</option>
                    <option value="full-campaign">Full Campaign</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="message" className="form-label">Message</label>
                <textarea id="message" name="message" className="form-input form-textarea" rows="5"></textarea>
              </div>
              <button type="submit" className="btn btn--accent btn--lg">Send Inquiry</button>
            </form>
            <div className="contact__info">
              <a href="mailto:contact@amdelllc.com" className="contact__link">contact@amdelllc.com</a>
              <a href="https://instagram.com/miacheckingin" className="contact__link" target="_blank" rel="noopener noreferrer">@miacheckingin</a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer__inner">
            <div className="footer__brand">
              <a href="#" className="footer__logo" onClick={(e) => handleNavClick(e, '#hero')}>FILMATIX</a>
              <p className="footer__copy">&copy; 2026 Filmatix. All rights reserved.</p>
              <p className="footer__note">All visuals on this site are AI-generated.</p>
            </div>
            <div className="footer__links">
              <a href="#services" onClick={(e) => handleNavClick(e, '#services')}>Services</a>
              <a href="#portfolio" onClick={(e) => handleNavClick(e, '#portfolio')}>Portfolio</a>
              <a href="#process" onClick={(e) => handleNavClick(e, '#process')}>Process</a>
              <a href="#about" onClick={(e) => handleNavClick(e, '#about')}>About</a>
              <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')}>Contact</a>
            </div>
            <div className="footer__social">
              <a href="#" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" aria-label="YouTube" target="_blank" rel="noopener noreferrer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.13C5.12 19.56 12 19.56 12 19.56s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
              </a>
              <a href="#" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </ReactLenis>
  );
}
