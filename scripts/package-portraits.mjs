import sharp from 'sharp';
import { readFile, writeFile, readdir, mkdir, copyFile, unlink } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

// Encode completed ImageGen outputs and licensed originals for web delivery.
// This does not perform generative edits, rescale, or change their composition.
const root = resolve(import.meta.dirname, '..');
const readJson = async path => JSON.parse(await readFile(resolve(root, path), 'utf8'));
const writeJson = async (path, value) => writeFile(resolve(root, path), JSON.stringify(value, null, 2) + '\n');
const manifest = await readJson('research/portrait-generation-prompts.json');
const people = await readJson('src/data/investors.json');
const oldCredits = await readJson('src/data/portrait-credits.json');
const prior = await readJson('research/portrait-license-verification.json');
const baseCredits = prior.priorAssets || oldCredits;
const records = Object.fromEntries(manifest.map(record => [record.key, record]));
const assets = {};
const credits = {};
await mkdir(resolve(root, 'research/portrait-inputs'), { recursive: true });

// Validate every source before changing the approved inventory.
for (const person of people) {
  const record = records[person.key];
  const old = oldCredits[person.key];
  if (!record && old.type === 'placeholder') throw new Error(`Missing portrait: ${person.name}`);
  const source = record?.path || resolve(root, `public${old.path}`);
  const metadata = await sharp(source).metadata();
  if (metadata.width < 800 || metadata.height < 800) throw new Error(`Portrait too small: ${person.name}, ${metadata.width}×${metadata.height}`);
}
for (const person of people) {
  const key = person.key;
  const record = records[key];
  const old = baseCredits[key];
  const current = oldCredits[key];
  const source = record?.path || resolve(root, `public${current.path}`);
  const generated = record?.mode === 'generate';
  const enhanced = record?.mode === 'enhance';
  const path = `/portraits/${key}-${generated ? 'illustrated' : enhanced ? 'enhanced' : 'licensed'}.webp`;
  let credit;
  if (generated) {
    credit = {
      path,
      title: `${person.name} — original AI editorial illustration`,
      creator: 'Created with AI for SPX Arena',
      source: '/credits/#ai-portraits',
      license: 'AI-generated usage notice',
      licenseUrl: '/credits/#ai-portraits',
      modifications: 'Generated from a text prompt without third-party image inputs; interpretive likeness. Encoded as WebP for web delivery.',
      verifiedOn: '2026-10-13',
      type: 'generated',
      attribution: '',
      referenceInputs: [],
      promptRecord: `research/portrait-generation-prompts.json#${key}`,
    };
  } else {
    credit = {
      ...old,
      path,
      type: enhanced ? 'enhanced' : 'photo',
      title: `${old.title}${enhanced ? ' — AI-enhanced adaptation' : ''}`,
      modifications: `${enhanced ? 'AI-enhanced resolution and clarity; profile crop as recorded in the edit prompt. ' : ''}Encoded as WebP; displayed in grayscale with a CSS crop.`,
      referenceInputs: enhanced ? [old.source] : [],
      ...(enhanced ? { promptRecord: `research/portrait-generation-prompts.json#${key}`, originalSha256: old.sha256 } : {}),
    };
    // Retain the exact licensed source used for enhancements as private evidence.
    if (enhanced) {
      const inputPath = current.inputPath || `research/portrait-inputs/${key}-licensed.${current.path.split('.').at(-1)}`;
      if (!current.inputPath) await copyFile(resolve(root, `public${current.path}`), resolve(root, inputPath));
      const input = await readFile(resolve(root, inputPath));
      credit.inputPath = inputPath;
      credit.originalSha256 = createHash('sha256').update(input).digest('hex');
    }
  }
  const buffer = await sharp(source).keepMetadata().webp({ quality: 92, effort: 6 }).toBuffer();
  const dimensions = await sharp(buffer).metadata();
  await writeFile(resolve(root, `public${path}`), buffer);
  Object.assign(credit, {
    width: dimensions.width,
    height: dimensions.height,
    bytes: buffer.length,
    sha256: createHash('sha256').update(buffer).digest('hex'),
  });
  credits[key] = credit;
  assets[key] = path;
  person.photoCredit = generated ? '/credits/#ai-portraits' : old.source;
}
await writeJson('src/data/portraits.json', assets);
await writeJson('src/data/portrait-credits.json', credits);
await writeJson('src/data/investors.json', people);
await writeJson('research/portrait-license-verification.json', {
  ...prior,
  assets: credits,
  priorAssets: baseCredits,
  generationTool: 'Built-in ImageGen',
  generationManifest: 'research/portrait-generation-prompts.json',
});
const keep = new Set(Object.values(assets).map(path => path.split('/').at(-1)));
for (const file of await readdir(resolve(root, 'public/portraits'))) {
  if (!keep.has(file)) await unlink(resolve(root, 'public/portraits', file));
}
console.log(`Packaged ${people.length} full-resolution portraits: ${Object.values(credits).filter(c => c.type === 'generated').length} original illustrations, ${Object.values(credits).filter(c => c.type === 'enhanced').length} licensed enhancements, ${Object.values(credits).filter(c => c.type === 'photo').length} licensed photos.`);
