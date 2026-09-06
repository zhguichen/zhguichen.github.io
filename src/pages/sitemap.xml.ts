import type { APIRoute } from 'astro';
import { formatDateISO, getPublishedNotes } from '../lib/notes';

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL('https://zhguichen.github.io');
  const enNotes = await getPublishedNotes('en');
  const zhNotes = await getPublishedNotes('zh');
  const latest = enNotes[0]?.data.updated ?? enNotes[0]?.data.date ?? zhNotes[0]?.data.date;
  const pages = [
    { path: '/', date: latest },
    { path: '/notes/', date: latest },
    { path: '/about/' },
    { path: '/zh/', date: latest },
    { path: '/zh/notes/', date: latest },
    { path: '/zh/about/' },
    ...enNotes.map((note) => ({ path: `/notes/${note.data.slug}/`, date: note.data.updated ?? note.data.date })),
    ...zhNotes.map((note) => ({ path: `/zh/notes/${note.data.slug}/`, date: note.data.updated ?? note.data.date }))
  ];
  const urls = pages
    .map(({ path, date }) => {
      const lastmod = date ? `<lastmod>${formatDateISO(date)}</lastmod>` : '';
      return `  <url><loc>${new URL(path, base).href}</loc>${lastmod}</url>`;
    })
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
