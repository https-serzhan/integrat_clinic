import { useMemo, useState } from 'react';
import { AppointmentsDashboard, DoctorModal } from '../components/doctor';
import { ContactSection, FilterPills, PeopleGrid, SiteLayout } from '../components/site';
import { siteData } from '../data/siteData';
import { toAssetUrl } from '../lib/assets';
import { usePageMeta } from '../lib/dom';
import type { DoctorProfile } from '../types/models';

const TREATMENT_FILTER_CARDS = [
  { image: '/assets/images/compensation_or_orthosurgery.png', categories: ['veneers'] },
  { image: '/assets/images/maxillary_expansion_final.png', categories: ['implants'] },
  { image: '/assets/images/orthodontic_retreatment_of_open_bite_3.png', categories: ['orthodontics'] },
  { image: '/assets/images/skelet_extension_of_tooth_rows_final.png', categories: ['veneers', 'implants'] },
  { image: '/assets/images/sometimes_one_tooth_can_cause_problem_final.png', categories: ['orthodontics'] },
  { image: '/assets/images/uprighting_without_side_effect.png', categories: ['veneers'] }
];

const TREATMENT_ITEMS = [
  'Preventive Dentistry',
  'Therapeutic Dentistry',
  'Prosthetics',
  'Implantology',
  'Orthodontics'
];

export function DoctorsPage() {
  usePageMeta('Integrat — Doctors', 'page-doctors');
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [doctorSortBy, setDoctorSortBy] = useState<'featured' | 'experience-desc' | 'name-asc'>('featured');
  const [activeTreatmentFilter, setActiveTreatmentFilter] = useState('all');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const doctorCategories = useMemo(
    () => ['all', ...new Set(siteData.doctors.flatMap((doctor) => doctor.categories).filter(Boolean))],
    []
  );
  const treatmentCategories = useMemo(() => ['all', 'veneers', 'implants', 'orthodontics'], []);

  const visibleDoctors = useMemo(() => {
    const filtered =
      activeFilter === 'all'
        ? [...siteData.doctors]
        : siteData.doctors.filter((doctor) => doctor.categories.includes(activeFilter));

    switch (doctorSortBy) {
      case 'experience-desc':
        filtered.sort((left, right) => right.experience - left.experience);
        break;
      case 'name-asc':
        filtered.sort((left, right) => left.name.localeCompare(right.name));
        break;
      default:
        break;
    }

    return filtered;
  }, [activeFilter, doctorSortBy]);

  const visibleTreatments = useMemo(() => {
    if (activeTreatmentFilter === 'all') {
      return TREATMENT_FILTER_CARDS;
    }
    return TREATMENT_FILTER_CARDS.filter((card) => card.categories.includes(activeTreatmentFilter));
  }, [activeTreatmentFilter]);

  return (
    <>
      <SiteLayout
        active="doctors"
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
        <section className="doctors-hero">
          <div className="container doctors-hero-inner">
            <div className="doctors-hero-text">
              <h1>
                OUR
                <br />
                DOCTORS
              </h1>
              <p>
                Preventive examinations,
                <br />
                professional hygiene, fluoridation.
              </p>
            </div>

            <div className="doctors-hero-image">
              <img alt="Dental X-ray" src={toAssetUrl('/assets/images/doctors-hero.svg')} />
            </div>
          </div>
        </section>

        <section className="doctors-list">
          <div className="container">
            <div className="doctors-list-header">
              <h2>OUR DOCTORS</h2>
              <div className="doctors-toolbar">
                <FilterPills active={activeFilter} categories={doctorCategories} className="doctors-filters" onSelect={setActiveFilter} />
                <label className="academy-sort">
                  <span>Sort</span>
                  <select onChange={(event) => setDoctorSortBy(event.target.value as typeof doctorSortBy)} value={doctorSortBy}>
                    <option value="featured">Featured</option>
                    <option value="experience-desc">Most experienced</option>
                    <option value="name-asc">Name: A to Z</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="doctors-grid">
              <PeopleGrid onSelect={setSelectedDoctor} people={visibleDoctors} />
            </div>
          </div>
        </section>

        <section className="doctors-dashboard" id="clientDashboard">
          <div className="container dashboard-main">
            <AppointmentsDashboard />
          </div>
        </section>

        <section className="treatments-page">
          <div className="container">
            <div className="treatments-header">
              <h2>TREATMENTS</h2>
              <FilterPills
                active={activeTreatmentFilter}
                categories={treatmentCategories}
                className="treatments-filters"
                onSelect={setActiveTreatmentFilter}
              />
            </div>

            <div className="treatments-grid">
              <div className="treatments-list">
                {TREATMENT_ITEMS.map((item, index) => {
                  const active = expandedItems.has(index);
                  return (
                    <button
                      key={item}
                      className={`treatment-list-item${active ? ' active' : ''}`}
                      onClick={() =>
                        setExpandedItems((current) => {
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
                      {item} <span>{active ? '−' : '+'}</span>
                    </button>
                  );
                })}
              </div>

              <div className="treatments-cards">
                {visibleTreatments.map((card) => (
                  <button
                    key={card.image}
                    className="treatment-card"
                    onClick={() => setSelectedDoctor(siteData.doctors[0] || null)}
                    type="button"
                  >
                    <img alt="Treatment case" src={toAssetUrl(card.image)} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <ContactSection />
      </SiteLayout>

      <DoctorModal doctor={selectedDoctor} onClose={() => setSelectedDoctor(null)} open={Boolean(selectedDoctor)} />
    </>
  );
}
