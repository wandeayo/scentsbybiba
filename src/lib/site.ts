export const SITE = {
  name: 'Scents by Biba',
  // Comes from `site` in astro.config.mjs (SITE_URL in Vercel), so it is set in one place only.
  url: import.meta.env.SITE as string,
  whatsapp: '2347063221856',
  phoneDisplay: '0706 322 1856',
  instagram: 'https://www.instagram.com/scentsbybiba_/',
  address: 'Shop 6, Thilda Centre, Dadin Kowa, Zarmangada roundabout (opposite GIG office), Jos, Plateau State',
  addressShort: 'Shop 6, Thilda Centre, Zarmangada, Jos',
  hours: 'Monday to Saturday, 10am to 5pm',
  delivery: 'Delivery anywhere in Nigeria in 1 to 2 days',
  mapUrl:
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent('Thilda Centre, Dadin Kowa, Zarmangada, Jos, Plateau State'),
};

export function abs(path: string): string {
  return new URL(path, SITE.url).href;
}

export function waLink(message: string): string {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function naira(n: number): string {
  return '₦' + n.toLocaleString('en-NG');
}

export const STORE_ID = abs('/#store');

// The shop as Google should understand it. Used on the home, visit and city pages;
// product offers point back to it by @id.
export function storeJsonLd(areaServed: string[] = []) {
  return {
    '@type': 'Store',
    '@id': STORE_ID,
    name: SITE.name,
    url: abs('/'),
    telephone: '+' + SITE.whatsapp,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Shop 6, Thilda Centre, Dadin Kowa, Zarmangada roundabout',
      addressLocality: 'Jos',
      addressRegion: 'Plateau',
      addressCountry: 'NG',
    },
    hasMap: SITE.mapUrl,
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '10:00',
        closes: '17:00',
      },
    ],
    currenciesAccepted: 'NGN',
    areaServed: [
      { '@type': 'Country', name: 'Nigeria' },
      ...areaServed.map((name) => ({ '@type': 'City', name })),
    ],
    sameAs: [SITE.instagram],
  };
}

export function graph(...nodes: object[]) {
  return { '@context': 'https://schema.org', '@graph': nodes };
}

export function breadcrumbs(items: [name: string, path: string][]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: abs(path),
    })),
  };
}
