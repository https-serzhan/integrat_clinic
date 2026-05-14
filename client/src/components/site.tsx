import { useMemo, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { api } from '../lib/api';
import { toAssetUrl } from '../lib/assets';
import { formatPhoneInput } from '../lib/forms';
import { siteData } from '../data/siteData';
import type { DoctorProfile } from '../types/models';

type NavKey = 'home' | 'clinic' | 'doctors' | 'academy' | 'about' | null;

interface LayoutProps {
  active: NavKey;
  overlayHeader?: boolean;
  headerRight?: React.ReactNode;
  footer?: boolean;
  children: React.ReactNode;
}

const NAV_ITEMS: Array<{ key: Exclude<NavKey, null>; label: string; href: string }> = [
  { key: 'home', label: 'HOME', href: '/' },
  { key: 'clinic', label: 'CLINIC', href: '/clinic' },
  { key: 'doctors', label: 'DOCTORS', href: '/doctors' },
  { key: 'academy', label: 'ACADEMY', href: '/academy' },
  { key: 'about', label: 'ABOUT US', href: '/about' }
];

const SOCIAL_LINKS = [
  {
    href: 'https://www.instagram.com/https.serzhan/',
    label: 'Instagram',
    icon: '/assets/icons/instagram.svg'
  },
  {
    href: 'https://t.me/altawh1d',
    label: 'Telegram',
    icon: '/assets/icons/telegram.svg'
  },
  {
    href: '#',
    label: 'WhatsApp',
    icon: '/assets/icons/whatsapp.svg'
  },
  {
    href: '#',
    label: 'Google',
    icon: '/assets/icons/google.svg'
  }
];

const REVIEW_CARDS = [
  {
    name: 'Ramazan',
    text:
      'Came in for a regular check-up and left with a brighter smile than ever. Quick, painless, and truly caring service.',
    doctor: 'Dr. Aben'
  },
  {
    name: 'Aruzhan',
    text:
      'The team explained every step clearly, and the treatment felt precise from the first visit to the final result.',
    doctor: 'Dr. Kassymova'
  },
  {
    name: 'Dias',
    text:
      'Strong clinical discipline, modern diagnostics, and a process that felt organized instead of improvised.',
    doctor: 'Dr. Sarsembayev'
  },
  {
    name: 'Aliya',
    text:
      'I appreciated the amount of planning behind the treatment. It felt evidence-led and tailored to my case.',
    doctor: 'Dr. Yesimova'
  }
];

export function SiteLayout({ active, overlayHeader, headerRight, footer = true, children }: LayoutProps) {
  return (
    <>
      <header className={`header${overlayHeader ? ' header-overlay' : ''}`}>
        <div className="container header-inner">
          <Link className="logo" to="/">
            INTEGRAT
          </Link>

          <nav className="nav-pill">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.key}
                className={`pill${item.key === active ? ' active' : ''}`}
                to={item.href}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="header-right">{headerRight}</div>
        </div>
      </header>

      {children}

      {footer ? <SiteFooter /> : null}
    </>
  );
}

export function SocialLinks({ className = 'socials', itemClassName = 'social' }: { className?: string; itemClassName?: string }) {
  return (
    <div className={className}>
      {SOCIAL_LINKS.map((item) => (
        <a
          key={item.label}
          className={itemClassName}
          href={item.href}
          aria-label={item.label}
          target={item.href.startsWith('http') ? '_blank' : undefined}
          rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
        >
          <img src={toAssetUrl(item.icon)} alt={item.label} />
        </a>
      ))}
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <div className="site-footer__logo">INTEGRAT</div>
            <p className="site-footer__tagline">
              Next-generation dental ecosystem focused on clinic care, doctors, and academy education.
            </p>
          </div>

          <nav className="site-footer__links">
            {NAV_ITEMS.filter((item) => item.key !== 'doctors').map((item) => (
              <Link key={item.key} className="site-footer__link" to={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="site-footer__meta">
          <p className="site-footer__copy">© 2026 Integrat. All rights reserved.</p>

          <div className="site-footer__socials">
            {SOCIAL_LINKS.map((item) => (
              <a
                key={item.label}
                className="site-footer__social"
                href={item.href}
                aria-label={item.label}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                <img src={toAssetUrl(item.icon)} alt="" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export function AboutVideoSection({ title = 'ABOUT INTEGRAT', id }: { title?: string; id?: string }) {
  return (
    <section className="about-section" id={id}>
      <div className="container about-header">
        <h2 className="about-title">{title}</h2>
      </div>

      <div className="container">
        <div className="video-slider">
          <div className="video-track">
            <div className="video-slide active">
              <video controls preload="metadata" src={siteData.media.homeVideoSrc} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ReviewsSection({ title = 'REVIEWS FROM OUR PATIENTS' }: { title?: string }) {
  return (
    <section className="reviews">
      <div className="container">
        <h2 className="reviews-title">{title}</h2>
      </div>

      <div className="reviews-scroll">
        <div className="reviews-track">
          {REVIEW_CARDS.map((review) => (
            <article key={`${review.name}-${review.doctor}`} className="review-card">
              <h4 className="review-name">{review.name}</h4>
              <p className="review-text">{review.text}</p>
              <span className="review-doctor">{review.doctor}</span>
              <span className="review-dot" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function categoryTitle(value: string) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function FilterPills({
  categories,
  active,
  onSelect,
  className
}: {
  categories: string[];
  active: string;
  onSelect: (value: string) => void;
  className: string;
}) {
  return (
    <div className={className}>
      {categories.map((category) => (
        <button
          key={category}
          className={`${className.includes('academy') ? 'academy-filter' : 'filter-btn'}${category === active ? ' active' : ''}`}
          data-filter={category}
          onClick={() => onSelect(category)}
          type="button"
        >
          {category === 'all' ? 'All' : categoryTitle(category)}
        </button>
      ))}
    </div>
  );
}

function DoctorCard({ person, onSelect }: { person: DoctorProfile; onSelect?: (person: DoctorProfile) => void }) {
  const content = (
    <>
      <div className="doctor-photo">
        <img src={person.image} alt={person.name} />
      </div>
      <h4>{person.name}</h4>
      <p>{person.specialty}</p>
    </>
  );

  if (!onSelect) {
    return <article className="doctor-card">{content}</article>;
  }

  return (
    <article className="doctor-card is-clickable" onClick={() => onSelect(person)} role="button" tabIndex={0}>
      {content}
    </article>
  );
}

export function PeopleGrid({
  people,
  onSelect
}: {
  people: DoctorProfile[];
  onSelect?: (person: DoctorProfile) => void;
}) {
  if (!people.length) {
    return <div className="content-state">Profiles will be added soon.</div>;
  }

  return (
    <>
      {people.map((person) => (
        <DoctorCard key={person.id} person={person} onSelect={onSelect} />
      ))}
    </>
  );
}

export function PeopleTrack({
  people,
  onSelect
}: {
  people: DoctorProfile[];
  onSelect?: (person: DoctorProfile) => void;
}) {
  return (
    <>
      {people.map((person) => (
        <div key={person.id}>
          <DoctorCard person={person} onSelect={onSelect} />
        </div>
      ))}
    </>
  );
}

export function PeopleSlider({
  people,
  onSelect
}: {
  people: DoctorProfile[];
  onSelect?: (person: DoctorProfile) => void;
}) {
  return (
    <>
      {people.map((person, index) => (
        <article
          key={person.id}
          className="doctor-slide doctor-card is-clickable"
          onClick={() => onSelect?.(person)}
          role="button"
          tabIndex={0}
        >
          <div className="doctor-times">
            {person.categories.slice(0, 4).map((category) => (
              <span key={category}>{categoryTitle(category)}</span>
            ))}
          </div>

          <div className="doctor-info">
            <h4>{person.name}</h4>
            <p>{person.specialty}</p>
          </div>

          <button
            className={`doctor-btn ${index === 0 ? '' : 'outline'}`.trim()}
            onClick={(event) => {
              event.stopPropagation();
              onSelect?.(person);
            }}
            type="button"
          >
            More details <span>›</span>
          </button>
        </article>
      ))}
    </>
  );
}

export function ContactSection() {
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('+7');
  const [comment, setComment] = useState('');
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ message: string; error?: boolean }>({ message: '' });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ message: '' });

    if (!agree) {
      setStatus({ message: 'Please consent to personal data processing.', error: true });
      return;
    }

    setSubmitting(true);

    try {
      await api.submitContact({
        fullname,
        phone,
        comment,
        source: window.location.hash || window.location.pathname
      });
      setStatus({ message: 'Your request has been sent successfully.' });
      setFullname('');
      setPhone('+7');
      setComment('');
      setAgree(false);
    } catch (error) {
      setStatus({
        message: error instanceof Error ? error.message : 'Could not submit the form.',
        error: true
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="contact-section">
      <div className="contact-map container">
        <form className="contact-form" id="contactForm" onSubmit={handleSubmit}>
          <h2 className="contact-title">FILL OUT THE FORM</h2>
          <p className="contact-subtitle">
            and our managers will call you
            <br />
            for a detailed consultation
          </p>

          <div className="form-row">
            <input
              name="fullname"
              placeholder="Full name"
              required
              value={fullname}
              onChange={(event) => setFullname(event.target.value)}
            />

            <input
              name="phone"
              placeholder="+7 (___) ___ __ - __"
              required
              value={phone}
              onChange={(event) => setPhone(formatPhoneInput(event.target.value))}
            />
          </div>

          <textarea
            name="comment"
            placeholder="Comment"
            required
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />

          <div className="form-bottom">
            <button className="send-btn" disabled={submitting || !agree} type="submit">
              {submitting ? 'Sending...' : 'Send'}
            </button>

            <label className="checkbox">
              <input checked={agree} onChange={(event) => setAgree(event.target.checked)} name="agree" required type="checkbox" />
              <span className="checkmark" />
              <p>By checking the box, I consent to the processing of my personal data.</p>
            </label>
          </div>

          {status.message ? (
            <p className={`form-status${status.error ? ' is-error' : ' is-success'}`}>{status.message}</p>
          ) : null}
        </form>

        <div className="contact-info">
          <p className="address">Astana, Mangilik El 36</p>
          <p className="phone">+7 747 457 17 40</p>
        </div>

        <iframe
          className="map"
          loading="lazy"
          src="https://www.google.com/maps?q=Astana%20Mangilik%20El%2036&output=embed"
          title="Integrat clinic map"
        />
      </div>
    </section>
  );
}

export function useCourseCategories() {
  return useMemo(
    () => ['all', ...new Set(siteData.academyCourses.map((course) => course.category).filter(Boolean))],
    []
  );
}

export function HeroSocialActions({ bookTo = '/doctors' }: { bookTo?: string }) {
  return (
    <div className="hero-actions">
      <SocialLinks />

      <Link className="book-pill" to={bookTo}>
        Book an appointment <span className="book-arrow">↗</span>
      </Link>
    </div>
  );
}

export function AcademyIntroText() {
  return (
    <section className="academy-text">
      <div className="academy-text-inner">
        <h2 className="academy-title">
          Explore the artistry and
          <br />
          precision behind our
          <br />
          portfolio of timeless
          <br />
          photography
        </h2>

        <div className="academy-info">
          <p>
            Patient-centered, optimal treatment guided not by brands of brackets, aligners, or implants, but by
            biological limitations, sound biomechanics, and clear functional objectives.
          </p>

          <SocialLinks className="academy-socials" itemClassName="social" />
        </div>
      </div>
    </section>
  );
}

export function AcademyHero({
  image,
  title,
  description,
  actionLabel,
  actionHref
}: {
  image: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <section className="academy-hero">
      <div className="academy-slide" style={{ backgroundImage: `url(${toAssetUrl(image)})` }}>
        <div className="academy-overlay" />

        <div className="container academy-content">
          <h1>{title}</h1>
          <p>{description}</p>
          {actionLabel && actionHref ? (
            actionHref.startsWith('#') ? (
              <button
                className="academy-btn academy-btn--button"
                onClick={() => {
                  const target = document.getElementById(actionHref.slice(1));
                  target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                type="button"
              >
                {actionLabel} <span>↗</span>
              </button>
            ) : (
              <Link className="academy-btn" to={actionHref}>
                {actionLabel} <span>↗</span>
              </Link>
            )
          ) : null}
        </div>
      </div>
    </section>
  );
}
