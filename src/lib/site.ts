export const SITE = {
  name: 'Scents by Biba',
  url: 'https://scentsbybiba.com',
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

export function waLink(message: string): string {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function naira(n: number): string {
  return '₦' + n.toLocaleString('en-NG');
}
