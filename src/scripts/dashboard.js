(function dashboardPage(windowObject, documentObject) {
  const api = windowObject.api;
  const accessGuard = documentObject.getElementById('dashboardAccessGuard');
  const panel = documentObject.getElementById('dashboardPanel');
  const appointmentsList = documentObject.getElementById('dashboardAppointmentsList');
  const feedback = documentObject.getElementById('dashboardFeedback');
  const totalNode = documentObject.getElementById('dashboardTotalCount');
  const scheduledNode = documentObject.getElementById('dashboardScheduledCount');
  const cancelledNode = documentObject.getElementById('dashboardCancelledCount');

  let currentAppointments = [];

  if (accessGuard) accessGuard.hidden = true;
  if (panel) panel.hidden = true;

  function setFeedback(message, isError) {
    if (!feedback) return;
    feedback.textContent = message || '';
    feedback.classList.toggle('is-error', Boolean(isError));
  }

  function formatDateTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  }

  function statusLabel(status) {
    const normalized = String(status || '').trim().toLowerCase();
    if (!normalized) return 'Scheduled';
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }

  function updateSummary(appointments) {
    const scheduled = appointments.filter((item) => String(item.status || '').toLowerCase() === 'scheduled').length;
    const cancelled = appointments.filter((item) => String(item.status || '').toLowerCase() === 'cancelled').length;

    if (totalNode) totalNode.textContent = String(appointments.length);
    if (scheduledNode) scheduledNode.textContent = String(scheduled);
    if (cancelledNode) cancelledNode.textContent = String(cancelled);
  }

  function canCancel(appointment) {
    return String(appointment?.status || '').toLowerCase() === 'scheduled';
  }

  function renderAppointments(appointments) {
    if (!appointmentsList) return;
    appointmentsList.innerHTML = '';
    updateSummary(appointments);

    if (!appointments.length) {
      appointmentsList.innerHTML = `
        <article class="dashboard-list__empty">
          <h3>No appointments yet</h3>
          <p>Book a doctor visit from the doctors page and it will appear here.</p>
        </article>
      `;
      return;
    }

    appointments.forEach((appointment) => {
      const item = documentObject.createElement('article');
      const status = String(appointment.status || '').toLowerCase();
      item.className = 'dashboard-list__item';
      item.innerHTML = `
        <div class="dashboard-list__meta">
          <div>
            <p class="dashboard-list__title">${appointment.doctor_name || 'Doctor appointment'}</p>
            <p class="dashboard-list__datetime">${formatDateTime(appointment.datetime)}</p>
          </div>
          <span class="dashboard-list__status is-${status || 'scheduled'}">${statusLabel(status)}</span>
        </div>
        <div class="dashboard-list__footer">
          <p class="dashboard-list__created">Requested ${formatDateTime(appointment.created_at)}</p>
          <button
            class="dashboard-list__action"
            type="button"
            data-cancel-appointment="${appointment.id}"
            ${canCancel(appointment) ? '' : 'disabled'}>
            Cancel
          </button>
        </div>
      `;
      appointmentsList.appendChild(item);
    });
  }

  async function loadAppointments() {
    if (!api?.get) return;
    const response = await api.get('/appointments');
    currentAppointments = Array.isArray(response) ? response : [];
    renderAppointments(currentAppointments);
  }

  async function cancelAppointment(appointmentId, button) {
    if (!appointmentId || !api?.cancelAppointment) return;

    const confirmed = windowObject.confirm('Cancel this appointment?');
    if (!confirmed) return;

    const originalLabel = button?.textContent || 'Cancel';
    if (button) {
      button.disabled = true;
      button.textContent = 'Cancelling...';
    }

    try {
      await api.cancelAppointment(appointmentId);
      setFeedback('Appointment cancelled.', false);
      await loadAppointments();
    } catch (error) {
      setFeedback(error.message || 'Could not cancel appointment.', true);
      if (button) {
        button.disabled = false;
        button.textContent = originalLabel;
      }
    }
  }

  appointmentsList?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-cancel-appointment]');
    if (!button) return;
    cancelAppointment(button.dataset.cancelAppointment, button);
  });

  async function boot() {
    if (!api?.get) {
      setFeedback('Clinic API is not configured yet.', true);
      return;
    }

    try {
      await api.get('/auth/me');
      if (accessGuard) accessGuard.hidden = true;
      if (panel) panel.hidden = false;
      await loadAppointments();
    } catch {
      if (accessGuard) accessGuard.hidden = false;
      if (panel) panel.hidden = true;
    }
  }

  boot();
})(window, document);
