const { randomUUID } = require('crypto');

function normalizePhoneDigits(value) {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.startsWith('7') || digits.startsWith('8')) {
    digits = digits.slice(1);
  }
  return digits.slice(0, 10);
}

function cleanText(value, maxLength = 1000) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function requiredText(value, label, minLength = 1, maxLength = 1000) {
  const text = cleanText(value, maxLength);
  if (text.length < minLength) {
    throw new Error(`${label} is required.`);
  }
  return text;
}

function validatePhone(value) {
  const digits = normalizePhoneDigits(value);
  if (digits.length !== 10) {
    throw new Error('Please enter a valid Kazakhstan phone number.');
  }
  return `+7${digits}`;
}

function validateContact(payload) {
  const fullname = requiredText(payload.fullname, 'Full name', 2, 160);
  if (!/^[A-Za-zА-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі\s'-]+$/.test(fullname)) {
    throw new Error('Full name can contain only letters, spaces, apostrophes, or hyphens.');
  }

  const comment = requiredText(payload.comment, 'Comment', 5, 1000);

  return {
    id: payload.id || `cnt_${randomUUID()}`,
    fullname,
    phone: validatePhone(payload.phone),
    comment,
    source: cleanText(payload.source || 'contact-form', 160),
    createdAt: payload.createdAt || new Date().toISOString()
  };
}

function validateRegistration(payload) {
  return {
    id: requiredText(payload.id, 'User id', 2, 160),
    name: requiredText(payload.name, 'Name', 2, 160),
    email: requiredText(payload.email, 'Email', 5, 254).toLowerCase(),
    phone: payload.phone ? validatePhone(payload.phone) : null,
    role: cleanText(payload.role || 'patient', 40),
    createdAt: payload.createdAt || new Date().toISOString()
  };
}

function validateAppointment(payload) {
  return {
    id: requiredText(payload.id, 'Appointment id', 2, 160),
    patientId: requiredText(payload.patientId, 'Patient id', 2, 160),
    patientEmail: requiredText(payload.patientEmail, 'Patient email', 5, 254).toLowerCase(),
    patientName: requiredText(payload.patientName, 'Patient name', 2, 160),
    patientPhone: payload.patientPhone ? validatePhone(payload.patientPhone) : null,
    doctorId: Number(payload.doctorId || 0),
    doctorName: requiredText(payload.doctorName, 'Doctor name', 2, 160),
    datetime: requiredText(payload.datetime, 'Appointment time', 5, 80),
    status: cleanText(payload.status || 'scheduled', 40),
    createdAt: payload.createdAt || new Date().toISOString()
  };
}

function validatePaymentRequest(payload) {
  return {
    id: requiredText(payload.id, 'Payment request id', 2, 160),
    userId: requiredText(payload.userId, 'User id', 2, 160),
    userEmail: requiredText(payload.userEmail, 'User email', 5, 254).toLowerCase(),
    userName: requiredText(payload.userName, 'User name', 2, 160),
    userPhone: payload.userPhone ? validatePhone(payload.userPhone) : null,
    courseId: requiredText(payload.courseId, 'Course id', 2, 160),
    courseTitle: requiredText(payload.courseTitle || payload.courseId, 'Course title', 2, 240),
    amount: Number(payload.amount || 0),
    currency: cleanText(payload.currency || 'USD', 12),
    status: cleanText(payload.status || 'pending', 40),
    requestNote: cleanText(payload.requestNote || '', 1000),
    createdAt: payload.createdAt || new Date().toISOString(),
    reviewedAt: payload.reviewedAt || null
  };
}

function validatePaymentDecision(payload) {
  const decision = payload.decision === 'approve' ? 'approve' : 'reject';
  const paymentRequest = validatePaymentRequest(payload.paymentRequest || {});
  paymentRequest.status = decision === 'approve' ? 'approved' : 'rejected';
  paymentRequest.reviewedAt = paymentRequest.reviewedAt || new Date().toISOString();
  return { decision, paymentRequest };
}

function validateEvent(type, payload) {
  switch (type) {
    case 'contact':
      return validateContact(payload || {});
    case 'registration':
      return validateRegistration(payload || {});
    case 'appointment':
      return validateAppointment(payload || {});
    case 'payment_request':
      return validatePaymentRequest(payload || {});
    case 'payment_decision':
      return validatePaymentDecision(payload || {});
    default:
      throw new Error('Unsupported event type.');
  }
}

function escapeTelegramHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatTelegramMessage(type, payload) {
  if (type === 'contact') {
    return [
      '<b>New contact form request</b>',
      '',
      `<b>Name:</b> ${escapeTelegramHtml(payload.fullname)}`,
      `<b>Phone:</b> ${escapeTelegramHtml(payload.phone)}`,
      `<b>Source:</b> ${escapeTelegramHtml(payload.source)}`,
      `<b>Comment:</b> ${escapeTelegramHtml(payload.comment)}`,
      '',
      `<i>${escapeTelegramHtml(payload.createdAt)}</i>`
    ].join('\n');
  }

  if (type === 'registration') {
    return [
      '<b>New user registration</b>',
      '',
      `<b>Name:</b> ${escapeTelegramHtml(payload.name)}`,
      `<b>Email:</b> ${escapeTelegramHtml(payload.email)}`,
      `<b>Phone:</b> ${escapeTelegramHtml(payload.phone || '-')}`,
      `<b>Role:</b> ${escapeTelegramHtml(payload.role)}`,
      '',
      `<i>${escapeTelegramHtml(payload.createdAt)}</i>`
    ].join('\n');
  }

  if (type === 'appointment') {
    return [
      '<b>New doctor appointment</b>',
      '',
      `<b>Patient:</b> ${escapeTelegramHtml(payload.patientName)}`,
      `<b>Email:</b> ${escapeTelegramHtml(payload.patientEmail)}`,
      `<b>Phone:</b> ${escapeTelegramHtml(payload.patientPhone || '-')}`,
      `<b>Doctor:</b> ${escapeTelegramHtml(payload.doctorName)}`,
      `<b>Time:</b> ${escapeTelegramHtml(payload.datetime)}`,
      '',
      `<i>${escapeTelegramHtml(payload.createdAt)}</i>`
    ].join('\n');
  }

  if (type === 'payment_request') {
    return [
      '<b>New payment request</b>',
      '',
      `<b>User:</b> ${escapeTelegramHtml(payload.userName)}`,
      `<b>Email:</b> ${escapeTelegramHtml(payload.userEmail)}`,
      `<b>Phone:</b> ${escapeTelegramHtml(payload.userPhone || '-')}`,
      `<b>Course:</b> ${escapeTelegramHtml(payload.courseTitle)}`,
      `<b>Amount:</b> ${escapeTelegramHtml(`${payload.amount} ${payload.currency}`)}`,
      `<b>Note:</b> ${escapeTelegramHtml(payload.requestNote || '-')}`,
      '',
      `<i>${escapeTelegramHtml(payload.createdAt)}</i>`
    ].join('\n');
  }

  const request = payload.paymentRequest;
  return [
    `<b>Payment request ${payload.decision === 'approve' ? 'approved' : 'rejected'}</b>`,
    '',
    `<b>User:</b> ${escapeTelegramHtml(request.userName)}`,
    `<b>Email:</b> ${escapeTelegramHtml(request.userEmail)}`,
    `<b>Course:</b> ${escapeTelegramHtml(request.courseTitle)}`,
    `<b>Status:</b> ${escapeTelegramHtml(request.status)}`,
    '',
    `<i>${escapeTelegramHtml(request.reviewedAt)}</i>`
  ].join('\n');
}

async function sendTelegramNotification(type, payload) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const threadId = process.env.TELEGRAM_THREAD_ID;

  if (!token || !chatId) {
    throw new Error('Telegram bot token or chat id is not configured.');
  }

  const body = {
    chat_id: chatId,
    text: formatTelegramMessage(type, payload),
    parse_mode: 'HTML',
    disable_web_page_preview: true
  };

  if (threadId) {
    body.message_thread_id = Number(threadId);
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || 'Telegram notification failed.');
  }

  return true;
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Supabase URL or service-role key is not configured.');
  }

  return {
    url: url.replace(/\/+$/, ''),
    key
  };
}

async function supabaseRequest(path, options = {}) {
  const { url, key } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    method: options.method || 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: options.prefer || 'return=minimal'
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || 'Supabase request failed.');
  }

  return true;
}

function isMissingColumnError(error, columnName) {
  const message = String(error?.message || '');
  return message.includes('PGRST204') && message.includes(`'${columnName}'`);
}

async function insertContact(table, payload) {
  const nameColumns = [
    process.env.SUPABASE_CONTACTS_NAME_COLUMN,
    'fullname',
    'full_name',
    'name'
  ].filter(Boolean);
  const commentColumns = [
    process.env.SUPABASE_CONTACTS_COMMENT_COLUMN,
    'comment',
    'message'
  ].filter(Boolean);

  let lastError = null;
  for (const nameColumn of [...new Set(nameColumns)]) {
    for (const commentColumn of [...new Set(commentColumns)]) {
      const body = {
        id: payload.id,
        [nameColumn]: payload.fullname,
        phone: payload.phone,
        [commentColumn]: payload.comment,
        source: payload.source,
        created_at: payload.createdAt
      };

      for (let attempt = 0; attempt < 4; attempt += 1) {
        try {
          return await supabaseRequest(encodeURIComponent(table), { body });
        } catch (error) {
          lastError = error;
          if (isMissingColumnError(error, nameColumn) || isMissingColumnError(error, commentColumn)) {
            break;
          }
          if (isMissingColumnError(error, 'source')) {
            delete body.source;
            continue;
          }
          if (isMissingColumnError(error, 'created_at')) {
            delete body.created_at;
            continue;
          }
          if (isMissingColumnError(error, 'id')) {
            delete body.id;
            continue;
          }
          throw error;
        }
      }
    }
  }

  throw lastError || new Error('Could not insert contact request.');
}

async function storeEvent(type, payload) {
  if (type === 'contact') {
    const table = process.env.SUPABASE_CONTACTS_TABLE || 'contacts';
    return insertContact(table, payload);
  }

  if (type === 'registration') {
    const table = process.env.SUPABASE_PROFILES_TABLE || 'profiles';
    return supabaseRequest(`${encodeURIComponent(table)}?on_conflict=id`, {
      prefer: 'resolution=merge-duplicates,return=minimal',
      body: {
        id: payload.id,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        role: payload.role,
        created_at: payload.createdAt
      }
    });
  }

  if (type === 'appointment') {
    const table = process.env.SUPABASE_APPOINTMENTS_TABLE || 'appointments';
    return supabaseRequest(encodeURIComponent(table), {
      body: {
        id: payload.id,
        patient_id: payload.patientId,
        patient_email: payload.patientEmail,
        patient_name: payload.patientName,
        patient_phone: payload.patientPhone,
        doctor_id: payload.doctorId,
        doctor_name: payload.doctorName,
        datetime: payload.datetime,
        status: payload.status,
        created_at: payload.createdAt
      }
    });
  }

  if (type === 'payment_request') {
    const table = process.env.SUPABASE_PAYMENT_REQUESTS_TABLE || 'payment_requests';
    return supabaseRequest(encodeURIComponent(table), {
      body: {
        id: payload.id,
        user_id: payload.userId,
        user_email: payload.userEmail,
        user_name: payload.userName,
        user_phone: payload.userPhone,
        course_id: payload.courseId,
        course_title: payload.courseTitle,
        amount: payload.amount,
        currency: payload.currency,
        status: payload.status,
        request_note: payload.requestNote,
        created_at: payload.createdAt
      }
    });
  }

  const request = payload.paymentRequest;
  const paymentTable = process.env.SUPABASE_PAYMENT_REQUESTS_TABLE || 'payment_requests';
  await supabaseRequest(`${encodeURIComponent(paymentTable)}?id=eq.${encodeURIComponent(request.id)}`, {
    method: 'PATCH',
    body: {
      status: request.status,
      reviewed_at: request.reviewedAt
    }
  });

  if (payload.decision === 'approve') {
    const accessTable = process.env.SUPABASE_COURSE_ACCESS_TABLE || 'course_access';
    await supabaseRequest(`${encodeURIComponent(accessTable)}?on_conflict=user_id,course_id`, {
      prefer: 'resolution=merge-duplicates,return=minimal',
      body: {
        user_id: request.userId,
        course_id: request.courseId,
        payment_request_id: request.id,
        granted_at: request.reviewedAt
      }
    });
  }

  return true;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.CONTACT_ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  try {
    const type = String(req.body?.type || '').trim();
    const payload = validateEvent(type, req.body?.payload || {});

    await sendTelegramNotification(type, payload);
    await storeEvent(type, payload);

    res.status(200).json({
      status: 'success',
      id: payload.id || payload.paymentRequest?.id,
      notified: true,
      storedRemotely: true
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Event processing failed.'
    });
  }
};
