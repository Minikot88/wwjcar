import { Helmet } from 'react-helmet-async';
import { googleConfig } from '../../config/integrations.js';
import { siteConfig } from '../../config/site.js';

export default function Seo({
  title,
  description = siteConfig.description,
  canonical,
  ogTitle,
  ogDescription,
  ogImage = siteConfig.defaultOgImage,
  ogType = 'website',
  robots = 'index,follow',
  preloadImage,
  schema
}) {
  const pageTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
  const canonicalBase = siteConfig.canonicalUrl || siteConfig.siteUrl;
  const canonicalUrl = canonical ? `${canonicalBase}${canonical}` : canonicalBase;
  const imageUrl = ogImage?.startsWith('http') ? ogImage : `${canonicalBase}${ogImage}`;
  const schemas = Array.isArray(schema) ? schema : schema ? [schema] : [];

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <meta name="language" content="Thai" />
      <meta name="geo.region" content="TH-90" />
      <meta name="geo.placename" content="Hat Yai, Songkhla, Thailand" />
      <meta name="geo.position" content="7.0086;100.4747" />
      <meta name="ICBM" content="7.0086, 100.4747" />
      {googleConfig.searchConsoleVerification ? <meta name="google-site-verification" content={googleConfig.searchConsoleVerification} /> : null}
      <link rel="canonical" href={canonicalUrl} />
      {preloadImage ? <link rel="preload" as="image" href={preloadImage} fetchPriority="high" /> : null}

      <meta property="og:title" content={ogTitle || pageTitle} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={siteConfig.name} />
      <meta property="og:locale" content="th_TH" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle || pageTitle} />
      <meta name="twitter:description" content={ogDescription || description} />
      <meta name="twitter:image" content={imageUrl} />
      {schemas.map((schemaItem, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schemaItem)}
        </script>
      ))}
    </Helmet>
  );
}
