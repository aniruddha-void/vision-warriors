import { MessageTemplate } from '../types';

export const initialTemplates: MessageTemplate[] = [
  {
    id: 'tmpl-1',
    title: 'Warm Bun Maska Welcome Back',
    goal: 'Win-back',
    channel: 'whatsapp',
    content: 'Hi {first_name}! ☕ We missed seeing you at Chai & Co. Your favorite {favourite_item} is steaming hot and ready. Show this message for a complimentary Bun Maska on us this week! Valid till Sunday.',
    variables: ['{first_name}', '{favourite_item}', '{cafe_name}'],
  },
  {
    id: 'tmpl-2',
    title: 'Double Stamp Second Visit',
    goal: 'Welcome',
    channel: 'whatsapp',
    content: 'Welcome to the Chai & Co family, {first_name}! 🌟 Thanks for stopping by recently. On your next visit this week, earn double reward stamps toward your free signature Chai!',
    variables: ['{first_name}', '{cafe_name}'],
  },
  {
    id: 'tmpl-3',
    title: 'Artisan Micro-Batch Tasting VIP Invite',
    goal: 'Loyalty',
    channel: 'whatsapp',
    content: 'Hey {first_name}! 🍵 You are one of Chai & Co’s most cherished regulars. We just received an exclusive micro-batch of Nilgiri Frost White Tea. Drop by this Thursday between 4-7 PM for a free tasting cup on us!',
    variables: ['{first_name}', '{cafe_name}'],
  },
  {
    id: 'tmpl-4',
    title: 'Savory Roll Afternoon Pairing',
    goal: 'Upsell',
    channel: 'whatsapp',
    content: 'Good afternoon {first_name}! Pair your beloved {favourite_item} with our freshly baked Truffle Paneer Roll for just ₹80 extra today (regular ₹140). Pure bliss in every bite! 🥐☕',
    variables: ['{first_name}', '{favourite_item}'],
  },
  {
    id: 'tmpl-5',
    title: 'Monsoon Chai & Pakoda Community Broadcast',
    goal: 'Weekend special',
    channel: 'whatsapp',
    content: 'Rainy weekend vibes at Chai & Co! 🌧️ Freshly spiced Kulhad Chai & crispy onion pakodas are sizzling all weekend long. Bring your friends and unwind with us!',
    variables: ['{cafe_name}'],
  },
  {
    id: 'tmpl-6',
    title: '1-Tap Flavor Feedback Pulse',
    goal: 'Feedback',
    channel: 'sms',
    content: 'Chai & Co: {first_name}, how was your Cold Brew? Reply 1 (Loved), 2 (Too sweet), or 3 (More spice). We value your palate!',
    variables: ['{first_name}'],
  },
];
