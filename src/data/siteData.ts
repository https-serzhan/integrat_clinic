import legacySiteDataSource from '../scripts/shared/site-data.js?raw';
import type {
  AcademyCourse,
  AcademyLesson,
  AcademyOutline,
  AcademySection,
  SiteDataShape
} from '../types/models';
import { toAssetUrl } from '../lib/assets';

function loadLegacySiteData(): SiteDataShape {
  const globalScope: { IntegratSiteData?: unknown } = {};
  const moduleScope: { exports?: unknown } = { exports: undefined };

  new Function('window', 'globalThis', 'module', legacySiteDataSource)(globalScope, globalScope, moduleScope);

  return (moduleScope.exports || globalScope.IntegratSiteData || {}) as SiteDataShape;
}

function normalizeDoctor(doctor: Partial<SiteDataShape['doctors'][number]>): SiteDataShape['doctors'][number] {
  return {
    ...doctor,
    id: Number(doctor.id || 0),
    name: doctor.name || 'Integrat doctor',
    specialty: doctor.specialty || 'Dental specialist',
    categories: Array.isArray(doctor.categories) ? doctor.categories : ['all'],
    image: toAssetUrl(doctor.image || '/assets/images/orange-doctor.png'),
    cases: Array.isArray(doctor.cases) && doctor.cases.length
      ? doctor.cases.map((item) => toAssetUrl(item))
      : [toAssetUrl(doctor.image || '/assets/images/orange-doctor.png')],
    experience: Number(doctor.experience || 0),
    education: doctor.education || '',
    spec: doctor.spec || doctor.specialty || ''
  };
}

function normalizeLesson(lesson: AcademyLesson): AcademyLesson {
  return {
    ...lesson,
    resourceUrl: lesson.resourceUrl ? toAssetUrl(lesson.resourceUrl) : null
  };
}

function normalizeSection(section: AcademySection): AcademySection {
  return {
    ...section,
    lessons: Array.isArray(section.lessons) ? section.lessons.map(normalizeLesson) : []
  };
}

function normalizeOutline(outline: AcademyOutline): AcademyOutline {
  return {
    ...outline,
    sections: Array.isArray(outline.sections) ? outline.sections.map(normalizeSection) : []
  };
}

function normalizeCourse(course: AcademyCourse): AcademyCourse {
  return {
    ...course,
    images: Array.isArray(course.images) ? course.images.map((item) => toAssetUrl(item)) : []
  };
}

const rawSiteData = loadLegacySiteData();

export const siteData: SiteDataShape = {
  doctors: Array.isArray(rawSiteData.doctors) ? rawSiteData.doctors.map(normalizeDoctor) : [],
  lecturers: Array.isArray(rawSiteData.lecturers) ? rawSiteData.lecturers.map(normalizeDoctor) : [],
  academyCourses: Array.isArray(rawSiteData.academyCourses) ? rawSiteData.academyCourses.map(normalizeCourse) : [],
  academyVideoCatalog: Object.fromEntries(
    Object.entries(rawSiteData.academyVideoCatalog || {}).map(([courseId, outline]) => [
      courseId,
      normalizeOutline(outline)
    ])
  ),
  media: {
    homeVideoSrc: rawSiteData.media?.homeVideoSrc || 'https://www.w3schools.com/html/mov_bbb.mp4'
  }
};
