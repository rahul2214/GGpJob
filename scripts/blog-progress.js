/**
 * Reports which posts have been expanded, and how long each one is.
 *
 * "Expanded" means the post carries the fields the deeper format adds —
 * keyTakeaways for the summary block and anchors for the internal link graph.
 * Run with `node scripts/blog-progress.js`; pass --list to print the remaining
 * slugs, or --done to print the finished ones.
 */
const fs = require('fs');
const path = require('path');

const DIR = path.join(process.cwd(), 'src/content/blog');
const STRING_LITERAL = new RegExp("'((?:[^'\\\\]|\\\\.)*)'", 'g');

/** Rough count of the prose that actually renders, ignoring field names. */
function bodyWords(source) {
  const body = source.slice(source.indexOf('keyTakeaways:') > -1 ? source.indexOf('keyTakeaways:') : source.indexOf('sections:'));
  const strings = [...body.matchAll(STRING_LITERAL)].map(m => m[1]);
  return strings.join(' ').split(/\s+/).filter(Boolean).length;
}

const rows = fs.readdirSync(DIR)
  .filter(f => f.endsWith('.ts'))
  .map(file => {
    const source = fs.readFileSync(path.join(DIR, file), 'utf8');
    return {
      slug: file.replace(/\.ts$/, ''),
      done: source.includes('  keyTakeaways:') && source.includes('  anchors:'),
      words: bodyWords(source),
    };
  });

const done = rows.filter(r => r.done);
const todo = rows.filter(r => !r.done);
const avg = list => (list.length ? Math.round(list.reduce((s, r) => s + r.words, 0) / list.length) : 0);

if (process.argv.includes('--list')) {
  todo.forEach(r => console.log(r.slug));
} else if (process.argv.includes('--done')) {
  done.forEach(r => console.log(r.slug, r.words));
} else {
  console.log(`expanded : ${done.length}/${rows.length}  (avg ${avg(done)} words)`);
  console.log(`remaining: ${todo.length}       (avg ${avg(todo)} words)`);
  const short = done.filter(r => r.words < 1450);
  if (short.length) {
    console.log(`\nexpanded but under 1450 words (${short.length}):`);
    short.forEach(r => console.log(`  ${r.words}  ${r.slug}`));
  }
}
