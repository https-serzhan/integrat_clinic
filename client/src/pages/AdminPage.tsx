import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSession } from '../app/session';
import { api } from '../lib/api';
import { usePageMeta } from '../lib/dom';
import type { AdminAppointment, PaymentRequestRecord, SessionUser } from '../types/models';

function formatDateTime(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
}

export function AdminPage() {
  usePageMeta('Integrat — Admin', 'admin-page');
  const { loading, logout, user } = useSession();
  const [users, setUsers] = useState<SessionUser[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequestRecord[]>([]);
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [feedback, setFeedback] = useState<{ message: string; error?: boolean }>({ message: '' });

  async function loadAdminData() {
    try {
      const [usersResponse, requestsResponse, appointmentsResponse] = await Promise.all([
        api.adminListUsers(),
        api.adminListPaymentRequests(),
        api.adminListAppointments()
      ]);
      setUsers(usersResponse.users || []);
      setPaymentRequests(requestsResponse.paymentRequests || []);
      setAppointments(appointmentsResponse.appointments || []);
    } catch (error) {
      setFeedback({
        message: error instanceof Error ? error.message : 'Could not load admin data.',
        error: true
      });
    }
  }

  useEffect(() => {
    if (user?.role === 'admin') {
      void loadAdminData();
    }
  }, [user]);

  async function handleDecision(paymentRequestId: string, decision: 'approve' | 'reject') {
    try {
      await api.adminPaymentDecision(paymentRequestId, decision);
      setFeedback({
        message: decision === 'approve' ? 'Payment request approved.' : 'Payment request rejected.'
      });
      await loadAdminData();
    } catch (error) {
      setFeedback({
        message: error instanceof Error ? error.message : 'Could not update payment request.',
        error: true
      });
    }
  }

  return (
    <>
      <header className="admin-header">
        <div className="container admin-header__inner">
          <Link className="admin-header__back" to="/academy">
            ← Back to Academy
          </Link>
          <h1>Admin Confirmation</h1>
          <button className="btn-black" id="adminLogout" onClick={() => logout()} type="button">
            LOGOUT
          </button>
        </div>
      </header>

      <main className="container admin-main">
        {!loading && user?.role !== 'admin' ? (
          <section className="admin-card" id="adminAccessGuard">
            <h2>Access Required</h2>
            <p>You need an admin account to manage payment requests and doctor appointments.</p>
            <Link className="admin-link" to="/academy">
              Open academy login
            </Link>
          </section>
        ) : null}

        <section className="admin-card" hidden={loading || user?.role !== 'admin'} id="adminPanel">
          <h2>Payment Requests</h2>
          <div className="admin-list">
            {paymentRequests.length ? (
              paymentRequests.map((request) => (
                <div key={request.id} className="admin-list__item">
                  <div className="admin-list__meta">
                    <p className="admin-list__title">
                      {request.userEmail || 'Unknown user'} → {request.courseTitle || request.courseId}
                    </p>
                    <p className="admin-list__subtitle">
                      {request.amount || 0} {request.currency || ''} · {request.status || 'pending'} ·{' '}
                      {formatDateTime(request.createdAt)}
                    </p>
                  </div>
                  <div className="admin-list__actions">
                    <button
                      className="admin-remove"
                      disabled={request.status === 'approved'}
                      onClick={() => handleDecision(request.id, 'approve')}
                      type="button"
                    >
                      Approve
                    </button>
                    <button
                      className="admin-remove"
                      disabled={request.status === 'rejected'}
                      onClick={() => handleDecision(request.id, 'reject')}
                      type="button"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No payment requests yet.</p>
            )}
          </div>
          {feedback.message ? <p className={`admin-feedback${feedback.error ? ' error' : ''}`}>{feedback.message}</p> : null}
        </section>

        <section className="admin-card" hidden={loading || user?.role !== 'admin'} id="adminAppointments">
          <h2>Doctor Appointments</h2>
          <div className="admin-list">
            {appointments.length ? (
              appointments.map((appointment) => (
                <div key={appointment.id} className="admin-list__item">
                  <div className="admin-list__meta">
                    <p className="admin-list__title">
                      {appointment.patientName || 'Unknown user'} → {appointment.doctorName || '-'}
                    </p>
                    <p className="admin-list__subtitle">
                      {appointment.patientEmail || '-'} · {appointment.patientPhone || '-'} · {appointment.status || 'scheduled'} ·{' '}
                      {formatDateTime(appointment.datetime)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p>No appointments yet.</p>
            )}
          </div>
        </section>

        <section className="admin-card" hidden={loading || user?.role !== 'admin'} id="adminUsers">
          <h2>Registered Users</h2>
          <div className="admin-list">
            {users.length ? (
              users.map((item) => (
                <div key={item.id} className="admin-list__item">
                  <div className="admin-list__meta">
                    <p className="admin-list__title">{item.name}</p>
                    <p className="admin-list__subtitle">
                      {item.email} · {item.role}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p>No users yet.</p>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
