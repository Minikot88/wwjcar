import {
  ENFORCE_HTTPS,
  GA_MEASUREMENT_ID,
  GOOGLE_BUSINESS_PROFILE_URL,
  GOOGLE_MAPS_URL,
  GOOGLE_SITE_VERIFICATION,
  GTM_CONTAINER_ID,
  REDIRECT_WWW
} from './env.js';

export const googleConfig = {
  searchConsoleVerification: GOOGLE_SITE_VERIFICATION,
  analyticsMeasurementId: GA_MEASUREMENT_ID,
  tagManagerContainerId: GTM_CONTAINER_ID,
  businessProfileUrl: GOOGLE_BUSINESS_PROFILE_URL,
  mapsUrl: GOOGLE_MAPS_URL
};

export const domainConfig = {
  enforceHttps: ENFORCE_HTTPS,
  redirectWww: REDIRECT_WWW
};
