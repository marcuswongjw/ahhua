import fs from 'node:fs';

const menu = JSON.parse(fs.readFileSync('data/generated_menu.json', 'utf8'));
let domainSrc = fs.readFileSync('src/domain.js', 'utf8');

// Replace menu
const beforeMenu = domainSrc.slice(0, domainSrc.indexOf('export const menu = ['));
const afterMenuIndex = domainSrc.indexOf('export const serviceTypes = {');
const afterMenu = domainSrc.slice(afterMenuIndex);

const newMenuCode = `// Authentic Nan Hwa Chong (南华昌) Fish Head Steamboat & Zi Char catalog\nexport const menu = ${JSON.stringify(menu, null, 2)};\n`;
let updated = beforeMenu + newMenuCode + afterMenu;

// Replace found matching with subsumption check
const oldFound = `  const found = menu.map(d => ({ d, at: Math.min(...d.aliases.map(a=>aliasIndex(t,a)).filter(i=>i>=0), Infinity) })).filter(x=>Number.isFinite(x.at));
  // Specific steamboat names take precedence over the generic word “steamboat”.
  const matches = found.filter(x=>x.d.id !== 'grouper' || !found.some(y=>['pomfret','snapper'].includes(y.d.id)) || /grouper|石斑/.test(t)).sort((a,b)=>a.at-b.at);`;

const newFound = `  const found = [];
  for (const d of menu) {
    let bestAt = Infinity;
    let bestLen = 0;
    for (const a of d.aliases) {
      const idx = aliasIndex(t, a);
      if (idx >= 0 && (idx < bestAt || (idx === bestAt && a.length > bestLen))) {
        bestAt = idx;
        bestLen = a.length;
      }
    }
    if (Number.isFinite(bestAt)) {
      found.push({ d, at: bestAt, end: bestAt + bestLen });
    }
  }
  const nonSubsumed = found.filter(m => !found.some(o => o.d.id !== m.d.id && o.at <= m.at && o.end >= m.end && (o.end - o.at > m.end - m.at)));
  const matches = nonSubsumed.filter(x => x.d.id !== 'grouper' || !nonSubsumed.some(y => ['pomfret', 'snapper'].includes(y.d.id)) || /grouper|石斑/.test(t)).sort((a, b) => a.at - b.at);`;

if (!updated.includes(oldFound)) {
  console.error('Could not find oldFound!');
  process.exit(1);
}
updated = updated.replace(oldFound, newFound);
fs.writeFileSync('src/domain.js', updated);
console.log('Successfully updated src/domain.js with menu & subsumption matching!');
