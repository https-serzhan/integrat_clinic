import { useEffect, useMemo, useRef, useState } from 'react';
import { HeroSocialActions, PeopleTrack, SiteLayout } from '../components/site';
import { DoctorModal } from '../components/doctor';
import { siteData } from '../data/siteData';
import { toAssetUrl } from '../lib/assets';
import { usePageMeta } from '../lib/dom';
import type { DoctorProfile } from '../types/models';

const DIRECTION_CARDS = [
  {
    index: '01',
    title: 'Interceptive\ntreatment',
    description:
      'Early detection of changes in the masticatory system in children to prevent the development of pathology.'
  },
  {
    index: '02',
    title: 'Preventive\ntreatment',
    description: 'A set of measures aimed at preventing disorders in the dentoalveolar system.'
  },
  {
    index: '03',
    title: 'Reconstructive\ntreatment',
    description:
      'Evidence-led rehabilitation that restores function and structure while preserving biological limits.'
  }
];

const SERVICE_CARDS = [
  {
    title: 'Preventive\nDentistry',
    description: 'Preventive examinations, professional hygiene, fluoridation.'
  },
  {
    title: 'Therapeutic\nDentistry',
    description: 'Treatment of caries, pulpitis, filling.'
  },
  {
    title: 'Prosthetics',
    description: 'Crowns, bridges, removable and non-removable prostheses.'
  },
  {
    title: 'Implantology',
    description: 'Guided implant placement, reconstruction planning, and site development.'
  },
  {
    title: 'Orthodontics',
    description: 'Aligners, braces, occlusion control, and interdisciplinary bite correction.'
  },
  {
    title: 'Aesthetic\nDentistry',
    description: 'Smile design, veneers, direct restorations, and minimally invasive enhancement.'
  },
  {
    title: 'Periodontology',
    description: 'Soft-tissue care, inflammation control, and maintenance protocols.'
  },
  {
    title: 'Pediatric\nDentistry',
    description: 'Behavior-guided care, prevention, and minimally invasive pediatric treatment.'
  }
];

const TREATMENT_IMAGES = [
  '/assets/images/compensation_or_orthosurgery.png',
  '/assets/images/maxillary_expansion_final.png',
  '/assets/images/orthodontic_retreatment_of_open_bite_3.png',
  '/assets/images/skelet_extension_of_tooth_rows_final.png',
  '/assets/images/sometimes_one_tooth_can_cause_problem_final.png',
  '/assets/images/uprighting_without_side_effect.png'
];

export function ClinicPage() {
  usePageMeta('Integrat — Clinic', 'page-clinic');
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [activeServices, setActiveServices] = useState<Set<number>>(new Set());
  const [activeTreatmentIndex, setActiveTreatmentIndex] = useState(1);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveTreatmentIndex((current) => (current + 1) % TREATMENT_IMAGES.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const slider = sliderRef.current;
    const activeSlide = slideRefs.current[activeTreatmentIndex];
    if (!slider || !activeSlide) return;

    const targetLeft = activeSlide.offsetLeft - slider.clientWidth / 2 + activeSlide.clientWidth / 2;
    slider.scrollTo({ left: Math.max(targetLeft, 0), behavior: 'smooth' });
  }, [activeTreatmentIndex]);

  const featuredDoctors = useMemo(() => siteData.doctors.slice(0, 5), []);

  return (
    <>
      <SiteLayout
        active="clinic"
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
        <section className="hero clinic-hero">
          <div className="container hero-inner">
            <h1 className="hero-bg-text">CLINIC</h1>

            <div className="hero-visual">
              <div className="hero-black-bg" />
              <img alt="" className="hero-person" src={toAssetUrl('/assets/images/clinic-hero.svg')} />
            </div>

            <div className="hero-card clinic-mission">
              <h3>OUR MISSION</h3>
              <p>
                We restore functional and bioesthetic harmony through a biologically driven, technology-enhanced
                approach, grounded in science and ethics.
              </p>
            </div>

            <HeroSocialActions />
          </div>
        </section>

        <section className="clinic-directions">
          <div className="container clinic-directions-grid">
            <div className="clinic-directions-text">
              <h2>
                OUR CLINIC PROVIDES
                <br />
                CARE IN THREE MAIN
                <br />
                TREATMENT
                <br />
                DIRECTIONS:
              </h2>
            </div>

            <div className="clinic-tooth">
              <img alt="Tooth model" src={toAssetUrl('/assets/images/tooth-clinic.svg')} />
            </div>

            {DIRECTION_CARDS.map((card, index) => (
              <div key={card.index} className={`clinic-card card-0${index + 1}`}>
                <span className="card-index">{card.index}</span>
                <h4>
                  {card.title.split('\n').map((line) => (
                    <span key={line}>
                      {line}
                      <br />
                    </span>
                  ))}
                </h4>
                <p>{card.description}</p>
              </div>
            ))}

            <div className="clinic-principle">
              <h3>OUR CORE PRINCIPLE:</h3>
              <p>
                Patient-centered, optimal treatment guided not by brands of brackets, aligners, or implants, but by
                biological limitations, sound biomechanics, and clear functional objectives.
              </p>
            </div>
          </div>
        </section>

        <section className="clinic-services">
          <div className="container">
            <div className="clinic-services-grid">
              {SERVICE_CARDS.map((service, index) => {
                const active = activeServices.has(index);
                return (
                  <div key={service.title} className={`service-card${active ? ' is-active' : ''}`}>
                    <button
                      className="service-plus"
                      onClick={() =>
                        setActiveServices((current) => {
                          const next = new Set(current);
                          if (next.has(index)) {
                            next.delete(index);
                          } else {
                            next.add(index);
                          }
                          return next;
                        })
                      }
                      type="button"
                    >
                      {active ? '−' : '+'}
                    </button>
                    <h4>
                      {service.title.split('\n').map((line) => (
                        <span key={line}>
                          {line}
                          <br />
                        </span>
                      ))}
                    </h4>
                    <p>{service.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="clinic-doctors">
          <div className="container doctors-header">
            <h2>OUR DOCTORS</h2>
            <a aria-label="All cases" className="treat-overlay-right" href="/doctors">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </a>
          </div>

          <div className="doctors-scroll">
            <div className="doctors-track">
              <PeopleTrack onSelect={setSelectedDoctor} people={featuredDoctors} />
            </div>
          </div>
        </section>

        <section className="treatments">
          <div className="container treatments-top">
            <button
              aria-label="Previous"
              className="treat-arrow prev"
              onClick={() =>
                setActiveTreatmentIndex((current) => (current - 1 + TREATMENT_IMAGES.length) % TREATMENT_IMAGES.length)
              }
              type="button"
            >
              ←
            </button>

            <div className="treatments-text">
              <h2 className="treatments-title">TREATMENTS</h2>
              <p className="treatments-subtitle">
                We provide comprehensive dental treatment services handling a wide range of cases, from basic fillings
                or veneers to complex interdisciplinary cases with orthodontic treatments, implants.
              </p>
            </div>

            <button
              aria-label="Next"
              className="treat-arrow next"
              onClick={() => setActiveTreatmentIndex((current) => (current + 1) % TREATMENT_IMAGES.length)}
              type="button"
            >
              →
            </button>
          </div>

          <div className="treatments-slider" ref={sliderRef}>
            <div className="treatments-track">
              {TREATMENT_IMAGES.map((image, index) => (
                <article
                  key={image}
                  className={`treat-slide${index === activeTreatmentIndex ? ' is-active' : ''}`}
                  ref={(element) => {
                    slideRefs.current[index] = element;
                  }}
                >
                  <div className="treat-card">
                    <img alt="Treatment case" src={toAssetUrl(image)} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </SiteLayout>

      <DoctorModal doctor={selectedDoctor} onClose={() => setSelectedDoctor(null)} open={Boolean(selectedDoctor)} />
    </>
  );
}
