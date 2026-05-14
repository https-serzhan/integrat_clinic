import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SiteFooter } from '../components/site';
import { siteData } from '../data/siteData';
import { api } from '../lib/api';
import { formatPhoneInput } from '../lib/forms';
import { usePageMeta } from '../lib/dom';

const SECONDARY_CARDS = [
  {
    title: 'PREVENTIVE DENTISTRY',
    description: 'Preventive examinations, professional hygiene, fluoridation.'
  },
  {
    title: 'ENDODONTIC TRIAGE',
    description: 'Structured decision-making for access, instrumentation, and complication control.'
  },
  {
    title: 'CASE COMMUNICATION',
    description: 'How to explain diagnosis, treatment options, and risk management clearly.'
  }
];

const TESTIMONIALS = [
  'Came in for a regular check-up and left with a brighter smile than ever. Quick, painless, and truly caring service.',
  'The course structure felt practical and clear. It stayed close to real clinic decisions instead of generic theory.',
  'I appreciated the amount of detail around diagnosis and complication prevention. High signal throughout.'
];

export function FaqPage() {
  usePageMeta('Integrat — FAQ', 'page-faq');
  const [open, setOpen] = useState(false);
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('+7');
  const [comment, setComment] = useState('');
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ message: string; error?: boolean }>({ message: '' });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!agree) {
      setStatus({ message: 'Please consent to personal data processing.', error: true });
      return;
    }

    setSubmitting(true);
    setStatus({ message: '' });

    try {
      await api.submitContact({ fullname, phone, comment, source: 'faq-modal' });
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
    <>
      <header className="faq-header">
        <div className="container faq-header-inner">
          <Link className="faq-close-link" to="/">
            <span className="faq-close-icon">←</span>
            Close
          </Link>
        </div>
      </header>

      <main>
        <section className="faq-hero">
          <div className="container faq-hero-grid">
            <article className="faq-card-primary">
              <h1>
                FAQ IN
                <br />
                ENDODONTICS.
                <br />
                PART I
              </h1>
              <p>
                EFFECTIVE ROOT
                <br />
                CANAL TREATMENT
              </p>
              <button className="faq-primary-action" onClick={() => setOpen(true)} type="button">
                Participate
              </button>
            </article>

            <div className="faq-card-list">
              {SECONDARY_CARDS.map((card) => (
                <article key={card.title} className="faq-card-secondary">
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="faq-video">
          <div className="container">
            <div className="faq-video-card">
              <video controls preload="metadata" src={siteData.media.homeVideoSrc} />
            </div>
          </div>
        </section>

        <section className="faq-testimonials">
          <div className="container faq-testimonials-grid">
            {TESTIMONIALS.map((text, index) => (
              <article key={text} className="faq-testimonial-card">
                <div className="faq-testimonial-header">
                  <h4>{['Ramazan', 'Aruzhan', 'Dias'][index] || 'Patient'}</h4>
                  <span className="faq-avatar-dot" />
                </div>
                <p>{text}</p>
                <span className="faq-testimonial-author">{['Dr.Aben', 'Dr.Kassymova', 'Dr.Sarsembayev'][index]}</span>
              </article>
            ))}
          </div>
        </section>
      </main>

      <div className={`faq-modal${open ? ' is-active' : ''}`} data-modal onClick={(event) => event.target === event.currentTarget && setOpen(false)}>
        <div aria-labelledby="faq-modal-title" aria-modal="true" className="faq-modal-dialog" role="dialog">
          <button aria-label="Close modal" className="faq-modal-close" onClick={() => setOpen(false)} type="button">
            ×
          </button>
          <h2 id="faq-modal-title">Fill Out the Form</h2>
          <p>
            and our managers will call you
            <br />
            for a detailed consultation
          </p>
          <form className="faq-modal-form" onSubmit={handleSubmit}>
            <div className="faq-modal-row">
              <input
                name="fullname"
                onChange={(event) => setFullname(event.target.value)}
                placeholder="Full name"
                required
                value={fullname}
              />
              <input
                name="phone"
                onChange={(event) => setPhone(formatPhoneInput(event.target.value))}
                placeholder="+7 (___) ___ __ - __"
                required
                value={phone}
              />
            </div>
            <textarea
              name="comment"
              onChange={(event) => setComment(event.target.value)}
              placeholder="Comment"
              required
              rows={4}
              value={comment}
            />
            <div className="faq-modal-row">
              <label className="faq-modal-consent">
                <input checked={agree} name="agree" onChange={(event) => setAgree(event.target.checked)} required type="checkbox" />
                <span>By checking the box, I consent to the processing of my personal data.</span>
              </label>
            </div>
            <button className="faq-modal-submit" disabled={!agree || submitting} type="submit">
              {submitting ? 'Sending...' : 'Send'}
            </button>
            {status.message ? <p className={status.error ? 'form-status is-error' : 'form-status is-success'}>{status.message}</p> : null}
          </form>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
