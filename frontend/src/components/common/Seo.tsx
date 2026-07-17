import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Devkalp Foundation';
const DEFAULT_IMAGE = '/devkalp-logo-removebg-preview.png';
const SITE_URL = (import.meta.env.VITE_APP_URL || 'https://devkalp.org').replace(/\/$/, '');

interface SeoProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noindex?: boolean;
  type?: 'website' | 'article';
}

export default function Seo({ title, description, path = '', image = DEFAULT_IMAGE, noindex = false, type = 'website' }: SeoProps) {
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
  const url = `${SITE_URL}${path}`;
  const absoluteImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={absoluteImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImage} />
    </Helmet>
  );
}
