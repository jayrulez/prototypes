const fs = require('fs');
const { parseBib } = require('./bib-parser.js');

const src = fs.readFileSync('./jshopl.bib').toString('utf-8');
const entries = parseBib(src);

let missingUrlCount = 0;

const getURL = (entry) => {
  const url = entry.archivedurl || entry.url;
  if (!url) missingUrlCount++;
  return url;
};

const fieldsToMarks = (fields) => fields
  .map(f => `* <a id="${f.id}">${f.url ? `[${f.title}](${f.url})` : f.title}</a>`)
  .join('\n');

const fields = entries.map(entry => ({
  id: entry.id,
  author: entry.author,
  title: entry.title,
  url: getURL(entry)
}));

if (missingUrlCount) console.error('Missing URL count', missingUrlCount);

// console.log(JSON.stringify(entries, null, 2));
// console.log(JSON.stringify(fields, null, 2));
const dist = '# 参考文献\n\n' + fieldsToMarks(fields);
console.log(dist);
