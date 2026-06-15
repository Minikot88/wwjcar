import { contactConfig } from '../config/contact.js';

export const contactActions = {
  phone: {
    label: 'โทรเลย',
    shortLabel: 'โทร',
    href: `tel:${contactConfig.phone}`,
    ariaLabel: `โทรหา ${contactConfig.businessName} ${contactConfig.phoneDisplay}`
  },
  line: {
    label: 'LINE',
    shortLabel: 'LINE',
    href: contactConfig.lineUrl,
    ariaLabel: `ติดต่อ ${contactConfig.businessName} ผ่าน LINE ${contactConfig.lineId}`,
    external: true
  },
  whatsapp: {
    label: 'WhatsApp',
    shortLabel: 'WhatsApp',
    href: contactConfig.whatsappUrl,
    ariaLabel: `ติดต่อ ${contactConfig.businessName} ผ่าน WhatsApp`,
    external: true
  }
};

export function externalLinkProps(action) {
  return action.external
    ? {
        target: '_blank',
        rel: 'noopener noreferrer'
      }
    : {};
}
