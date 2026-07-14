import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://brilliantchessacademy.com';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/student/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
