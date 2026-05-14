import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AcademyAuthModal } from '../components/academy';
import { DoctorModal } from '../components/doctor';
import {
  AcademyHero,
  AcademyIntroText,
  ContactSection,
  FilterPills,
  PeopleGrid,
  ReviewsSection,
  SiteLayout
} from '../components/site';
import { useSession } from '../app/session';
import { siteData } from '../data/siteData';
import { mergeCourseWithMetadata, buildPaymentDetails } from '../lib/academy';
import { api } from '../lib/api';
import { toAssetUrl } from '../lib/assets';
import { usePageMeta } from '../lib/dom';
import type { AcademyCourse, CoursePaymentSettings, DoctorProfile } from '../types/models';

function CourseCards({
  courses,
  onPurchase
}: {
  courses: AcademyCourse[];
  onPurchase: (course: AcademyCourse) => void;
}) {
  const [imageIndexes, setImageIndexes] = useState<Record<string, number>>({});

  if (!courses.length) {
    return <div className="content-state">No courses match this filter yet.</div>;
  }

  return (
    <>
      {courses.map((course) => {
        const images = course.images?.length ? course.images : [toAssetUrl('/assets/images/ph-integrat-group.png')];
        const activeIndex = imageIndexes[course.id] || 0;
        const hasAccess = Boolean(course.hasAccess);
        const isPending = String(course.purchaseStatus || '').toLowerCase() === 'pending';
        const actionLabel = hasAccess ? 'Open Course' : isPending ? 'Pending Approval' : 'Buy Course';

        return (
          <article key={course.id} className="academy-card">
            <div className="academy-card__media">
              <div className="academy-card__images">
                {images.map((image, index) => (
                  <img
                    key={`${course.id}-${image}`}
                    alt={course.title}
                    className={`academy-card__image${index === activeIndex ? ' active' : ''}`}
                    src={image}
                  />
                ))}
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
              <div className="academy-card__dots">
                {images.map((image, index) => (
                  <button
                    key={`${course.id}-dot-${image}`}
                    aria-label={`Image ${index + 1}`}
                    className={`academy-card__dot${index === activeIndex ? ' active' : ''}`}
                    onClick={() => setImageIndexes((current) => ({ ...current, [course.id]: index }))}
                    type="button"
                  />
                ))}
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

                {hasAccess ? (
                  <Link className="academy-card__cta" to={`/videos?course=${encodeURIComponent(course.id)}`}>
                    {actionLabel} <span className="academy-card__cta-icon">↗</span>
                  </Link>
                ) : (
                  <button
                    className="academy-card__cta"
                    disabled={isPending}
                    onClick={() => onPurchase(course)}
                    type="button"
                  >
                    {actionLabel} <span className="academy-card__cta-icon">↗</span>
                  </button>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </>
  );
}

export function AcademyPage() {
  usePageMeta('Integrat — Academy');
  const { loading, logout, user } = useSession();
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [courses, setCourses] = useState<AcademyCourse[]>(siteData.academyCourses);
  const [feedback, setFeedback] = useState<{ message: string; error?: boolean }>({ message: '' });
  const [paymentSettings, setPaymentSettings] = useState<CoursePaymentSettings | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating-desc' | 'title-asc'>('featured');
  const [visibleCount, setVisibleCount] = useState(6);
  const [authOpen, setAuthOpen] = useState(false);

  async function loadCourses() {
    try {
      const response = await api.listCourses();
      const merged = Array.isArray(response.courses) && response.courses.length
        ? response.courses.map((course) => mergeCourseWithMetadata(course as AcademyCourse))
        : siteData.academyCourses;

      setCourses(merged);
      setPaymentSettings(response.payment || null);
      setFeedback({ message: '' });
    } catch (error) {
      setCourses(siteData.academyCourses);
      setFeedback({
        message: error instanceof Error ? error.message : 'Unable to load remote courses.',
        error: true
      });
    }
  }

  useEffect(() => {
    void loadCourses();
  }, [user]);

  const categories = useMemo(
    () => ['all', ...new Set(courses.map((course) => course.category).filter(Boolean))],
    [courses]
  );

  const filteredCourses = useMemo(() => {
    if (activeFilter === 'all') return courses;
    return courses.filter((course) => course.category === activeFilter);
  }, [activeFilter, courses]);

  const sortedCourses = useMemo(() => {
    const next = [...filteredCourses];
    switch (sortBy) {
      case 'price-asc':
        next.sort((left, right) => (left.priceValue || 0) - (right.priceValue || 0));
        break;
      case 'price-desc':
        next.sort((left, right) => (right.priceValue || 0) - (left.priceValue || 0));
        break;
      case 'rating-desc':
        next.sort((left, right) => Number(right.rating || 0) - Number(left.rating || 0));
        break;
      case 'title-asc':
        next.sort((left, right) => left.title.localeCompare(right.title));
        break;
      default:
        break;
    }
    return next;
  }, [filteredCourses, sortBy]);

  const visibleCourses = useMemo(() => sortedCourses.slice(0, visibleCount), [sortedCourses, visibleCount]);
  const purchasedCourses = useMemo(() => courses.filter((course) => course.hasAccess), [courses]);

  async function handlePurchase(course: AcademyCourse) {
    if (!user) {
      setFeedback({ message: 'Please log in from Academy to access or buy this course.', error: true });
      setAuthOpen(true);
      return;
    }

    const accepted = window.confirm(
      `Payment details\n\n${buildPaymentDetails(paymentSettings)}\n\nAfter payment, press OK to send your payment request.`
    );
    if (!accepted) return;

    try {
      const note = window.prompt('Optional: add transfer comment or transaction time', '') || '';
      await api.purchaseCourse(course.id, { paymentProvider: 'kaspi', requestNote: note });
      setFeedback({ message: 'Payment request sent. Admin will review it shortly.' });
      await loadCourses();
    } catch (error) {
      setFeedback({
        message: error instanceof Error ? error.message : 'Purchase failed.',
        error: true
      });
    }
  }

  return (
    <>
      <SiteLayout
        active="academy"
        overlayHeader
        headerRight={
          <>
            <button className="btn-black" onClick={() => (user ? logout() : setAuthOpen(true))} type="button">
              {loading ? '...' : user ? 'LOGOUT' : 'LOGIN'}
            </button>
            {user?.role === 'admin' ? (
              <Link className="btn-black" id="academyAdminLink" to="/admin">
                ADMIN
              </Link>
            ) : null}
          </>
        }
      >
        <AcademyHero
          actionHref="#contactForm"
          actionLabel="Book an appointment"
          description="A comprehensive review of occlusion design principles, biomechanics, and practical clinical strategies for controlled tooth movement."
          image="/assets/images/academy-hero.png"
          title="ACADEMY"
        />

        <AcademyIntroText />

        <section className="academy-courses">
          <div className="container">
            <div className="academy-courses__header">
              <h2>OUR COURSES</h2>
              <div className="academy-toolbar">
                <FilterPills
                  active={activeFilter}
                  categories={categories}
                  className="academy-filters"
                  onSelect={(value) => {
                    setActiveFilter(value);
                    setVisibleCount(6);
                  }}
                />

                <label className="academy-sort">
                  <span>Sort</span>
                  <select onChange={(event) => setSortBy(event.target.value as typeof sortBy)} value={sortBy}>
                    <option value="featured">Featured</option>
                    <option value="rating-desc">Top rated</option>
                    <option value="price-asc">Price: low to high</option>
                    <option value="price-desc">Price: high to low</option>
                    <option value="title-asc">Title: A to Z</option>
                  </select>
                </label>
              </div>
            </div>

            {feedback.message ? (
              <p className={`academy-feedback${feedback.error ? ' is-error' : ' is-success'}`}>{feedback.message}</p>
            ) : null}

            <div className="academy-grid">
              <CourseCards courses={visibleCourses} onPurchase={handlePurchase} />
            </div>

            <div className="academy-more">
              {sortedCourses.length > visibleCount ? (
                <button className="academy-more__button" onClick={() => setVisibleCount((current) => current + 3)} type="button">
                  show more
                </button>
              ) : null}
            </div>
          </div>
        </section>

        {user ? (
          <section className="academy-purchases" id="academyPurchasedCourses">
            <div className="container">
              <div className="academy-purchases__head">Purchased Courses</div>
              <div className="academy-purchases__list" id="academyPurchasedCoursesList">
                {purchasedCourses.length ? (
                  purchasedCourses.map((course) => (
                    <Link key={course.id} className="academy-purchases__item" to={`/videos?course=${encodeURIComponent(course.id)}`}>
                      <span>{course.title}</span>
                      <span>↗</span>
                    </Link>
                  ))
                ) : (
                  <p className="academy-purchases__empty">No purchased courses yet.</p>
                )}
              </div>
            </div>
          </section>
        ) : null}

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
      <AcademyAuthModal onClose={() => setAuthOpen(false)} open={authOpen} />
    </>
  );
}
