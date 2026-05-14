import { AboutVideoSection, ContactSection, HeroSocialActions, SiteLayout } from '../components/site';
import { toAssetUrl } from '../lib/assets';
import { usePageMeta } from '../lib/dom';

const WHY_CARDS = ['CLINIC', 'ACADEMY', 'DOCTORS', 'CARE'];

export function HomePage() {
  usePageMeta('Integrat — Next-Generation Dental Company');

  return (
    <SiteLayout
      active="home"
      headerRight={
        <button
          className="btn-black"
          onClick={() => document.getElementById('contactForm')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          type="button"
        >
          GET IN TOUCH
        </button>
      }
    >
      <section className="hero">
        <div className="container hero-inner">
          <h1 className="hero-bg-text">INTEGRAT</h1>

          <div className="hero-visual">
            <div className="hero-black-bg" />
            <img alt="" className="hero-person" src={toAssetUrl('/assets/images/hero-ph-integrat.svg')} />
          </div>

          <div className="hero-card">
            <h3>NEXT-GENERATION DENTAL COMPANY</h3>
            <p>
              A clinic and academy united by one approach to functional, aesthetic, and evidence-led dentistry.
            </p>
          </div>

          <HeroSocialActions />
        </div>
      </section>

      <section className="why-choose">
        <div className="container">
          <h2 className="why-title">WHY CHOOSE OUR CLINIC</h2>

          <div className="why-grid">
            {WHY_CARDS.map((label) => (
              <div key={label} className="why-card">
                <div className="why-icon">
                  <img alt="" src={toAssetUrl('/assets/images/tooth.svg')} />
                </div>
                <div className="why-text">
                  <span className="why-percent">100%</span>
                  <span className="why-label">{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="course-slider">
        <div className="container">
          <div className="course-track">
            <div className="course-slide active">
              <div className="course-card">
                <div className="course-left">
                  <h2 className="course-title">
                    ORGANIZATION
                    <br />
                    OF OCCLUSION
                  </h2>
                  <p className="course-desc">
                    A comprehensive review of occlusion design principles, biomechanics, and practical clinical
                    strategies for controlled tooth movement.
                  </p>
                </div>

                <div className="course-right">
                  <img alt="" className="course-person" src={toAssetUrl('/assets/images/home-page-costume.svg')} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ContactSection />
      <AboutVideoSection />
    </SiteLayout>
  );
}
