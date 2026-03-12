import {
  buildAbsoluteUrl,
  buildStructuredData,
  getRouteInfo,
  siteConfig,
} from '../content/siteContent.js';

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element?.setAttribute(key, value);
  });
}

function upsertLink(selector: string, rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(selector);

  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    document.head.appendChild(element);
  }

  element.href = href;
}

export function applyRouteSeo(pathname: string) {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return;
  }

  const route = getRouteInfo(pathname);
  const siteUrl = window.location.origin;
  const canonical = buildAbsoluteUrl(route.seo.path, siteUrl);
  const image = buildAbsoluteUrl(route.seo.image, siteUrl);
  const structuredData = JSON.stringify(buildStructuredData(route, siteUrl)).replace(/</g, '\\u003c');

  document.title = route.seo.title;

  upsertMeta('meta[name="description"]', {
    name: 'description',
    content: route.seo.description,
  });
  upsertMeta('meta[name="application-name"]', {
    name: 'application-name',
    content: siteConfig.shortName,
  });
  upsertMeta('meta[property="og:type"]', {
    property: 'og:type',
    content: route.seo.type,
  });
  upsertMeta('meta[property="og:locale"]', {
    property: 'og:locale',
    content: siteConfig.locale,
  });
  upsertMeta('meta[property="og:site_name"]', {
    property: 'og:site_name',
    content: siteConfig.siteName,
  });
  upsertMeta('meta[property="og:title"]', {
    property: 'og:title',
    content: route.seo.title,
  });
  upsertMeta('meta[property="og:description"]', {
    property: 'og:description',
    content: route.seo.description,
  });
  upsertMeta('meta[property="og:url"]', {
    property: 'og:url',
    content: canonical,
  });
  upsertMeta('meta[property="og:image"]', {
    property: 'og:image',
    content: image,
  });
  upsertMeta('meta[name="twitter:card"]', {
    name: 'twitter:card',
    content: 'summary_large_image',
  });
  upsertMeta('meta[name="twitter:title"]', {
    name: 'twitter:title',
    content: route.seo.title,
  });
  upsertMeta('meta[name="twitter:description"]', {
    name: 'twitter:description',
    content: route.seo.description,
  });
  upsertMeta('meta[name="twitter:image"]', {
    name: 'twitter:image',
    content: image,
  });

  if (route.seo.publishedTime) {
    upsertMeta('meta[property="article:published_time"]', {
      property: 'article:published_time',
      content: route.seo.publishedTime,
    });
  }

  if (route.seo.modifiedTime) {
    upsertMeta('meta[property="article:modified_time"]', {
      property: 'article:modified_time',
      content: route.seo.modifiedTime,
    });
  }

  upsertLink('link[rel="canonical"]', 'canonical', canonical);

  let script = document.getElementById('structured-data');

  if (!script) {
    script = document.createElement('script');
    script.id = 'structured-data';
    script.setAttribute('type', 'application/ld+json');
    document.head.appendChild(script);
  }

  script.textContent = structuredData;
}
