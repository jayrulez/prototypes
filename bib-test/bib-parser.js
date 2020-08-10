
const regs = {
  titleAndId: new RegExp(/([^@^\{]+)\{([^,]+)/m),
  // https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url
  url: new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/),
  brace: new RegExp(/\{|\}/g),
  quote: new RegExp(/["]+/g)
};
const trimFilterSplit = (str, separator) =>
  str.split(separator).map(s => s.trim()).filter(s => s.length);

const parseBib = (src) => {
  const lines = src.split('\n');
  const resetState = () => ({
    type: null,
    id: null,
  });

  const entries = [];
  let count = 0;
  let state = resetState();

  for (const [i, line] of lines.entries()) {
    const trimedLine = line.trim();

    // empty line
    if (trimedLine.replace(/\s+/, '').length === 0) {
      continue;
    }

    // begin entry
    if (trimedLine[0] === '@') {
      if (entries.length > 0 && state !== entries[entries.length - 1]) {
        throw new Error(`Unmatched entry before line ${i + 1}`)
      }

      count++;
      state = resetState();
      trimedLine.replace(regs.titleAndId, '');
      state.type = RegExp.$1.trim();
      state.id = RegExp.$2.trim();
      if (!state.id) {
        throw new Error(`Missing id at line ${i + 1}`);
      }
    }
    // content lines
    else if (trimedLine.includes('=')) {
      const pair = trimFilterSplit(trimedLine, /=\W/);
      if (pair.length <= 1 || pair.length > 2) {
        throw new Error(`Invalid pair at line ${i + 1}`);
      }
      const key = pair[0].toLowerCase();
      let val = pair[1]
        .replace(regs.brace, '')
        .replace(regs.quote, "")
        .replace(/\,$/, ''); // trailing comma
      if (key.includes('url') && key !== 'urlprefix') {
        const match = val.match(regs.url);
        if (match) {
          val = val.match(regs.url)[0];
        }
      }
      state[key] = val.trim();
    }
    // end entry
    else if (trimedLine[0] === '}') {
      // redundant right brace detected
      if (state === entries[entries.length - 1]) {
        throw new Error(`Unmatched entry brace at line ${i + 1}`);
      }
      entries.push(state);
    }
  }

  if (count !== entries.length) {
    throw new Error(`Error parsing, expect ${count} entries, got ${entries.length}`);
  }

  return entries;
};

module.exports = {
  parseBib
};
