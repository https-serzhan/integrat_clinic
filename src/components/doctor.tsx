import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api, clearToken } from '../lib/api';
import { nextSuggestedBookingSlot, toBookingIsoString } from '../lib/forms';
import { useSession } from '../app/session';
import type { AppointmentSummary, DoctorProfile } from '../types/models';

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

function statusLabel(status: string) {
  const normalized = String(status || '').toLowerCase();
  if (!normalized) return 'Scheduled';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function isUnauthorizedError(error: unknown) {
  if (!(error instanceof Error)) return false;
  const status = 'status' in error ? Number((error as { status?: number }).status) : undefined;
  const message = String(error.message || '').toLowerCase();
  return status === 401 || /unauthorized|validate credentials|login|log in|auth/.test(message);
}

export function DoctorModal({
  doctor,
  open,
  onClose
}: {
  doctor: DoctorProfile | null;
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const activeDoctor = doctor;
  const [dateTime, setDateTime] = useState(nextSuggestedBookingSlot());
  const [status, setStatus] = useState<{ message: string; error?: boolean; success?: boolean }>({ message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    setDateTime(nextSuggestedBookingSlot());
    setStatus({ message: '' });

    return () => {
      document.body.style.overflow = '';
    };
  }, [open, doctor?.id]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  if (!activeDoctor) {
    return null;
  }

  const doctorId = activeDoctor.id;
  const caseImages = activeDoctor.cases.length ? activeDoctor.cases : [activeDoctor.image];

  async function handleBook() {
    if (!dateTime) {
      setStatus({ message: 'Select a preferred appointment time before continuing.', error: true });
      return;
    }

    setSubmitting(true);
    setStatus({ message: 'Submitting appointment request...' });

    try {
      await api.createAppointment({
        doctor_id: doctorId,
        datetime: toBookingIsoString(dateTime)
      });
      setStatus({ message: 'Appointment request submitted successfully.', success: true });
      window.setTimeout(onClose, 900);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        clearToken();
        navigate(`/auth?returnTo=${encodeURIComponent(location.pathname + location.search + location.hash)}`);
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
    <div
      className={`doctor-modal-overlay${open ? ' active' : ''}`}
      id="doctorModal"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="doctor-modal">
        <button className="doctor-modal-close" onClick={onClose} type="button">
          ✕
        </button>

        <div className="doctor-modal-top">
          <img className="doctor-modal-img" src={caseImages[0] || activeDoctor.image} alt={`${activeDoctor.name} case 1`} />
          <img className="doctor-modal-img" src={caseImages[1] || caseImages[0] || activeDoctor.image} alt={`${activeDoctor.name} case 2`} />
        </div>

        <div className="doctor-modal-body">
          <div className="doctor-header">
            <div>
              <h3 className="doctor-name">{activeDoctor.name}</h3>
              <p className="doctor-role">{activeDoctor.specialty}</p>
            </div>
            <p className="doctor-exp">Experience: {activeDoctor.experience} years</p>
          </div>

          <div className="doctor-text">
            <p>
              <strong>Education:</strong>
              <br />
              <span dangerouslySetInnerHTML={{ __html: activeDoctor.education }} />
            </p>
            <p>
              <strong>Focus:</strong>
              <br />
              {activeDoctor.spec}
            </p>
          </div>

          <div className="doctor-actions">
            <button className="btn-black" onClick={() => navigate(`/doctor?doctor=${doctorId}`)} type="button">
              Cases
            </button>
            <button className="btn-black" onClick={handleBook} type="button">
              Book a doctor appointment
            </button>
          </div>

          <div className="doctor-booking">
            <div className="doctor-booking__row">
              <div className="doctor-booking__field">
                <label htmlFor="doctorBookingDatetime">Preferred appointment time</label>
                <input
                  className="doctor-booking__input"
                  id="doctorBookingDatetime"
                  onChange={(event) => setDateTime(event.target.value)}
                  step={1800}
                  type="datetime-local"
                  value={dateTime}
                />
              </div>
            </div>
            {status.message ? (
              <p
                className={`form-status doctor-booking__status${status.error ? ' is-error' : ''}${status.success ? ' is-success' : ''}`}
              >
                {status.message}
              </p>
            ) : null}
          </div>

          {submitting ? null : null}
        </div>
      </div>
    </div>
  );
}

export function AppointmentsDashboard() {
  const location = useLocation();
  const { loading, user } = useSession();
  const [appointments, setAppointments] = useState<AppointmentSummary[]>([]);
  const [status, setStatus] = useState<{ message: string; error?: boolean }>({ message: '' });
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  const summary = useMemo(() => {
    const scheduled = appointments.filter((item) => item.status.toLowerCase() === 'scheduled').length;
    const cancelled = appointments.filter((item) => item.status.toLowerCase() === 'cancelled').length;
    return {
      total: appointments.length,
      scheduled,
      cancelled
    };
  }, [appointments]);

  async function loadAppointments() {
    if (!user) return;
    setLoadingAppointments(true);

    try {
      const response = await api.listAppointments();
      setAppointments(Array.isArray(response) ? response : []);
      setStatus({ message: '' });
    } catch (error) {
      setStatus({
        message: error instanceof Error ? error.message : 'Could not load appointments.',
        error: true
      });
    } finally {
      setLoadingAppointments(false);
    }
  }

  useEffect(() => {
    if (!user) return;
    void loadAppointments();
  }, [user]);

  async function cancelAppointment(appointmentId: string | number) {
    const confirmed = window.confirm('Cancel this appointment?');
    if (!confirmed) return;

    try {
      await api.cancelAppointment(appointmentId);
      setStatus({ message: 'Appointment cancelled.' });
      await loadAppointments();
    } catch (error) {
      setStatus({
        message: error instanceof Error ? error.message : 'Could not cancel appointment.',
        error: true
      });
    }
  }

  if (!loading && !user) {
    return (
      <section className="dashboard-card" id="dashboardAccessGuard">
        <h2>Login Required</h2>
        <p>You need a client account to view your bookings and manage cancellations.</p>
        <Link className="dashboard-link" to={`/auth?returnTo=${encodeURIComponent(location.pathname)}`}>
          Open login
        </Link>
      </section>
    );
  }

  return (
    <section className="dashboard-panel" id="dashboardPanel" hidden={loading || !user}>
      <div className="dashboard-summary">
        <article className="dashboard-summary__card">
          <span className="dashboard-summary__label">Total</span>
          <strong>{summary.total}</strong>
        </article>
        <article className="dashboard-summary__card">
          <span className="dashboard-summary__label">Scheduled</span>
          <strong>{summary.scheduled}</strong>
        </article>
        <article className="dashboard-summary__card">
          <span className="dashboard-summary__label">Cancelled</span>
          <strong>{summary.cancelled}</strong>
        </article>
      </div>

      <div className="dashboard-card">
        <div className="dashboard-card__header">
          <h2>My Appointments</h2>
          <p>Latest bookings appear first.</p>
        </div>

        <div className="dashboard-list">
          {loadingAppointments ? (
            <article className="dashboard-list__empty">
              <h3>Loading appointments...</h3>
            </article>
          ) : !appointments.length ? (
            <article className="dashboard-list__empty">
              <h3>No appointments yet</h3>
              <p>Book a doctor visit from the doctors page and it will appear here.</p>
            </article>
          ) : (
            appointments.map((appointment) => {
              const normalizedStatus = appointment.status.toLowerCase();
              const canCancel = normalizedStatus === 'scheduled';
              return (
                <article key={appointment.id} className="dashboard-list__item">
                  <div className="dashboard-list__meta">
                    <div>
                      <p className="dashboard-list__title">{appointment.doctor_name || 'Doctor appointment'}</p>
                      <p className="dashboard-list__datetime">{formatDateTime(appointment.datetime)}</p>
                    </div>
                    <span className={`dashboard-list__status is-${normalizedStatus || 'scheduled'}`}>
                      {statusLabel(normalizedStatus)}
                    </span>
                  </div>

                  <div className="dashboard-list__footer">
                    <p className="dashboard-list__created">
                      Requested {appointment.created_at ? formatDateTime(appointment.created_at) : '-'}
                    </p>
                    <button
                      className="dashboard-list__action"
                      disabled={!canCancel}
                      onClick={() => cancelAppointment(appointment.id)}
                      type="button"
                    >
                      Cancel
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {status.message ? (
          <p className={`dashboard-feedback${status.error ? ' is-error' : ''}`}>{status.message}</p>
        ) : null}
      </div>
    </section>
  );
}
