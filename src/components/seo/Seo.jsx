import { Helmet } from 'react-helmet-async';
import { siteConfig } from '../../config/site.js';

export default function Seo({
  title,
  description = siteConfig.description,
  canonical,
  ogTitle,
  ogDescription,
  ogImage = siteConfig.defaultOgImage,
  robots = 'index,follow',
  schema
}) {
  const pageTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
  const canonicalUrl = canonical ? `${siteConfig.siteUrl}${canonical}` : siteConfig.siteUrl;
  const imageUrl = ogImage?.startsWith('http') ? ogImage : `${siteConfig.siteUrl}${ogImage}`;
  const schemas = Array.isArray(schema) ? schema : schema ? [schema] : [];

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:title" content={ogTitle || pageTitle} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
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
