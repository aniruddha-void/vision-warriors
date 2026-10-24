export interface GeneralOffer {
  id: string;
  badge: string;
  badgeBg: string;
  title: string;
  description: string;
  price: string;
  originalPrice?: string;
  timing: string;
  aggregateFact: string;
}

export const generalOffers: GeneralOffer[] = [
  {
    id: 'off-1',
    badge: "Today's special",
    badgeBg: '#FFE96B',
    title: 'Cutting Masala Chai & Samosa Duo',
    description: 'Freshly crushed cardamom and ginger simmered with Assam black tea, served alongside hot, crispy spiced potato samosa.',
    price: '₹120',
    originalPrice: '₹160',
    timing: 'Available all day until 8 PM',
    aggregateFact: 'Top neighborhood comfort combo: 180+ served weekly',
  },
  {
    id: 'off-2',
    badge: 'Popular item',
    badgeBg: '#1EC0FF',
    title: 'Irani Chai & Toasted Bun Maska',
    description: 'Slow-simmered rich condensed tea served with bakery-fresh sweet bun generously layered with whipped Amul butter.',
    price: '₹140',
    originalPrice: '₹175',
    timing: 'Freshly baked batches at 11 AM and 4 PM',
    aggregateFact: 'Ordered by 42% of morning regulars',
  },
  {
    id: 'off-3',
    badge: 'Weekend offer',
    badgeBg: '#1EC7A0',
    title: 'Monsoon Kulhad Chai Platter with Assorted Pakodas',
    description: 'Two traditional clay kulhads of steaming spiced tea accompanied by crispy onion and paneer fritters with mint chutney.',
    price: '₹220',
    originalPrice: '₹280',
    timing: 'Saturday & Sunday only',
    aggregateFact: 'High-density weekend favorite across all guests',
  },
  {
    id: 'off-4',
    badge: 'Chef highlight',
    badgeBg: '#F59E0B',
    title: 'Cardamom Infused Cold Brew',
    description: 'Coarsely ground Chikmagalur coffee beans steeped for 18 hours with crushed green cardamom pods, served over ice.',
    price: '₹180',
    originalPrice: '₹220',
    timing: 'Available chilled daily',
    aggregateFact: 'Customer rating 4.8 / 5 based on 240+ anonymous reviews',
  },
];
