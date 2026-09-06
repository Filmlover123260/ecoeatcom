/**
 * URL Helper Utility
 * Guarantees all internal links and external anchor tags explicitly use absolute paths starting with https://
 */

export const DEFAULT_HTTPS_ORIGIN =
  typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin.replace(/^http:\/\//, 'https://')
    : 'https://ais-pre-lsbsv7j4dam5xikxdw75hp-162078633647.asia-southeast1.run.app';

/**
 * Normalizes any internal route or external URL to an absolute URL starting with https://
 */
export function toAbsoluteHttpsUrl(pathOrUrl: string): string {
  if (!pathOrUrl || typeof pathOrUrl !== 'string') {
    return DEFAULT_HTTPS_ORIGIN;
  }

  const trimmed = pathOrUrl.trim();

  // Already an absolute https:// URL
  if (trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Insecure http:// URL -> upgrade to https://
  if (trimmed.startsWith('http://')) {
    return trimmed.replace(/^http:\/\//, 'https://');
  }

  // Protocol-relative URL //domain.com
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  // Internal path (e.g. '/dashboard', 'dashboard', '#faq')
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${DEFAULT_HTTPS_ORIGIN}${cleanPath}`;
}

/**
 * Official external campus and sustainability links - all verified https://
 */
export const CAMPUS_LINKS = {
  BBS_HOME: 'https://binabangsa.sch.id',
  BBS_PIK_CAMPUS: 'https://binabangsa.sch.id/campuses/pantai-indah-kapuk/',
  SUSTAINABILITY_CHARTER: 'https://binabangsa.sch.id/sustainability/',
  PRIVACY_POLICY: 'https://binabangsa.sch.id/privacy-policy/',
  TERMS_OF_SERVICE: 'https://binabangsa.sch.id/terms-of-service/',
  STUDENT_PORTAL: 'https://binabangsa.sch.id/student-portal/',
  HELP_DESK: 'https://binabangsa.sch.id/contact-us/',
} as const;
