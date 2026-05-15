import { siteData } from '../data/siteData';
import { validateContactForm } from './forms';
import type {
  AdminAppointment,
  AppointmentSummary,
  AuthResponse,
  ContactPayload,
  ContactSubmissionResponse,
  CourseAccessResponse,
  CoursePaymentSettings,
  PaymentRequestRecord,
  SessionUser,
  UserRole
} from '../types/models';

export class ApiError extends Error {
  status?: number;
  payload?: unknown;
}

interface MockUser extends SessionUser {
  password: string;
}

interface MockContactRecord {
  id: string;
  fullname: string;
  phone: string;
  comment: string;
  source?: string;
  createdAt: string;
}

interface MockAppointmentRecord {
  id: string;
  patientId: string;
  patientEmail: string;
  patientName: string;
  patientPhone?: string | null;
  doctorId: number;
  doctorName: string;
  datetime: string;
  status: string;
  createdAt: string;
}

const TOKEN_STORAGE_KEY = 'token';
const STORAGE_KEYS = {
  users: 'integrat_mock_users',
  sessionUserId: 'integrat_mock_session_user_id',
  contacts: 'integrat_mock_contacts',
  appointments: 'integrat_mock_appointments',
  paymentRequests: 'integrat_mock_payment_requests'
} as const;

const PAYMENT_SETTINGS: CoursePaymentSettings = {
  receiverNumber: '+77711140710',
  receiverName: 'Serzhan S.',
  instructions:
    'Transfer the course amount to Kaspi and then send a payment request for manager approval.'
};

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeEmail(email: string) {
  return String(email || '').trim().toLowerCase();
}

function readStore<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStore<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function ensureSeedState() {
  const existingUsers = readStore<MockUser[]>(STORAGE_KEYS.users, []);
  if (!existingUsers.length) {
    writeStore(STORAGE_KEYS.users, [
      {
        id: 'usr_admin_seed',
        name: 'Integrat Admin',
        email: 'admin@integrat.local',
        phone: '77711140710',
        role: 'admin',
        createdAt: new Date().toISOString(),
        password: 'Admin123!'
      },
      {
        id: 'usr_patient_seed',
        name: 'Demo Patient',
        email: 'patient@integrat.local',
        phone: '77700000001',
        role: 'patient',
        createdAt: new Date().toISOString(),
        password: 'Patient123!'
      },
      {
        id: 'usr_student_seed',
        name: 'Demo Student',
        email: 'student@integrat.local',
        phone: '77700000002',
        role: 'student',
        createdAt: new Date().toISOString(),
        password: 'Student123!'
      }
    ]);
  }

  if (!window.localStorage.getItem(STORAGE_KEYS.contacts)) {
    writeStore<MockContactRecord[]>(STORAGE_KEYS.contacts, []);
  }
  if (!window.localStorage.getItem(STORAGE_KEYS.appointments)) {
    writeStore<MockAppointmentRecord[]>(STORAGE_KEYS.appointments, []);
  }
  if (!window.localStorage.getItem(STORAGE_KEYS.paymentRequests)) {
    writeStore<PaymentRequestRecord[]>(STORAGE_KEYS.paymentRequests, []);
  }
}

function getUsers() {
  ensureSeedState();
  return readStore<MockUser[]>(STORAGE_KEYS.users, []);
}

function saveUsers(users: MockUser[]) {
  writeStore(STORAGE_KEYS.users, users);
}

function getContacts() {
  ensureSeedState();
  return readStore<MockContactRecord[]>(STORAGE_KEYS.contacts, []);
}

function saveContacts(contacts: MockContactRecord[]) {
  writeStore(STORAGE_KEYS.contacts, contacts);
}

function getEnvValue(name: string) {
  return String((import.meta.env as Record<string, string | undefined>)[name] || '').trim();
}

async function submitRemoteEvent<TPayload>(
  type: string,
  payload: TPayload
): Promise<(Partial<ContactSubmissionResponse> & { storedRemotely?: boolean; notified?: boolean }) | null> {
  const endpoint = getEnvValue('VITE_EVENTS_API_URL') || '/api/events';
  const requireRemote = getEnvValue('VITE_REQUIRE_REMOTE_EVENTS') !== '0';
  if (!endpoint) {
    if (requireRemote) {
      throw new ApiError('Remote integration endpoint is not configured.');
    }
    return null;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ type, payload })
  });

  const text = await response.text();
  let data: ({ error?: string } & Partial<ContactSubmissionResponse>) | null = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new ApiError(data?.error || `Could not process ${type}.`);
  }

  if (!data && requireRemote) {
    throw new ApiError(`Remote ${type} integration did not return a valid response.`);
  }

  return data || {};
}

function getAppointments() {
  ensureSeedState();
  return readStore<MockAppointmentRecord[]>(STORAGE_KEYS.appointments, []);
}

function saveAppointments(appointments: MockAppointmentRecord[]) {
  writeStore(STORAGE_KEYS.appointments, appointments);
}

function getPaymentRequests() {
  ensureSeedState();
  return readStore<PaymentRequestRecord[]>(STORAGE_KEYS.paymentRequests, []);
}

function savePaymentRequests(requests: PaymentRequestRecord[]) {
  writeStore(STORAGE_KEYS.paymentRequests, requests);
}

function sanitizeUser(user: MockUser): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || null,
    role: user.role,
    createdAt: user.createdAt
  };
}

function setSessionUser(userId: string | null) {
  if (!userId) {
    window.localStorage.removeItem(STORAGE_KEYS.sessionUserId);
    return;
  }
  window.localStorage.setItem(STORAGE_KEYS.sessionUserId, userId);
}

function getSessionUserRecord(): MockUser | null {
  ensureSeedState();
  const userId = window.localStorage.getItem(STORAGE_KEYS.sessionUserId);
  if (!userId) return null;
  return getUsers().find((item) => item.id === userId) || null;
}

function requireUser() {
  const user = getSessionUserRecord();
  if (!user) {
    const error = new ApiError('Unauthorized');
    error.status = 401;
    throw error;
  }
  return user;
}

function requireAdmin() {
  const user = requireUser();
  if (user.role !== 'admin') {
    const error = new ApiError('Forbidden');
    error.status = 403;
    throw error;
  }
  return user;
}

function storeToken(token: string | null | undefined) {
  try {
    if (!token) {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {}
}

export { storeToken };

export function clearToken() {
  storeToken(null);
}

function issueMockToken(user: SessionUser) {
  return btoa(`${user.id}:${user.role}:${user.email}`);
}

function authResponse(user: MockUser): AuthResponse {
  return {
    access_token: issueMockToken(sanitizeUser(user)),
    token_type: 'bearer',
    user: sanitizeUser(user)
  };
}

function ensureUniqueEmail(email: string, users: MockUser[]) {
  if (users.some((item) => item.email === email)) {
    const error = new ApiError('Email already registered.');
    error.status = 409;
    throw error;
  }
}

async function createUser(payload: {
  name: string;
  phone: string;
  email: string;
  password: string;
  role: UserRole;
}) {
  const users = getUsers();
  const email = normalizeEmail(payload.email);
  ensureUniqueEmail(email, users);

  const user: MockUser = {
    id: createId('usr'),
    name: payload.name.trim(),
    email,
    phone: payload.phone,
    role: payload.role,
    createdAt: new Date().toISOString(),
    password: payload.password
  };

  await submitRemoteEvent('registration', sanitizeUser(user));

  users.push(user);
  saveUsers(users);
  setSessionUser(user.id);
  return authResponse(user);
}

function findUserByCredentials(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  return getUsers().find((item) => item.email === normalizedEmail && item.password === password) || null;
}

function hasCourseAccess(userId: string, courseId: string) {
  return getPaymentRequests().some(
    (request) =>
      request.userId === userId && request.courseId === courseId && String(request.status).toLowerCase() === 'approved'
  );
}

function enrichCoursesForUser(userId?: string | null) {
  const requests = getPaymentRequests();
  return siteData.academyCourses.map((course) => {
    const purchase = userId
      ? requests.find((request) => request.userId === userId && request.courseId === course.id) || null
      : null;

    return {
      ...course,
      hasAccess: userId ? hasCourseAccess(userId, course.id) : false,
      isPurchased: Boolean(purchase),
      purchaseStatus: purchase?.status || null
    };
  });
}

function serializeAppointment(record: MockAppointmentRecord): AppointmentSummary {
  return {
    id: record.id,
    datetime: record.datetime,
    status: record.status,
    patient_email: record.patientEmail,
    doctor_name: record.doctorName,
    created_at: record.createdAt
  };
}

export const api = {
  async getSessionUser() {
    const user = getSessionUserRecord();
    return { user: user ? sanitizeUser(user) : null };
  },
  async logout() {
    setSessionUser(null);
    clearToken();
    return { ok: true };
  },
  async clinicLogin(email: string, password: string) {
    const user = findUserByCredentials(email, password);
    if (!user) {
      const error = new ApiError('Incorrect email or password');
      error.status = 400;
      throw error;
    }
    setSessionUser(user.id);
    return authResponse(user);
  },
  async clinicRegister(payload: { name: string; phone: string; email: string; password: string }) {
    return createUser({ ...payload, role: 'patient' });
  },
  async academyLogin(email: string, password: string) {
    const user = findUserByCredentials(email, password);
    if (!user) {
      const error = new ApiError('Invalid email or password.');
      error.status = 401;
      throw error;
    }
    setSessionUser(user.id);
    return authResponse(user);
  },
  async academySignup(payload: { name: string; phone: string; email: string; password: string }) {
    return createUser({ ...payload, role: 'student' });
  },
  async submitContact(payload: ContactPayload): Promise<ContactSubmissionResponse> {
    const validated = validateContactForm(payload);
    const contacts = getContacts();
    const next: MockContactRecord = {
      id: createId('cnt'),
      fullname: validated.fullname,
      phone: validated.phone,
      comment: validated.comment,
      source: payload.source || 'contact-form',
      createdAt: new Date().toISOString()
    };

    const apiResult = await submitRemoteEvent('contact', next);

    contacts.unshift(next);
    saveContacts(contacts);
    return {
      status: 'success',
      id: apiResult?.id || next.id,
      storedRemotely: Boolean(apiResult?.storedRemotely),
      notified: Boolean(apiResult?.notified)
    };
  },
  async listDoctors() {
    return siteData.doctors;
  },
  async createAppointment(payload: { doctor_id: number; datetime: string }) {
    const user = requireUser();
    const doctor = siteData.doctors.find((item) => item.id === payload.doctor_id);
    if (!doctor) {
      const error = new ApiError('Doctor not found');
      error.status = 404;
      throw error;
    }

    const appointments = getAppointments();
    const record: MockAppointmentRecord = {
      id: createId('apt'),
      patientId: user.id,
      patientEmail: user.email,
      patientName: user.name,
      patientPhone: user.phone || null,
      doctorId: doctor.id,
      doctorName: doctor.name,
      datetime: payload.datetime,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };

    await submitRemoteEvent('appointment', record);

    appointments.unshift(record);
    saveAppointments(appointments);
    return { status: 'success' };
  },
  async listAppointments() {
    const user = requireUser();
    return getAppointments()
      .filter((item) => item.patientId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(serializeAppointment);
  },
  async cancelAppointment(appointmentId: string | number) {
    const user = requireUser();
    const appointments = getAppointments();
    const appointment = appointments.find((item) => item.id === String(appointmentId) && item.patientId === user.id);
    if (!appointment) {
      const error = new ApiError('Appointment not found');
      error.status = 404;
      throw error;
    }

    appointment.status = 'cancelled';
    saveAppointments(appointments);
    return { appointment: serializeAppointment(appointment) };
  },
  async listCourses() {
    const user = getSessionUserRecord();
    return {
      courses: enrichCoursesForUser(user?.id || null),
      payment: PAYMENT_SETTINGS
    };
  },
  async paymentSettings() {
    return { payment: PAYMENT_SETTINGS };
  },
  async myPurchases() {
    const user = requireUser();
    return {
      purchases: getPaymentRequests()
        .filter((item) => item.userId === user.id)
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    };
  },
  async courseAccess(courseId: string): Promise<CourseAccessResponse> {
    const user = requireUser();
    const course = enrichCoursesForUser(user.id).find((item) => item.id === courseId);

    if (!course) {
      const error = new ApiError('Course not found.');
      error.status = 404;
      throw error;
    }

    const purchase =
      getPaymentRequests().find((item) => item.userId === user.id && item.courseId === courseId) || null;

    return {
      hasAccess: Boolean(course.hasAccess),
      course,
      payment: PAYMENT_SETTINGS,
      grantedAt: purchase?.reviewedAt || null,
      purchase: purchase
        ? {
            id: purchase.id,
            status: purchase.status,
            amount: purchase.amount,
            currency: purchase.currency,
            purchasedAt: purchase.createdAt
          }
        : null
    };
  },
  async purchaseCourse(courseId: string, payload: { paymentProvider: string; requestNote?: string }) {
    const user = requireUser();
    const course = siteData.academyCourses.find((item) => item.id === courseId);
    if (!course) {
      const error = new ApiError('Course not found.');
      error.status = 404;
      throw error;
    }

    if (hasCourseAccess(user.id, courseId)) {
      const error = new ApiError('Course is already approved.');
      error.status = 409;
      throw error;
    }

    const requests = getPaymentRequests();
    const existing = requests.find(
      (item) =>
        item.userId === user.id &&
        item.courseId === courseId &&
        ['pending', 'approved'].includes(String(item.status).toLowerCase())
    );

    if (existing) {
      const error = new ApiError('Payment request already exists for this course.');
      error.status = 409;
      throw error;
    }

    const request: PaymentRequestRecord = {
      id: createId('pay'),
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      userPhone: user.phone || null,
      courseId,
      courseTitle: course.title,
      amount: course.priceValue || 0,
      currency: course.currency || 'USD',
      status: 'pending',
      requestNote: payload.requestNote || '',
      createdAt: new Date().toISOString()
    };

    await submitRemoteEvent('payment_request', request);

    requests.unshift(request);
    savePaymentRequests(requests);

    return {
      purchase: request,
      hasAccess: false,
      course,
      payment: PAYMENT_SETTINGS
    };
  },
  async adminListUsers(query = '') {
    requireAdmin();
    const normalizedQuery = query.trim().toLowerCase();
    const users = getUsers().map(sanitizeUser);
    return {
      users: normalizedQuery
        ? users.filter((item) => item.email.includes(normalizedQuery) || item.name.toLowerCase().includes(normalizedQuery))
        : users
    };
  },
  async adminListPaymentRequests() {
    requireAdmin();
    return {
      paymentRequests: getPaymentRequests().sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      )
    };
  },
  async adminPaymentDecision(paymentRequestId: string, decision: 'approve' | 'reject') {
    requireAdmin();
    const requests = getPaymentRequests();
    const request = requests.find((item) => item.id === paymentRequestId);
    if (!request) {
      const error = new ApiError('Payment request not found.');
      error.status = 404;
      throw error;
    }
    const updatedRequest = {
      ...request,
      status: decision === 'approve' ? 'approved' : 'rejected',
      reviewedAt: new Date().toISOString()
    };

    await submitRemoteEvent('payment_decision', {
      decision,
      paymentRequest: updatedRequest
    });

    Object.assign(request, updatedRequest);
    savePaymentRequests(requests);
    return { paymentRequest: request };
  },
  async adminListAppointments() {
    requireAdmin();
    const appointments: AdminAppointment[] = getAppointments()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((item) => ({
        id: item.id,
        datetime: item.datetime,
        status: item.status,
        doctorName: item.doctorName,
        patientName: item.patientName,
        patientEmail: item.patientEmail,
        patientPhone: item.patientPhone,
        createdAt: item.createdAt
      }));

    return { appointments };
  }
};
