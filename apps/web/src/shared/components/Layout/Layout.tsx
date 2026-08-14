import { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useLocale } from '../../i18n/useLocale';
import '../ui/ui.css';
import './Layout.css';

export function Layout() {
  const { t, locale, toggleLocale } = useLocale();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="layout">
      <header className={`layout-header ${isScrolled ? 'is-scrolled' : ''}`}>
        <div className="layout-header__inner">
          <Link to="/" className="layout-logo">
            <svg viewBox="0 0 48 46" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" />
            </svg>
            ViaQuiz
          </Link>
          
          <nav className={`layout-nav ${isMobileMenuOpen ? 'is-open' : ''}`}>
            <button className="layout-lang-toggle" onClick={toggleLocale}>
              {locale === 'en' ? 'UA' : 'EN'}
            </button>
            <Link to="/#enter-code" className="btn btn--ghost btn--sm">
              {t('nav.enterCode')}
            </Link>
            <Link to="/login" className="btn btn--ghost btn--sm">
              {t('nav.login')}
            </Link>
            <Link to="/register" className="btn btn--primary btn--sm">
              {t('nav.register')}
            </Link>
          </nav>
          
          <button 
            className="layout-hamburger"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>
      
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}
