(function adminBootstrap() {
  const api = window.IntegratAuthApi;
  if (!api) return;

  const accessGuard = document.getElementById('adminAccessGuard');
  const adminPanel = document.getElementById('adminPanel');
  const usersSection = document.getElementById('adminUsers');
  const grantsSection = document.getElementById('adminGrants');
  const feedback = document.getElementById('adminFeedback');
  const usersList = document.getElementById('adminUsersList');
  const grantsList = document.getElementById('adminGrantsList');
  const courseSelect = document.getElementById('adminCourseSelect');
  const grantForm = document.getElementById('grantForm');
  const logoutButton = document.getElementById('adminLogout');

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
      usersList.innerHTML = '<p>No users yet.</p>';
    }
  }

  function renderGrants(grants) {
    grantsList.innerHTML = '';

    grants.forEach((grant) => {
      const item = document.createElement('div');
      item.className = 'admin-list__item';
      item.innerHTML = `
        <div class="admin-list__meta">
          <p class="admin-list__title">${grant.userEmail || 'Unknown user'} → ${grant.courseTitle}</p>
          <p class="admin-list__subtitle">Granted at ${new Date(grant.grantedAt).toLocaleString()} ${grant.note ? `· ${grant.note}` : ''}</p>
        </div>
        <button class="admin-remove" type="button" data-grant-id="${grant.id}">Remove</button>
      `;
      grantsList.appendChild(item);
    });

    if (!grants.length) {
      grantsList.innerHTML = '<p>No active grants.</p>';
      return;
    }

    grantsList.querySelectorAll('[data-grant-id]').forEach((button) => {
      button.addEventListener('click', async () => {
        try {
          await api.adminDeleteGrant(button.dataset.grantId);
          await loadGrants();
          setFeedback('Grant removed.', false);
        } catch (error) {
          setFeedback(error.message, true);
        }
      });
    });
  }

  async function loadCourses() {
    const { courses } = await api.listCourses();
    courseSelect.innerHTML = '';

    courses.forEach((course) => {
      const option = document.createElement('option');
      option.value = course.id;
      option.textContent = `${course.title} (${course.id})`;
      courseSelect.appendChild(option);
    });
  }

  async function loadUsers() {
    const { users } = await api.adminListUsers('');
    renderUsers(users);
  }

  async function loadGrants() {
    const { grants } = await api.adminListGrants();
    renderGrants(grants);
  }

  async function showAdminPanel() {
    accessGuard.hidden = true;
    adminPanel.hidden = false;
    usersSection.hidden = false;
    grantsSection.hidden = false;

    await Promise.all([loadCourses(), loadUsers(), loadGrants()]);
  }

  grantForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(grantForm);

    try {
      await api.adminCreateGrant({
        email: formData.get('email'),
        courseId: formData.get('courseId'),
        note: formData.get('note')
      });
      grantForm.reset();
      setFeedback('Permission granted successfully.', false);
      await loadGrants();
    } catch (error) {
      setFeedback(error.message, true);
    }
  });

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
})();
