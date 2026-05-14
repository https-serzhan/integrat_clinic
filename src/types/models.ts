export type UserRole = 'patient' | 'student' | 'admin' | string;

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  createdAt?: string;
}

export interface DoctorProfile {
  id: number;
  name: string;
  specialty: string;
  specialty_ru?: string;
  categories: string[];
  image: string;
  cases: string[];
  experience: number;
  education: string;
  education_ru?: string;
  spec: string;
  spec_ru?: string;
}

export type LecturerProfile = DoctorProfile;

export interface AcademyCourse {
  id: string;
  title: string;
  title_ru?: string;
  description: string;
  description_ru?: string;
  category: string;
  badge?: string;
  badge_ru?: string;
  rating?: string;
  meta?: string;
  meta_ru?: string;
  price?: string;
  priceValue?: number;
  priceLabel?: string;
  priceSuffix?: string;
  priceSuffix_ru?: string;
  tags?: string[];
  tags_ru?: string[];
  images?: string[];
  hasAccess?: boolean;
  isPurchased?: boolean;
  purchaseStatus?: string | null;
  currency?: string;
}

export interface AcademyLesson {
  title: string;
  title_ru?: string;
  type?: 'video' | 'resource' | string;
  resourceUrl?: string | null;
  resourceLabel?: string;
  resourceLabel_ru?: string;
  videoSrc?: string;
}

export interface AcademySection {
  title: string;
  title_ru?: string;
  lessons: AcademyLesson[];
}

export interface AcademyOutline {
  title: string;
  title_ru?: string;
  subtitle: string;
  subtitle_ru?: string;
  sections: AcademySection[];
}

export interface SiteDataShape {
  doctors: DoctorProfile[];
  lecturers: LecturerProfile[];
  academyCourses: AcademyCourse[];
  academyVideoCatalog: Record<string, AcademyOutline>;
  media: {
    homeVideoSrc: string;
  };
}

export interface ContactPayload {
  fullname: string;
  phone: string;
  comment: string;
}

export interface ContactSubmissionResponse {
  status: string;
  id: number | string;
}

export interface AuthResponse {
  access_token?: string;
  token_type?: string;
  user: SessionUser;
}

export interface CoursePaymentSettings {
  receiverNumber?: string;
  receiverName?: string;
  instructions?: string;
}

export interface AppointmentSummary {
  id: number | string;
  datetime: string;
  status: string;
  patient_email?: string | null;
  doctor_name?: string | null;
  created_at?: string;
}

export interface AdminAppointment {
  id: number | string;
  datetime: string;
  status: string;
  doctorName?: string | null;
  patientName?: string | null;
  patientEmail?: string | null;
  patientPhone?: string | null;
  createdAt?: string;
}

export interface PaymentRequestRecord {
  id: string;
  userId: string;
  userEmail?: string | null;
  userName?: string | null;
  userPhone?: string | null;
  courseId: string;
  courseTitle?: string | null;
  amount?: number;
  currency?: string;
  status: string;
  requestNote?: string | null;
  createdAt?: string;
  reviewedAt?: string | null;
}

export interface CourseAccessResponse {
  hasAccess: boolean;
  course: AcademyCourse;
  payment: CoursePaymentSettings;
  grantedAt?: string | null;
  purchase?: {
    id: string;
    status: string;
    amount?: number;
    currency?: string;
    purchasedAt?: string;
  } | null;
}
