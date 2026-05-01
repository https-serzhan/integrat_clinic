(function dashboardPage(windowObject, documentObject) {
  const i18n = windowObject.IntegratI18n;
  const tabs = documentObject.querySelectorAll('.dashboard-tab');
  const contactsContent = documentObject.getElementById('contactsContent');
  const appointmentsContent = documentObject.getElementById('appointmentsContent');
  const contactsTableBody = documentObject.getElementById('contactsTableBody');
  const appointmentsTableBody = documentObject.getElementById('appointmentsTableBody');
  const chartCanvas = documentObject.getElementById('activityChart');
  let currentContacts = [];
  let currentAppointments = [];
  let chartInstance = null;

  if (!contactsContent || !appointmentsContent || !contactsTableBody || !appointmentsTableBody || !windowObject.api) {
    return;
  }

  const contentMap = {
    contacts: contactsContent,
    appointments: appointmentsContent
  };

  function t(key, fallback) {
    return i18n?.t ? i18n.t(key, fallback) : fallback;
  }

  function renderEmptyRow(colspan, message) {
    return `<tr><td colspan="${colspan}"><div class="content-state">${message}</div></td></tr>`;
  }

  function renderSkeletonRows(tableBody, colspan, rows = 4) {
    tableBody.innerHTML = Array.from({ length: rows })
      .map(
        () => `
      <tr>
        <td colspan="${colspan}">
          <div class="skeleton-line skeleton-line--lg"></div>
        </td>
      </tr>
    `
      )
      .join('');
  }

  function formatDateLabel(dateValue) {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(dateValue);
  }

  function sameCalendarDay(value, target) {
    const date = new Date(value);
    return date.toDateString() === target.toDateString();
  }

  function renderContacts(items) {
    contactsTableBody.innerHTML = items.length
      ? items
          .map(
            (item) => `
          <tr>
            <td>#${item.id}</td>
            <td><strong>${item.fullname || 'Unknown'}</strong></td>
            <td>${item.phone || '—'}</td>
            <td>${item.comment || '—'}</td>
            <td>${item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}</td>
            <td><span class="status-badge status-new">${item.status || 'New'}</span></td>
          </tr>
        `
          )
          .join('')
      : renderEmptyRow(6, t('dashboard_no_contacts', 'No contact requests have been submitted yet.'));
  }

  function renderAppointments(items) {
    appointmentsTableBody.innerHTML = items.length
      ? items
          .map(
            (item) => `
          <tr>
            <td>#${item.id}</td>
            <td>${item.patient_email || '—'}</td>
            <td><strong>${item.doctor_name || '—'}</strong></td>
            <td>${item.datetime ? new Date(item.datetime).toLocaleString() : '—'}</td>
            <td><span class="status-badge status-scheduled">${item.status || 'Scheduled'}</span></td>
          </tr>
        `
          )
          .join('')
      : renderEmptyRow(5, t('dashboard_no_appointments', 'No appointments have been created yet.'));
  }

  function renderChart(contacts, appointments) {
    if (!chartCanvas || !windowObject.Chart) return;

    if (chartInstance) {
      chartInstance.destroy();
    }

    const labels = [];
    const contactData = [];
    const appointmentData = [];

    for (let offset = 6; offset >= 0; offset -= 1) {
      const day = new Date();
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - offset);
      labels.push(formatDateLabel(day));
      contactData.push(contacts.filter((item) => sameCalendarDay(item.created_at, day)).length);
      appointmentData.push(appointments.filter((item) => sameCalendarDay(item.datetime, day)).length);
    }

    chartInstance = new windowObject.Chart(chartCanvas.getContext('2d'), {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: t('dashboard_contacts_series', 'Contacts'),
            data: contactData,
            borderColor: '#1890ff',
            tension: 0.35,
            fill: false
          },
          {
            label: t('dashboard_appointments_series', 'Appointments'),
            data: appointmentData,
            borderColor: '#52c41a',
            tension: 0.35,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' }
        },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
      }
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach((item) => item.classList.remove('active'));
      tab.classList.add('active');
      Object.entries(contentMap).forEach(([key, node]) => {
        node.style.display = key === target ? 'block' : 'none';
      });
    });
  });

  async function initDashboard() {
    if (!windowObject.localStorage.getItem('token')) {
      windowObject.location.href = 'auth.html?returnTo=dashboard.html';
      return;
    }

    renderSkeletonRows(contactsTableBody, 6);
    renderSkeletonRows(appointmentsTableBody, 5);

    try {
      const [contacts, appointments, summary] = await Promise.all([
        windowObject.api.get('/contacts'),
        windowObject.api.get('/appointments'),
        windowObject.api.get('/dashboard/summary')
      ]);

      currentContacts = Array.isArray(contacts) ? contacts : [];
      currentAppointments = Array.isArray(appointments) ? appointments : [];

      documentObject.getElementById('totalContacts').textContent = summary?.totalContacts ?? contacts.length;
      documentObject.getElementById('totalAppointments').textContent = summary?.totalAppointments ?? appointments.length;
      documentObject.getElementById('totalUsers').textContent = summary?.totalUsers ?? '—';
      documentObject.getElementById('totalUsers').title = '';

      renderContacts(currentContacts);
      renderAppointments(currentAppointments);
      renderChart(currentContacts, currentAppointments);
    } catch (error) {
      const unauthorized =
        error.status === 401 ||
        error.status === 403 ||
        /unauthorized|forbidden|validate credentials/i.test(error.message || '');
      if (unauthorized) {
        windowObject.location.href = 'auth.html?returnTo=dashboard.html';
        return;
      }

      contactsTableBody.innerHTML = renderEmptyRow(6, error.message || t('dashboard_load_failed', 'Failed to load dashboard data.'));
      appointmentsTableBody.innerHTML = renderEmptyRow(5, error.message || t('dashboard_load_failed', 'Failed to load dashboard data.'));
    }
  }

  documentObject.addEventListener('integrat:langchange', () => {
    const totalUsers = documentObject.getElementById('totalUsers');
    if (totalUsers?.textContent === '—') {
      totalUsers.title = t('dashboard_summary_missing', 'Requires backend summary endpoint.');
    }

    renderContacts(currentContacts);
    renderAppointments(currentAppointments);
    renderChart(currentContacts, currentAppointments);
  });

  initDashboard();
})(window, document);
