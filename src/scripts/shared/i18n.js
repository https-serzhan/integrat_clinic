(function i18nBootstrap(windowObject, documentObject) {
  const translations = {
    form_invalid: 'Please complete the form correctly before submitting.',
    form_sending: 'Sending your request...',
    form_success: 'Request sent. The Integrat team will contact you shortly.',
    form_api_missing: 'Clinic API is not configured yet. Update the frontend runtime config first.',
    appointment_submitting: 'Submitting appointment request...',
    appointment_success: 'Appointment request submitted successfully.',
    appointment_error: 'Failed to create appointment.',
    appointment_pick_time: 'Select a preferred appointment time before continuing.',
    appointment_no_auth: 'Please log in before booking an appointment.',
    auth_login_failed: 'Login failed.',
    auth_register_failed: 'Registration failed.',
    auth_password_mismatch: 'Passwords do not match.',
    auth_password_short: 'Password must be at least 8 characters.',
    auth_password_weak: 'Use at least 8 characters with uppercase, lowercase, number, and symbol.',
    academy_login_required: 'Please log in from Academy to access or buy this course.',
    academy_buy_first: 'Purchase this course to unlock all lessons.',
    academy_buy_success: 'Purchase completed. Course access is now unlocked.',
    academy_buy_error: 'Purchase failed.',
    academy_open_course: 'Open Course',
    academy_buy_course: 'Buy Course',
    academy_view_in_academy: 'Open in Academy',
    academy_already_purchased: 'Purchased',
    academy_request_pending: 'Pending Approval',
    academy_request_exists: 'Request already exists for this course.',
    academy_request_sent: 'Payment request sent. Admin will review it shortly.',
    academy_payment_default:
      'Transfer the course amount to Kaspi and then send a payment request for manager approval.',
    academy_payment_info_title: 'Payment details',
    academy_payment_confirm: 'After payment, press OK to send your payment request.',
    academy_payment_note_prompt: 'Optional: add transfer comment or transaction time',
    academy_purchase_processing: 'Processing...',
    academy_my_courses: 'Purchased Courses',
    academy_no_courses: 'No purchased courses yet.',
    academy_show_more: 'show more',
    academy_all_shown: 'all courses shown',
    all: 'All',
    contact_request_failed: 'Failed to send the request.',
    contact_network_error: 'Cannot reach backend API. Start backend on http://localhost:3000 and retry.',
    doctor_specialist_fallback: 'Dental specialist',
    doctor_name_fallback: 'Integrat doctor',
    doctor_education_fallback: 'Education profile will be published soon.',
    doctor_focus_fallback: 'Comprehensive dental treatment.',
    doctor_experience: 'Experience: {years} years',
    doctor_education_label: 'Education:',
    doctor_focus_label: 'Focus:',
    doctor_booking_label: 'Preferred appointment time',
    doctor_incomplete: 'Doctor information is incomplete.',
    doctor_api_missing: 'Clinic API is not configured yet.',
    doctors_empty: 'Profiles will be added soon.',
    admin_unknown_user: 'Unknown user',
    admin_granted_at: 'Granted at {datetime}',
    admin_remove: 'Remove',
    admin_no_users: 'No users yet.',
    admin_no_grants: 'No active grants.',
    admin_no_purchases: 'No purchases yet.',
    admin_no_payment_requests: 'No payment requests yet.',
    admin_approve: 'Approve',
    admin_reject: 'Reject',
    admin_request_approved: 'Payment request approved.',
    admin_request_rejected: 'Payment request rejected.',
    admin_grant_removed: 'Grant removed.',
    admin_grant_success: 'Permission granted successfully.',
    videos_section_items: '{count} items',
    videos_toggle_section: 'Toggle section',
    videos_collapse_section: 'Collapse section',
    videos_open_academy: 'Academy',
    videos_access_failed: 'Access check failed: {message}',
    videos_unavailable_title: 'Course unavailable',
    videos_unavailable_subtitle: 'This course outline will be published soon.',
    videos_unavailable_outline: 'Course outline is not available yet.',
    academy_remote_courses_failed: 'Unable to load remote courses.',
    academy_no_filter_matches: 'No courses match this filter yet.'
  };

  function t(key, fallback) {
    return translations[key] || fallback || key;
  }

  function formatTemplate(template, values = {}) {
    return String(template || '').replace(/\{(\w+)\}/g, (_match, key) => {
      const value = values[key];
      return value === undefined || value === null ? '' : String(value);
    });
  }

  function applyDomTranslations() {
    documentObject.documentElement.setAttribute('lang', 'en');

    const CustomEventConstructor = windowObject.CustomEvent || globalThis.CustomEvent;
    if (typeof CustomEventConstructor === 'function') {
      documentObject.dispatchEvent(
        new CustomEventConstructor('integrat:langchange', {
          detail: { lang: 'en' }
        })
      );
    }
  }

  windowObject.IntegratI18n = {
    get lang() {
      return 'en';
    },
    t,
    format(key, values, fallback) {
      return formatTemplate(t(key, fallback), values);
    },
    setLanguage() {
      applyDomTranslations();
    },
    applyDomTranslations,
    isRussian() {
      return false;
    }
  };

  if (documentObject.readyState === 'loading') {
    documentObject.addEventListener('DOMContentLoaded', applyDomTranslations);
  } else {
    applyDomTranslations();
  }
})(window, document);
