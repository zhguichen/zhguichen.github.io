import { getCollection, type CollectionEntry } from 'astro:content';

export type Note = CollectionEntry<'notes'>;
export type Lang = 'en' | 'zh';

export async function getPublishedNotes(lang?: Lang) {
  const notes = await getCollection('notes', ({ data }) => {
    if (data.draft) return false;
    return lang ? data.lang === lang : true;
  });
  return notes.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function formatDate(date: Date, lang: Lang = 'zh') {
  if (lang === 'en') {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      timeZone: 'Asia/Shanghai'
    }).format(date);
  }
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Shanghai'
  })
    .format(date)
    .replaceAll('/', '.');
}

export function switchLanguage(pathname: string): string {
  if (pathname === '/zh') return '/';
  if (pathname.startsWith('/zh/')) return pathname.slice(3) || '/';
  if (pathname === '/') return '/zh/';
  return `/zh${pathname}`;
}

export function formatDateISO(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Shanghai'
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function readingTime(note: Note) {
  const text = note.body
    .replace(/^---[\s\S]*?---/, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[`#>*_\-[\]()!]/g, ' ');
  const han = (text.match(/[\u3400-\u9fff]/g) ?? []).length;
  const latin = text.replace(/[\u3400-\u9fff]/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(han / 450 + latin / 220));
}

export function relatedNotes(note: Note, notes: Note[]) {
  return notes
    .filter((candidate) => candidate.data.slug !== note.data.slug)
    .map((candidate) => ({
      note: candidate,
      score: candidate.data.tags.filter((tag) => note.data.tags.includes(tag)).length
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.note.data.date.valueOf() - a.note.data.date.valueOf())
    .slice(0, 2)
    .map(({ note: candidate }) => candidate);
}

export function xmlEscape(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}
