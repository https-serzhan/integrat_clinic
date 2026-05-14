import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AcademyHero,
  AcademyIntroText,
  ContactSection,
  PeopleGrid,
  PeopleSlider,
  ReviewsSection,
  SiteLayout
} from '../components/site';
import { DoctorModal } from '../components/doctor';
import { siteData } from '../data/siteData';
import { usePageMeta } from '../lib/dom';
import { toAssetUrl } from '../lib/assets';
import type { AcademyCourse, DoctorProfile } from '../types/models';

function CoursePreviewCards({ courses }: { courses: AcademyCourse[] }) {
  return (
    <div className="academy-grid">
      {courses.map((course) => {
        const image = course.images?.[0] || toAssetUrl('/assets/images/ph-integrat-group.png');
        return (
          <article key={course.id} className="academy-card">
            <div className="academy-card__media">
              <div className="academy-card__images">
                <img alt={course.title} className="academy-card__image active" src={image} />
              </div>
              <div className="academy-card__overlay">
                <div className="academy-card__tags">
                  {(course.tags || []).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <div className="academy-card__rating">
                  <span className="academy-card__star">★</span>
                  <span>{course.rating || '4.8'}</span>
                </div>
              </div>
            </div>
            <div className="academy-card__body">
              <div className="academy-card__header">
                <h3>{course.title}</h3>
                <span className="academy-card__badge">{course.badge || 'Course'}</span>
              </div>
              <p className="academy-card__meta">{course.meta || 'Integrat Academy'}</p>
              <p className="academy-card__desc">{course.description}</p>
              <div className="academy-card__footer">
                <p className="academy-card__price">
                  {course.priceLabel || course.price || '$0'} <span>{course.priceSuffix || ''}</span>
                </p>
                <Link className="academy-card__cta" to="/academy">
                  Open in Academy <span className="academy-card__cta-icon">↗</span>
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function ShowcasePage({
  title,
  heroImage,
  description,
  actionLabel,
  actionHref,
  pageTitle,
  catalogId
}: {
  title: string;
  heroImage: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  pageTitle: string;
  catalogId: string;
}) {
  usePageMeta(pageTitle);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const previewCourses = useMemo(() => siteData.academyCourses.slice(0, 6), []);

  return (
    <>
      <SiteLayout active={null} overlayHeader headerRight={<Link className="btn-black" to="/academy">LOGIN</Link>}>
        <AcademyHero
          actionHref={actionHref}
          actionLabel={actionLabel}
          description={description}
          image={heroImage}
          title={title}
        />

        <AcademyIntroText />

        <section className="doctors-slider">
          <div className="doctors-track">
            <PeopleSlider onSelect={setSelectedDoctor} people={siteData.doctors.slice(0, 4)} />
          </div>
        </section>

        <section className="academy-courses" id={catalogId}>
          <div className="container">
            <div className="academy-courses__header">
              <h2>OUR COURSES</h2>
            </div>

            <CoursePreviewCards courses={previewCourses} />
          </div>
        </section>

        <ReviewsSection />

        <section className="doctors-list">
          <div className="container">
            <div className="doctors-list-header">
              <h2>OUR LECTURERS</h2>
            </div>

            <div className="doctors-grid">
              <PeopleGrid onSelect={setSelectedDoctor} people={siteData.lecturers.slice(0, 4)} />
            </div>
          </div>
        </section>

        <ContactSection />
      </SiteLayout>

      <DoctorModal doctor={selectedDoctor} onClose={() => setSelectedDoctor(null)} open={Boolean(selectedDoctor)} />
    </>
  );
}
