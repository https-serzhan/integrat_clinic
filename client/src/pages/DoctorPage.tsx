import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { SiteFooter } from '../components/site';
import { api, clearToken } from '../lib/api';
import { nextSuggestedBookingSlot, toBookingIsoString } from '../lib/forms';
import { siteData } from '../data/siteData';
import { usePageMeta } from '../lib/dom';

function splitEducation(value: string) {
  return value
    .split(/<br\s*\/?>/i)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);
}

function splitFocus(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);
}

function isUnauthorizedError(error: unknown) {
  if (!(error instanceof Error)) return false;
  const status = 'status' in error ? Number((error as { status?: number }).status) : undefined;
  const message = String(error.message || '').toLowerCase();
  return status === 401 || /unauthorized|validate credentials|login|log in|auth/.test(message);
}

export function DoctorPage() {
  const [searchParams] = useSearchParams();
  const doctorId = Number(searchParams.get('doctor') || siteData.doctors[0]?.id || 1);
  const doctor = useMemo(
    () => siteData.doctors.find((item) => item.id === doctorId) || siteData.doctors[0],
    [doctorId]
  );
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [dateTime, setDateTime] = useState(nextSuggestedBookingSlot());
  const [status, setStatus] = useState<{ message: string; error?: boolean; success?: boolean }>({ message: '' });
  const [submitting, setSubmitting] = useState(false);

  usePageMeta(`${doctor?.name || 'Doctor'} | Integrat`);

  useEffect(() => {
    if (!doctor) return;

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % Math.max(doctor.cases.length, 1));
    }, 4000);

    return () => window.clearInterval(timer);
  }, [doctor]);

  if (!doctor) {
    return null;
  }

  async function handleBooking() {
    if (!dateTime) {
      setStatus({ message: 'Select a preferred appointment time before continuing.', error: true });
      return;
    }

    setSubmitting(true);
    setStatus({ message: 'Submitting appointment request...' });

    try {
      await api.createAppointment({
        doctor_id: doctor.id,
        datetime: toBookingIsoString(dateTime)
      });
      setStatus({ message: 'Appointment request submitted successfully.', success: true });
    } catch (error) {
      if (isUnauthorizedError(error)) {
        clearToken();
        navigate(`/auth?returnTo=${encodeURIComponent(location.pathname + location.search)}`);
        return;
      }

      setStatus({
        message: error instanceof Error ? error.message : 'Failed to create appointment.',
        error: true
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <section className="doctor-section">
        <div className="doctor-container">
          <div className="doctor-info">
            <div>
              <h2>{doctor.name}</h2>

              <p className="doctor-description">{doctor.spec}</p>

              <p className="doctor-service">
                In service for <br />
                <strong>{doctor.experience} years</strong>
              </p>

              <div className="doctor-specialties">
                <div>
                  {splitEducation(doctor.education).map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
                <div>
                  {splitFocus(doctor.spec).map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
              </div>

              <div className="doctor-case-booking">
                <label className="doctor-case-booking__label" htmlFor="doctorCaseBookingDatetime">
                  Preferred appointment time
                </label>
                <input
                  className="doctor-case-booking__input"
                  id="doctorCaseBookingDatetime"
                  onChange={(event) => setDateTime(event.target.value)}
                  step={1800}
                  type="datetime-local"
                  value={dateTime}
                />
                {status.message ? (
                  <p
                    className={`doctor-case-booking__status${status.error ? ' is-error' : ''}${status.success ? ' is-success' : ''}`}
                  >
                    {status.message}
                  </p>
                ) : null}
              </div>
            </div>

            <button className="doctor-btn" disabled={submitting} onClick={handleBooking} type="button">
              {submitting ? 'Submitting...' : 'Book a doctor appointment'}
            </button>
          </div>

          <div className="doctor-slider">
            <div className="slider-wrapper">
              {doctor.cases.map((image, index) => (
                <img
                  key={`${doctor.id}-${image}`}
                  alt={`${doctor.name} case ${index + 1}`}
                  className={`slide${index === activeSlide ? ' active' : ''}`}
                  src={image}
                />
              ))}
            </div>

            <div className="slider-controls">
              <button
                className="prev"
                onClick={() => setActiveSlide((current) => (current - 1 + doctor.cases.length) % doctor.cases.length)}
                type="button"
              >
                ←
              </button>
              <button
                className="next"
                onClick={() => setActiveSlide((current) => (current + 1) % doctor.cases.length)}
                type="button"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
