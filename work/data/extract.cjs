const fs = require('fs');
const html = fs.readFileSync('work/data/mard.html', 'utf8');
// RSC payload: {\"id\":\"MARD:A1\",\"name\":\"A1\",\"hex\":\"#F9F0CD\",...,\"series\":\"A\"}
const re = /\\"id\\":\\"(MARD:([A-Z]+)([0-9]+))\\"/g;
const hits = [];
let m;
while ((m = re.exec(html))) {
  const start = m.index;
  const seg = html.slice(start, start + 400);
  const hex = (seg.match(/\\"hex\\":\\"(#[0-9A-Fa-f]{6})\\"/) || [])[1];
  const series = (seg.match(/\\"series\\":\\"([A-Z]+)\\"/) || [])[1];
  const name = (seg.match(/\\"name\\":\\"([^"\\]+)\\"/) || [])[1];
  hits.push({ id: m[1], code: m[1].replace('MARD:', ''), series, hex, name });
}
console.log('hits', hits.length);
const seen = new Map();
for (const h of hits) if (!seen.has(h.id)) seen.set(h.id, h);
console.log('unique', seen.size);
const by = {};
for (const h of [...seen.values()]) (by[h.series] ||= []).push(h.code);
for (const k of Object.keys(by).sort()) console.log(k, by[k].length, by[k].sort((a,b)=>parseInt(a.slice(k.length))-parseInt(b.slice(k.length))).join(','));
console.log('missing hex', [...seen.values()].filter(h=>!h.hex).map(h=>h.code));
console.log('standard', ['A','B','C','D','E','F','G','H','M'].reduce((a,k)=>a+(by[k]||[]).length,0));
