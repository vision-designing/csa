import { getPermalink } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Home',
      href: '/',
    },
    {
      text: 'Services',
      links: [
        {
          text: 'Experience',
          href: getPermalink('/experience/'),
        },
        {
          text: 'Industries',
          href: getPermalink('/industries/'),
        },
        {
          text: 'Services',
          href: getPermalink('/services/'),
        },
      ],
    },
    {
      text: 'Resources',
      links: [
        {
          text: 'Careers',
          href: getPermalink('/careers/'),
        },
        {
          text: 'Contact Us',
          href: getPermalink('/contact/'),
        },
      ],
    },
  ],
  actions: [{ text: 'Contact Us', href: getPermalink('/contact/'), target: '_blank' }],
};

export const footerData = {
  links: [
    {
      title: 'About',
      links: [
        { text: 'Home', href: '/' },
        
      ],
    },
    {
      title: 'Services',
      links: [
        { text: 'Industries', href: '/industries/' },
        { text: 'Services', href: '/services/' },
        { text: 'Experience', href: '/experience/' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { text: 'Careers', href: '/careers/' },
        { text: 'Contact Us', href: '/contact/' },
      ],
    },
  ]
};
