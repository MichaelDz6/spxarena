import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

// Re-encode only approved, source-backed photo enhancements. No generated likenesses.
const root = resolve(import.meta.dirname, '..');
const readJson = async path => JSON.parse(await readFile(resolve(root, path), 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const manifest = await readJson('research/portrait-photo-enhancement-prompts.json');
const credits = await readJson('src/data/portrait-credits.json');
if (manifest.some(record => record.mode !== 'enhance')) throw new Error('Only photographic enhancement records are allowed.');
const prepared = [];
for (const record of manifest) {
  const credit = credits[record.key];
  if (!credit || credit.type === 'pending') continue;
  if (credit.type !== 'enhanced' || !credit.inputPath || !credit.source.startsWith('https:')) {
    throw new Error(`Missing approved photo provenance: ${record.key}`);
  }
  const input = await readFile(resolve(root, credit.inputPath));
  if (hash(input) !== credit.originalSha256) throw new Error(`Licensed input changed: ${record.key}`);
  const image = sharp(record.path);
  const dimensions = await image.metadata();
  if (dimensions.width < 800 || dimensions.height < 800) throw new Error(`Enhancement too small: ${record.key}`);
  const bytes = await image.keepMetadata().webp({ quality: 92, effort: 6 }).toBuffer();
  prepared.push({ credit, bytes, dimensions });
}
for (const { credit, bytes, dimensions } of prepared) {
  await writeFile(resolve(root, `public${credit.path}`), bytes);
  Object.assign(credit, { width: dimensions.width, height: dimensions.height, bytes: bytes.length, sha256: hash(bytes) });
}
await writeFile(resolve(root, 'src/data/portrait-credits.json'), JSON.stringify(credits, null, 2) + '\n');
const verification = await readJson('research/portrait-license-verification.json');
verification.assets = credits;
await writeFile(resolve(root, 'research/portrait-license-verification.json'), JSON.stringify(verification, null, 2) + '\n');
console.log(`Encoded ${prepared.length} approved photo enhancements.`);
