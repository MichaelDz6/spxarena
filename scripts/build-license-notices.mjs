import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Keep complete upstream notices for the framework and browser chart libraries.
const root = resolve(import.meta.dirname, '..');
const lock = JSON.parse(readFileSync(resolve(root, 'package-lock.json'), 'utf8'));
const notices = ['SPX Arena — third-party software notices\nGenerated from the installed locked dependencies. Upstream licenses apply to the respective packages, not to unrelated site content.'];
const missing = [];
for (const location of Object.keys(lock.packages).sort()) {
  if (!location.startsWith('node_modules/')) continue;
  const folder = resolve(root, location);
  if (!existsSync(resolve(folder, 'package.json'))) continue;
  const pkg = JSON.parse(readFileSync(resolve(folder, 'package.json'), 'utf8'));
  if (!(pkg.name === 'astro' || pkg.name.startsWith('d3-') || pkg.name === 'internmap')) continue;
  const files = readdirSync(folder, { withFileTypes: true }).filter(entry => entry.isFile() && /^(licen[cs]e|copying|notice|copyright)([.\-_]|$)/i.test(entry.name));
  notices.push(`\n${pkg.name} ${pkg.version}\nLicense identifier: ${pkg.license || 'See upstream files'}`);
  if (!files.length) missing.push(`${pkg.name} ${pkg.version}`);
  for (const file of files) notices.push(`\n${file.name}\n${readFileSync(resolve(folder, file.name), 'utf8')}`);
}
if (missing.length) {
  throw new Error(`Missing upstream license files: ${missing.join(', ')}`);
}
writeFileSync(resolve(root, 'public/third-party-notices.txt'), notices.join('\n') + '\n');
console.log('Wrote third-party software notices.');
