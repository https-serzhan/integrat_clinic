import { useState } from 'react';
import { AboutVideoSection, AcademyHero, AcademyIntroText, PeopleGrid, SiteLayout } from '../components/site';
import { DoctorModal } from '../components/doctor';
import { siteData } from '../data/siteData';
import { usePageMeta } from '../lib/dom';
import type { DoctorProfile } from '../types/models';

export function AboutPage() {
  usePageMeta('Integrat — About');
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);

  return (
    <>
      <SiteLayout active="about" overlayHeader>
        <AcademyHero
          description="Patient-centered, optimal treatment guided by biological limitations, sound biomechanics, and clear functional objectives."
          image="/assets/images/about-hero.svg"
          title="ABOUT US"
        />

        <AcademyIntroText />

        <section className="doctors-list">
          <div className="container">
            <div className="doctors-list-header">
              <h2>OUR TEAM</h2>
            </div>

            <div className="doctors-grid">
              <PeopleGrid onSelect={setSelectedDoctor} people={siteData.doctors.slice(0, 5)} />
            </div>
          </div>
        </section>

        <AboutVideoSection id="aboutVideoSection" />
      </SiteLayout>

      <DoctorModal doctor={selectedDoctor} onClose={() => setSelectedDoctor(null)} open={Boolean(selectedDoctor)} />
    </>
  );
}
