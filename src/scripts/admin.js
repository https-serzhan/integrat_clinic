(function adminBootstrap() {
  const api = window.IntegratAuthApi;
  if (!api) return;
  const i18n = window.IntegratI18n;

  const accessGuard = document.getElementById('adminAccessGuard');
  const adminPanel = document.getElementById('adminPanel');
  const appointmentsSection = document.getElementById('adminAppointments');
  const usersSection = document.getElementById('adminUsers');
  const feedback = document.getElementById('adminFeedback');
  const usersList = document.getElementById('adminUsersList');
  const paymentRequestsList = document.getElementById('adminPaymentRequestsList');
  const appointmentsList = document.getElementById('adminAppointmentsList');
  const logoutButton = document.getElementById('adminLogout');

  function t(key, fallback) {
    return i18n?.t ? i18n.t(key, fallback) : fallback;
  }

  function setFeedback(message, isError) {
    feedback.textContent = message || '';
    feedback.classList.toggle('error', Boolean(isError));
  }

  function renderUsers(users) {
    usersList.innerHTML = '';

    users.forEach((user) => {
      const item = document.createElement('div');
      item.className = 'admin-list__item';
      item.innerHTML = `
        <div class="admin-list__meta">
          <p class="admin-list__title">${user.name}</p>
          <p class="admin-list__subtitle">${user.email} · ${user.role}</p>
        </div>
      `;
      usersList.appendChild(item);
    });

    if (!users.length) {
      usersList.innerHTML = `<p>${t('admin_no_users', 'No users yet.')}</p>`;
    }
  }

  async function loadUsers() {
    const { users } = await api.adminListUsers('');
    renderUsers(users);
  }

  function renderAppointments(appointments) {
    if (!appointmentsList) return;
    appointmentsList.innerHTML = '';

    appointments.forEach((appointment) => {
      const item = document.createElement('div');
      item.className = 'admin-list__item';
      const scheduledAt = appointment.datetime ? new Date(appointment.datetime).toLocaleString() : '-';
      item.innerHTML = `
        <div class="admin-list__meta">
          <p class="admin-list__title">${appointment.patientName || t('admin_unknown_user', 'Unknown user')} → ${appointment.doctorName || '-'}</p>
          <p class="admin-list__subtitle">${appointment.patientEmail || '-'} · ${appointment.patientPhone || '-'} · ${appointment.status || 'scheduled'} · ${scheduledAt}</p>
        </div>
      `;
      appointmentsList.appendChild(item);
    });

    if (!appointments.length) {
      appointmentsList.innerHTML = `<p>No appointments yet.</p>`;
    }
  }

  async function loadAppointments() {
    if (!api.adminListAppointments) return;
    const { appointments } = await api.adminListAppointments();
    renderAppointments(Array.isArray(appointments) ? appointments : []);
  }

  function renderPaymentRequests(requests) {
    if (!paymentRequestsList) return;
    paymentRequestsList.innerHTML = '';

    requests.forEach((request) => {
      const item = document.createElement('div');
      item.className = 'admin-list__item';
      const createdAt = request.createdAt ? new Date(request.createdAt).toLocaleString() : '-';
      item.innerHTML = `
        <div class="admin-list__meta">
          <p class="admin-list__title">${request.userEmail || t('admin_unknown_user', 'Unknown user')} → ${request.courseTitle || request.courseId}</p>
          <p class="admin-list__subtitle">${request.amount || 0} ${request.currency || ''} · ${request.status || 'pending'} · ${createdAt}</p>
        </div>
        <div class="admin-list__actions">
          <button type="button" class="admin-remove" data-request-action="approve" data-request-id="${request.id}" ${
            request.status === 'approved' ? 'disabled' : ''
          }>${t('admin_approve', 'Approve')}</button>
          <button type="button" class="admin-remove" data-request-action="reject" data-request-id="${request.id}" ${
            request.status === 'rejected' ? 'disabled' : ''
          }>${t('admin_reject', 'Reject')}</button>
        </div>
      `;
      paymentRequestsList.appendChild(item);
    });

    if (!requests.length) {
      paymentRequestsList.innerHTML = `<p>${t('admin_no_payment_requests', 'No payment requests yet.')}</p>`;
      return;
    }

    paymentRequestsList.querySelectorAll('[data-request-action]').forEach((button) => {
      button.addEventListener('click', async () => {
        const decision = button.dataset.requestAction;
        const requestId = button.dataset.requestId;
        if (!requestId) return;

        try {
          await api.adminPaymentDecision(requestId, { decision });
          await loadPaymentRequests();
          setFeedback(
            decision === 'approve'
              ? t('admin_request_approved', 'Payment request approved.')
              : t('admin_request_rejected', 'Payment request rejected.'),
            false
          );
        } catch (error) {
          setFeedback(error.message, true);
        }
      });
    });
  }

  async function loadPaymentRequests() {
    if (!api.adminListPaymentRequests) return;
    const { paymentRequests } = await api.adminListPaymentRequests();
    renderPaymentRequests(Array.isArray(paymentRequests) ? paymentRequests : []);
  }

  async function showAdminPanel() {
    accessGuard.hidden = true;
    adminPanel.hidden = false;
    appointmentsSection.hidden = false;
    usersSection.hidden = false;
    await Promise.all([loadUsers(), loadPaymentRequests(), loadAppointments()]);
  }

  logoutButton.addEventListener('click', async () => {
    try {
      await api.logout();
      window.location.href = 'academy.html';
    } catch (error) {
      setFeedback(error.message, true);
    }
  });

  async function boot() {
    try {
      const { user } = await api.me();
      if (!user || user.role !== 'admin') {
        accessGuard.hidden = false;
        return;
      }

      await showAdminPanel();
    } catch {
      accessGuard.hidden = false;
    }
  }

  boot();

  document.addEventListener('integrat:langchange', async () => {
    if (adminPanel.hidden) return;
    await Promise.all([loadUsers(), loadPaymentRequests(), loadAppointments()]);
  });
})();
