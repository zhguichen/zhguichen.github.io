import type { APIRoute } from 'astro';
import { getPublishedNotes } from '../lib/notes';

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL('https://zhguichen.github.io');
  const notes = await getPublishedNotes();
  const pages = [
    { path: '/', date: new Date('2026-08-03') },
    { path: '/notes/', date: notes[0]?.data.date ?? new Date('2023-01-01') },
    { path: '/about/', date: new Date('2026-08-03') },
    ...notes.map((note) => ({ path: `/notes/${note.data.slug}/`, date: note.data.updated ?? note.data.date }))
  ];
  const urls = pages
    .map(({ path, date }) => `  <url><loc>${new URL(path, base).href}</loc><lastmod>${date.toISOString().slice(0, 10)}</lastmod></url>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
