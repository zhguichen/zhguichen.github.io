import type { APIRoute } from 'astro';
import { formatDateISO, getPublishedNotes } from '../lib/notes';

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL('https://zhguichen.github.io');
  const notes = await getPublishedNotes();
  const pages = [
    { path: '/', date: notes[0]?.data.updated ?? notes[0]?.data.date },
    { path: '/notes/', date: notes[0]?.data.updated ?? notes[0]?.data.date },
    { path: '/about/' },
    ...notes.map((note) => ({ path: `/notes/${note.data.slug}/`, date: note.data.updated ?? note.data.date }))
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
