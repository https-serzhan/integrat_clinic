import { siteData } from '../data/siteData';
import { toAssetUrl } from './assets';
import type { AcademyCourse, AcademyLesson, AcademyOutline, AcademySection, CoursePaymentSettings } from '../types/models';

export interface FlattenedLesson extends AcademyLesson {
  courseTitle: string;
  courseSubtitle: string;
  sectionTitle: string;
  sectionIndex: number;
  lessonIndex: number;
  previewImage: string;
}

export function findCourseMetadata(courseId: string) {
  return siteData.academyCourses.find((item) => item.id === courseId) || null;
}

export function mergeCourseWithMetadata(course: Partial<AcademyCourse> & { id: string }): AcademyCourse {
  const metadata = findCourseMetadata(course.id);

  return {
    ...metadata,
    ...course,
    title: course.title || metadata?.title || 'Untitled course',
    description: course.description || metadata?.description || '',
    category: course.category || metadata?.category || 'academy',
    badge: course.badge || metadata?.badge || 'Course',
    rating: course.rating || metadata?.rating || '4.8',
    meta: course.meta || metadata?.meta || 'Integrat Academy',
    price: course.price || metadata?.price || '$0',
    priceValue: course.priceValue || metadata?.priceValue || 0,
    priceLabel: course.priceLabel || metadata?.priceLabel || course.price || metadata?.price || '$0',
    priceSuffix: course.priceSuffix || metadata?.priceSuffix || '',
    tags: course.tags || metadata?.tags || [],
    images: course.images || metadata?.images || [],
    hasAccess: course.hasAccess || false,
    isPurchased: course.isPurchased || false,
    purchaseStatus: course.purchaseStatus || null
  };
}

export function buildPaymentDetails(settings?: CoursePaymentSettings | null) {
  const receiverNumber = settings?.receiverNumber || '+77711140710';
  const receiverName = settings?.receiverName || 'Serzhan S.';
  const instructions =
    settings?.instructions ||
    'Transfer the course amount to Kaspi and then send a payment request for manager approval.';

  return `${instructions}\n${receiverNumber} (${receiverName})`;
}

export function getCourseOutline(courseId: string): AcademyOutline | null {
  return siteData.academyVideoCatalog[courseId] || null;
}

export function flattenCourseLessons(courseId: string): FlattenedLesson[] {
  const outline = getCourseOutline(courseId);
  const course = findCourseMetadata(courseId);
  if (!outline) return [];

  const images = course?.images?.length ? course.images : [toAssetUrl('/assets/images/ph-integrat-group.png')];
  const lessons: FlattenedLesson[] = [];

  outline.sections.forEach((section: AcademySection, sectionIndex) => {
    section.lessons.forEach((lesson, lessonIndex) => {
      lessons.push({
        ...lesson,
        title: lesson.title,
        courseTitle: outline.title,
        courseSubtitle: outline.subtitle,
        sectionTitle: section.title,
        sectionIndex,
        lessonIndex,
        previewImage: images[lessons.length % images.length] || images[0] || toAssetUrl('/assets/images/ph-integrat-group.png')
      });
    });
  });

  return lessons;
}
