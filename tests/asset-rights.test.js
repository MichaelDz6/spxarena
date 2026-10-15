import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import prompts from '../research/portrait-photo-enhancement-prompts.json' with { type: 'json' };
import profiles from '../src/data/investors.json' with { type: 'json' };
import images from '../src/data/portraits.json' with { type: 'json' };
import credits from '../src/data/portrait-credits.json' with { type: 'json' };
import companies from '../src/data/index-companies.json' with { type: 'json' };
import drawdowns from '../src/data/drawdowns.json' with { type: 'json' };

const publicFile = path => new URL(`../public${path}`, import.meta.url);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
test('only licensed original color photos are published; unresolved rights never fall back to generated faces', async () => {
  assert.equal(Object.keys(credits).length, profiles.length);
  assert.ok(prompts.every(prompt => prompt.mode === 'enhance'));
  for (const profile of profiles) {
    const credit = credits[profile.key];
    assert.equal(images[profile.key], credit.path);
    assert.ok(['photo', 'enhanced', 'pending'].includes(credit.type));
    if (credit.type === 'pending') {
      assert.equal(credit.path, null);
      assert.equal(credit.sha256, null);
      assert.equal(credit.license, 'Not published');
      continue;
    }
    assert.ok(credit.creator && credit.title && credit.source && credit.modifications);
    assert.match(credit.license, /^(CC BY(?:-SA)? [234]\.0|Public domain|CC0 1\.0)$/);
    assert.match(credit.licenseUrl, /^https:\/\/(creativecommons\.org|commons\.wikimedia\.org)\//);
    assert.match(credit.source, /^https:\/\/(commons\.wikimedia\.org\/wiki\/File:|www\.bridgespan\.org\/insights\/)/);
    assert.equal(credit.color, true);
    if (credit.type === 'enhanced') {
      const input = readFileSync(new URL(`../${credit.inputPath}`, import.meta.url));
      assert.equal(hash(input), credit.originalSha256);
      assert.equal(prompts.find(p => p.key === profile.key).mode, 'enhance');
      assert.ok(credit.referenceInputs.length > 0);
      assert.match(credit.modifications, /AI[ -](?:enhanced|upscaled)/);
    }
    const bytes = readFileSync(publicFile(credit.path));
    assert.equal(hash(bytes), credit.sha256);
    const image = await sharp(bytes).metadata();
    assert.equal(image.format, 'webp');
    assert.equal(image.width, credit.width);
    assert.equal(image.height, credit.height);
    assert.ok(image.width >= 800 && image.height >= 800, `${profile.name} must have a full-resolution portrait`);
    const stats = await sharp(bytes).removeAlpha().stats();
    const means = stats.channels.slice(0, 3).map(channel => channel.mean);
    assert.ok(Math.max(...means) - Math.min(...means) > 1, `${profile.name} must retain photographic color`);
  }
  assert.deepEqual(new Set(readdirSync(publicFile('/portraits/'))), new Set(Object.values(images).filter(Boolean).map(path => path.split('/').at(-1))));
});
test('company tiles use original ticker artwork and unlicensed daily data is excluded', () => {
  for (const company of companies.companies.filter(company => company.logo)) {
    assert.match(company.logo, /-ticker\.svg$/);
    assert.match(readFileSync(publicFile(`/company-logos/${company.logo}`), 'utf8'), /Original SPX Arena ticker tile; CC0 1.0/);
  }
  assert.deepEqual(drawdowns, {});
});
