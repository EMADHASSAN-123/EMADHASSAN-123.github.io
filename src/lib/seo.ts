/**
 * Structured data (schema.org JSON-LD) built from documented facts only
 * (PROJECT_CONTEXT sections 1, 2.1, 9.3). Emitted as inert data blocks.
 */
import { t } from '@/lib/i18n';
import { CONTACT } from '@/lib/site';

export const GITHUB_PROFILE_URL = 'https://github.com/EMADHASSAN-123';
export const OG_IMAGE = { path: '/og-image.png', width: 1200, height: 630 } as const;

type JsonLd = Record<string, unknown>;

export const personId = (site: URL) => new URL('/#person', site).href;
export const websiteId = (site: URL) => new URL('/#website', site).href;

export function personJsonLd(site: URL, imageUrl: string): JsonLd {
  return {
    '@type': 'Person',
    '@id': personId(site),
    name: t('en', 'site.name'),
    alternateName: t('ar', 'site.name'),
    jobTitle: t('en', 'hero.role'),
    description: t('en', 'meta.description'),
    url: new URL('/', site).href,
    image: imageUrl,
    email: CONTACT.email ? `mailto:${CONTACT.email}` : undefined,
    address: { '@type': 'PostalAddress', addressLocality: 'Taiz', addressCountry: 'YE' },
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'Taiz University' },
    knowsLanguage: ['ar', 'en'],
    knowsAbout: [
      'Software Engineering',
      'System Architecture',
      'Applied AI Engineering',
      'Digital Solutions Engineering',
    ],
    sameAs: [CONTACT.linkedinUrl, CONTACT.facebookUrl, GITHUB_PROFILE_URL],
  };
}

export function websiteJsonLd(site: URL): JsonLd {
  return {
    '@type': 'WebSite',
    '@id': websiteId(site),
    url: new URL('/', site).href,
    name: t('en', 'site.name'),
    alternateName: t('ar', 'site.name'),
    inLanguage: ['ar', 'en'],
    publisher: { '@id': personId(site) },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]): JsonLd {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** Serialize for a <script type="application/ld+json"> block; `<` is escaped. */
export function serializeJsonLd(graph: JsonLd[]): string {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(
    /</g,
    '\\u003c',
  );
}
