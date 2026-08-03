import type { APIRoute } from 'astro';
import { getPublishedNotes, xmlEscape } from '../lib/notes';

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL('https://zhguichen.github.io');
  const notes = await getPublishedNotes();
  const items = notes
    .map((note) => {
      const url = new URL(`/notes/${note.data.slug}/`, base).href;
      return `\n    <item>\n      <title>${xmlEscape(note.data.title)}</title>\n      <link>${url}</link>\n      <guid>${url}</guid>\n      <description>${xmlEscape(note.data.description)}</description>\n      <pubDate>${note.data.date.toUTCString()}</pubDate>\n    </item>`;
    })
    .join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>Jason / Notes</title>\n    <link>${base.href}</link>\n    <description>技术、运动、生活与持续探索的长期记录。</description>${items}\n  </channel>\n</rss>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
