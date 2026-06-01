import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import defaultContent from './defaultContent.json';
import './App.css';

function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState('en');
  const [openSection, setOpenSection] = useState(null);
  const [content, setContent] = useState(defaultContent);

  // Fetch live content from API; fall back silently to bundled defaultContent
  useEffect(() => {
    fetch('/api/content')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setContent(data); })
      .catch(() => { /* keep defaultContent */ });
  }, []);

  const t = (key) => content.translations?.[key]?.[language] || key;
  const tx = (obj) => (obj && typeof obj === 'object') ? (obj[language] || obj.en || '') : '';

  const houseInfo = content.houseInfo || [];
  const outdoor = content.outdoor || [];
  const favoriteMoments = content.favoriteMoments || [];
  const rules = content.rules || [];
  const localRecs = content.localRecs || [];
  const contact = content.contact || {};

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    document.body.style.overflow = !isMobileMenuOpen ? 'hidden' : 'unset';
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = 'unset';
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    closeMobileMenu();
  };

  const phoneHref = contact.phone ? `tel:${contact.phone}` : 'tel:';
  const phoneDisplay = contact.phoneDisplay || contact.phone || '';

  return (
    <div className="App">
      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          <div className="logo">
            <span className="logo-text">Dimora del Tramonto</span>
            <span className="logo-subtitle">{t('navGuide')}</span>
          </div>

          <nav className="nav-desktop">
            <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>{t('navHome')}</a>
            <a href="#arrival" onClick={(e) => { e.preventDefault(); scrollTo('arrival'); }}>{t('navArrival')}</a>
            <a href="#house" onClick={(e) => { e.preventDefault(); scrollTo('house'); }}>{t('navHouse')}</a>
            <a href="#outdoor" onClick={(e) => { e.preventDefault(); scrollTo('outdoor'); }}>{t('navOutdoor')}</a>
            <a href="#rules" onClick={(e) => { e.preventDefault(); scrollTo('rules'); }}>{t('navRules')}</a>
            <a href="#local" onClick={(e) => { e.preventDefault(); scrollTo('local'); }}>{t('navLocal')}</a>
          </nav>

          <div className="header-right">
            <div className="language-switcher">
              <button className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>EN</button>
              <button className={language === 'it' ? 'active' : ''} onClick={() => setLanguage('it')}>IT</button>
              <button className={language === 'de' ? 'active' : ''} onClick={() => setLanguage('de')}>DE</button>
            </div>
            <a href={phoneHref} className="book-button">{t('assistance')}</a>
            <button className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`} onClick={toggleMobileMenu} aria-label="Menu">
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>

        <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <nav className="mobile-nav">
            <a href="#top" onClick={(e) => { e.preventDefault(); closeMobileMenu(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>{t('navHome')}</a>
            <a href="#arrival" onClick={(e) => { e.preventDefault(); scrollTo('arrival'); }}>{t('navArrival')}</a>
            <a href="#house" onClick={(e) => { e.preventDefault(); scrollTo('house'); }}>{t('navHouse')}</a>
            <a href="#outdoor" onClick={(e) => { e.preventDefault(); scrollTo('outdoor'); }}>{t('navOutdoor')}</a>
            <a href="#rules" onClick={(e) => { e.preventDefault(); scrollTo('rules'); }}>{t('navRules')}</a>
            <a href="#local" onClick={(e) => { e.preventDefault(); scrollTo('local'); }}>{t('navLocal')}</a>
            <a href={phoneHref} className="mobile-book-button">
              <Icon name="phone" size={16} /> {phoneDisplay}
            </a>
          </nav>
        </div>
      </header>

      <section className="ghid-hero" id="top">
        <div className="ghid-hero-overlay"></div>
        <div className="ghid-hero-content">
          <span className="hero-badge">Dimora del Tramonto Toscano</span>
          <h1 className="ghid-hero-title"><span>{t('heroWelcome')}</span></h1>
          <p className="ghid-hero-tagline">{t('heroTagline')}</p>
          <p className="ghid-hero-subtitle">{t('heroSubtitle')}</p>
          <button className="ghid-hero-cta" onClick={() => scrollTo('arrival')}>
            <span>{t('heroScroll')}</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 4v12m0 0l-6-6m6 6l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </section>

      <section className="ghid-intro" id="arrival">
        <div className="container">
          <span className="section-label">{t('arrivalLabel')}</span>
          <h2 className="section-title">{t('arrivalTitle')} <span className="accent">{t('arrivalTitleAccent')}</span></h2>
          <p className="ghid-intro-text">{t('arrivalText')}</p>
        </div>
      </section>

      <section className="ghid-guide" id="house">
        <div className="container">
          <span className="section-label centered">{t('houseInfoLabel')}</span>
          <h2 className="section-title centered">{t('houseInfoTitle')} <span className="accent">{t('houseInfoTitleAccent')}</span></h2>
          <p className="ghid-section-intro centered">{t('houseInfoIntro')}</p>

          <div className="info-grid">
            {houseInfo.map((info, idx) => (
              <div className="info-card" key={idx}>
                <div className="info-card-icon"><Icon name={info.icon} size={26} strokeWidth={1.5} /></div>
                <h3 className="info-card-title">{tx(info.title)}</h3>
                {info.items && (
                  <ul className="info-list">
                    {info.items.map((item, i) => (
                      <li key={i}>
                        <span className="info-key">{tx(item.label)}</span>
                        <span className="info-val">{tx(item.value)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {info.description && <p className="info-card-text">{tx(info.description)}</p>}
              </div>
            ))}
          </div>

          <div className="assistance-card">
            <div className="assistance-icon"><Icon name="phone" size={30} strokeWidth={1.6} /></div>
            <div className="assistance-content">
              <h3>{t('assistanceTitle')}</h3>
              <p>{t('assistanceText')}</p>
              <a href={phoneHref} className="assistance-button">
                {t('callUs')} · {phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="ghid-outdoor" id="outdoor">
        <div className="container">
          <span className="section-label centered">{t('outdoorLabel')}</span>
          <h2 className="section-title centered">{t('outdoorTitle')} <span className="accent">{t('outdoorTitleAccent')}</span></h2>

          <div className="outdoor-grid">
            {outdoor.map((item, idx) => (
              <article className="outdoor-card" key={idx}>
                <div className="outdoor-card-image" style={{ backgroundImage: `url(${item.image})` }}>
                  <span className="outdoor-card-icon"><Icon name={item.icon} size={22} strokeWidth={1.6} /></span>
                </div>
                <div className="outdoor-card-body">
                  <h3 className="outdoor-card-title">{tx(item.title)}</h3>
                  <p className="outdoor-card-description">{tx(item.description)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ghid-moments">
        <div className="container">
          <span className="section-label centered">{t('momentsLabel')}</span>
          <h2 className="section-title centered">{t('momentsTitle')} <span className="accent">{t('momentsTitleAccent')}</span></h2>

          <div className="moments-grid">
            {favoriteMoments.map((m, idx) => (
              <div className="moment-card" key={idx}>
                <span className="moment-icon"><Icon name={m.icon} size={36} strokeWidth={1.3} /></span>
                <p>{tx(m.text)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ghid-rules" id="rules">
        <div className="container">
          <span className="section-label centered">{t('rulesLabel')}</span>
          <h2 className="section-title centered">{t('rulesTitle')}<span className="accent">{t('rulesTitleAccent')}</span></h2>
          <p className="ghid-section-intro centered">{t('rulesIntro')}</p>

          <div className="rules-list">
            {rules.map((rule, idx) => (
              <div className={`rule-item ${openSection === idx ? 'open' : ''}`} key={idx}>
                <button className="rule-header" onClick={() => setOpenSection(openSection === idx ? null : idx)}>
                  <span className="rule-icon"><Icon name={rule.icon} size={22} strokeWidth={1.6} /></span>
                  <span className="rule-title">{tx(rule.title)}</span>
                  <span className="rule-toggle"><Icon name="chevronDown" size={20} strokeWidth={2} /></span>
                </button>
                {openSection === idx && (
                  <div className="rule-body"><p>{tx(rule.text)}</p></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ghid-electricity">
        <div className="container">
          <div className="electricity-card">
            <div className="electricity-icon"><Icon name="zap" size={36} strokeWidth={1.5} /></div>
            <div>
              <span className="section-label">{t('electricityLabel')}</span>
              <h3>{t('electricityTitle')} <span className="accent">{t('electricityTitleAccent')}</span></h3>
              <p>{t('electricityText')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="ghid-local" id="local">
        <div className="container">
          <span className="section-label centered">{t('localLabel')}</span>
          <h2 className="section-title centered">{t('localTitle')} <span className="accent">{t('localTitleAccent')}</span></h2>
          <p className="ghid-section-intro centered">{t('localIntro')}</p>

          <div className="local-grid">
            {localRecs.map((rec, idx) => (
              <div className="local-card" key={idx}>
                <div className="local-card-header">
                  <span className="local-icon"><Icon name={rec.icon} size={26} strokeWidth={1.5} /></span>
                  <h3>{tx(rec.title)}</h3>
                </div>
                <ul className="local-places">
                  {rec.places && rec.places.map((p, i) => (
                    <li key={i}>
                      <strong>{p.name}</strong>
                      <span>{tx(p.note)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>Dimora del Tramonto Toscano</h3>
              <p>{t('footerTagline')}</p>
              <p className="footer-location">📍 {t('footerLocation')}</p>
            </div>
            <div className="footer-section">
              <h4>{t('assistance')}</h4>
              <ul className="contact-list">
                <li>
                  <Icon name="phone" size={16} strokeWidth={1.6} />
                  {phoneDisplay}
                </li>
                <li>
                  <Icon name="mapPin" size={16} strokeWidth={1.6} />
                  {contact.address || 'Florence Countryside, Tuscany'}
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Dimora del Tramonto Toscano. {t('footerRights')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
