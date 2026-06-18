import { contactConfig } from '../config/contact.js';
import { useCmsResource } from './useCmsResource.js';
import { cmsService } from '../services/cmsService.js';

function getSetting(settings, key, fallback = {}) {
  return settings.find((item) => item.key === key)?.value || fallback;
}

function lineUrl(value) {
  if (!value) return contactConfig.lineUrl;
  if (/^https?:\/\//i.test(value)) return value;
  return `https://line.me/R/ti/p/${String(value).startsWith('@') ? value : `@${value}`}`;
}

function whatsappUrl(value) {
  if (!value) return contactConfig.whatsappUrl;
  if (/^https?:\/\//i.test(value)) return value;
  return `https://wa.me/${String(value).replace(/[^\d]/g, '')}`;
}

export function usePublicContactSettings() {
  const { data } = useCmsResource(() => cmsService.getSettings(), [], []);
  const settings = Array.isArray(data) ? data : [];
  const contact = getSetting(settings, 'contact', {});

  return {
    ...contactConfig,
    phone: contact.phone || contactConfig.phone,
    phoneDisplay: contact.phoneDisplay || contact.phone || contactConfig.phoneDisplay,
    lineId: contact.line || contactConfig.lineId,
    lineUrl: lineUrl(contact.lineUrl || contact.line),
    whatsapp: contact.whatsapp || contactConfig.whatsapp,
    whatsappUrl: whatsappUrl(contact.whatsappUrl || contact.whatsapp),
    facebookUrl: contact.facebookUrl || contact.facebook || contactConfig.facebookUrl,
    instagramUrl: contact.instagramUrl || contact.instagram || contactConfig.instagramUrl,
    email: contact.email || contactConfig.email,
    googleMapsUrl: contact.googleMaps || contact.googleMapsUrl || contactConfig.googleMapsUrl,
    businessHours: contact.businessHours || contactConfig.businessHours,
    footerText: contact.footerText || 'รถเช่าหาดใหญ่สำหรับการเดินทางที่ง่าย สะอาด และมั่นใจ'
  };
}
