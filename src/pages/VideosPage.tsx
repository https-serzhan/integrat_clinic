import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SiteFooter } from '../components/site';
import { useSession } from '../app/session';
import { buildPaymentDetails, findCourseMetadata, flattenCourseLessons, getCourseOutline } from '../lib/academy';
import { api } from '../lib/api';
import { usePageMeta } from '../lib/dom';
import type { CoursePaymentSettings } from '../types/models';

export function VideosPage() {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('course') || 'endo-faq';
  const course = useMemo(() => findCourseMetadata(courseId), [courseId]);
  const outline = useMemo(() => getCourseOutline(courseId), [courseId]);
  const lessons = useMemo(() => flattenCourseLessons(courseId), [courseId]);
  const activeLesson = lessons[0];
  usePageMeta('Integrat — Course Viewer', 'videos-page');

  const { user } = useSession();
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([0]));
  const [hasAccess, setHasAccess] = useState(false);
  const [loadingAccess, setLoadingAccess] = useState(true);
  const [purchaseStatus, setPurchaseStatus] = useState<string | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<CoursePaymentSettings | null>(null);
  const [banner, setBanner] = useState<{ message: string; action?: 'buy' | 'login' }>({ message: '' });

  const lesson = lessons[currentLessonIndex] || activeLesson || null;

  useEffect(() => {
    setCurrentLessonIndex(0);
    setOpenSections(new Set([0]));
  }, [courseId]);

  useEffect(() => {
    async function verifyAccess() {
      setLoadingAccess(true);

      if (!user) {
        setHasAccess(false);
        setBanner({ message: 'Please log in from Academy to access or buy this course.', action: 'login' });
        setLoadingAccess(false);
        return;
      }

      try {
        const response = await api.courseAccess(courseId);
        setHasAccess(response.hasAccess);
        setPaymentSettings(response.payment || null);
        setPurchaseStatus(response.purchase?.status || null);

        if (response.hasAccess) {
          setBanner({ message: '' });
        } else if (response.purchase?.status === 'pending') {
          setBanner({ message: 'Pending Approval' });
        } else {
          setBanner({ message: 'Purchase this course to unlock all lessons.', action: 'buy' });
        }
      } catch (error) {
        setHasAccess(false);
        setBanner({
          message: error instanceof Error ? `Access check failed: ${error.message}` : 'Access check failed.'
        });
      } finally {
        setLoadingAccess(false);
      }
    }

    void verifyAccess();
  }, [courseId, user]);

  async function handlePurchase() {
    const accepted = window.confirm(
      `Payment details\n\n${buildPaymentDetails(paymentSettings)}\n\nAfter payment, press OK to send your payment request.`
    );
    if (!accepted) return;

    try {
      const note = window.prompt('Optional: add transfer comment or transaction time', '') || '';
      await api.purchaseCourse(courseId, { paymentProvider: 'kaspi', requestNote: note });
      setHasAccess(false);
      setPurchaseStatus('pending');
      setBanner({ message: 'Payment request sent. Admin will review it shortly.' });
    } catch (error) {
      setBanner({
        message: error instanceof Error ? `Purchase failed. ${error.message}` : 'Purchase failed.'
      });
    }
  }

  function renderPlayer() {
    if (!lesson) {
      return <div className="videos-player__empty">Select a lesson to begin.</div>;
    }

    if (lesson.type === 'resource') {
      return (
        <div className="videos-player__resource" style={{ backgroundImage: `url('${lesson.previewImage}')` }}>
          <div className="videos-player__resource-content">
            <span className="videos-player__pill">PDF</span>
            <h2>{lesson.title}</h2>
            <p>{lesson.resourceLabel || 'Supporting material'}</p>
            {lesson.resourceUrl ? (
              <a className="videos-player__action" href={lesson.resourceUrl} rel="noopener noreferrer" target="_blank">
                Open PDF
              </a>
            ) : null}
          </div>
        </div>
      );
    }

    return (
      <video
        className="videos-player__video"
        controls
        playsInline
        poster={lesson.previewImage}
        preload="metadata"
        src={lesson.videoSrc || 'https://www.w3schools.com/html/mov_bbb.mp4'}
      />
    );
  }

  return (
    <>
      <header className="videos-header">
        <Link aria-label="Back to academy" className="videos-back" to="/academy">
          ←
        </Link>
        <Link className="videos-close" to="/academy">
          Close
        </Link>
      </header>

      <main className="videos-layout">
        <aside className="videos-sidebar" id="videosSidebar">
          {!outline ? (
            <article className="videos-card active">
              <div className="videos-card__meta">
                <p className="videos-card__title">Course outline is not available yet.</p>
              </div>
            </article>
          ) : (
            outline.sections.map((section, sectionIndex) => {
              const isOpen = openSections.has(sectionIndex);
              let lessonOffset = 0;
              for (let index = 0; index < sectionIndex; index += 1) {
                lessonOffset += outline.sections[index]?.lessons.length || 0;
              }

              return (
                <article key={section.title} className={`videos-card${isOpen ? ' active' : ''}`} data-section-index={sectionIndex}>
                  <button
                    className="videos-card__top"
                    onClick={() =>
                      setOpenSections((current) => {
                        const next = new Set(current);
                        if (next.has(sectionIndex)) {
                          next.delete(sectionIndex);
                        } else {
                          next.add(sectionIndex);
                        }
                        return next;
                      })
                    }
                    type="button"
                  >
                    <div className="videos-card__meta">
                      <p className="videos-card__title">{section.title}</p>
                      <span className="videos-card__count">{section.lessons.length} items</span>
                    </div>
                    <span className="videos-card__toggle">{isOpen ? '⌄' : '›'}</span>
                  </button>

                  <ul className="videos-list">
                    {section.lessons.map((sectionLesson, lessonIndex) => {
                      const flattenedIndex = lessonOffset + lessonIndex;
                      const current = lessons[flattenedIndex];
                      const icon = sectionLesson.type === 'resource' ? 'PDF' : '▶';
                      return (
                        <li key={`${section.title}-${sectionLesson.title}`}>
                          <button
                            className={`videos-list__item${flattenedIndex === currentLessonIndex ? ' is-current' : ''}`}
                            onClick={() => {
                              setCurrentLessonIndex(flattenedIndex);
                              setOpenSections((currentOpen) => new Set(currentOpen).add(sectionIndex));
                            }}
                            type="button"
                          >
                            <span className="videos-list__icon">{icon}</span>
                            <span className="videos-list__text">{current?.title || sectionLesson.title}</span>
                            {sectionLesson.type === 'resource' ? <span className="videos-list__badge">PDF</span> : null}
                            <span className="videos-list__chevron">›</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </article>
              );
            })
          )}
        </aside>

        <section className="videos-content">
          <div className={`videos-access${!banner.message ? ' videos-access--hidden' : ''}`} id="videosAccessBanner">
            {banner.message}
            {banner.action === 'login' ? (
              <>
                {' '}
                <Link to="/academy">Academy</Link>
              </>
            ) : null}
            {banner.action === 'buy' && purchaseStatus !== 'pending' ? (
              <>
                {' '}
                <button className="btn-black" id="videosBuyNow" onClick={handlePurchase} type="button">
                  Buy Course
                </button>
              </>
            ) : null}
          </div>

          <div className="videos-text">
            <h1>{lesson?.title || course?.title || 'Course Viewer'}</h1>
            <p>{lesson ? `${lesson.courseSubtitle} · ${lesson.sectionTitle}` : course?.description || 'Lesson overview'}</p>
          </div>

          <div className={`videos-player${!hasAccess && !loadingAccess ? ' is-locked' : ''}`} id="videosPlayer">
            <div className="videos-player__stage" id="videosPlayerStage">
              {renderPlayer()}
            </div>
          </div>

          <div className={`videos-controls${!hasAccess && !loadingAccess ? ' is-locked' : ''}`}>
            <div className="videos-progress" id="videosProgress">
              Lesson {lessons.length ? currentLessonIndex + 1 : 0} of {lessons.length}
            </div>

            <div className="videos-nav">
              <button
                className="videos-nav__btn"
                disabled={currentLessonIndex <= 0}
                onClick={() => setCurrentLessonIndex((current) => Math.max(current - 1, 0))}
                type="button"
              >
                ←
              </button>
              <button
                className="videos-nav__btn"
                disabled={currentLessonIndex >= lessons.length - 1}
                onClick={() => setCurrentLessonIndex((current) => Math.min(current + 1, lessons.length - 1))}
                type="button"
              >
                →
              </button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
