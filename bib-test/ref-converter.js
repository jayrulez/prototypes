const fs = require('fs');
const marked = require('marked');

const originalRefs = JSON.parse(fs.readFileSync('./jshopl.json', 'utf8'));
const onlineRefs = [];

function readFiles() {
  let str = '';
  for (let i = 1; i <= 4; i++) {
    str += fs.readFileSync(`./part-${i}.md`, 'utf8') + '\n';
  }
  return str;
}

function walkTokens(token) {
  if (token.type === 'link') {
    if (token.href.includes('references.md')) {
      const id = token.href.split('#')[1];

      // if ref exists in online ref, use its index
      const onlineRefIndex = originalRefs.indexOf(r => r.id === id);
      if (onlineRefIndex > -1) {
        const displayIndex = String(onlineRefIndex + 1)
        token.text = token.tokens[0].text = displayIndex;
        token.href = `#online-refs.md#${token.text}`;
        return;
      }

      // if ref not exists, add it as new online refs
      const refItem = originalRefs.find(r => r.id === id);
      if (!refItem) {
        console.error(`No ref item for "${id}"!`);
        return;
      }
      onlineRefs.push(refItem);
      const displayIndex = String(onlineRefs.length);
      token.text = token.tokens[0].text = displayIndex;
      token.href = `#online-refs.md#${token.text}`;
    }
  }
}
marked.use({ walkTokens });

const doc = readFiles();
const docHTML = marked(doc);

const onlieRefsText = onlineRefs
  .map((r, i) => `* [${i + 1}] [${r.title}](${r.url})`)
  .join('\n');
const onlineRefsFile = `
# 纸质版配套参考文献链接

${onlieRefsText}
`;

fs.writeFileSync('./part-all.html', docHTML);
fs.writeFileSync('./online-refs.md', onlineRefsFile);
