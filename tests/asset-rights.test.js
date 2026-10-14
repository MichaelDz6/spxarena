import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import prompts from '../research/portrait-generation-prompts.json' with { type: 'json' };
import profiles from '../src/data/investors.json' with { type: 'json' };
import images from '../src/data/portraits.json' with { type: 'json' };
import credits from '../src/data/portrait-credits.json' with { type: 'json' };
import companies from '../src/data/index-companies.json' with { type: 'json' };
import drawdowns from '../src/data/drawdowns.json' with { type: 'json' };

const publicFile = path => new URL(`../public${path}`, import.meta.url);
test('every shipped portrait has documented provenance, full resolution and a valid payload', async () => {
  assert.equal(Object.keys(credits).length, profiles.length);
  for (const profile of profiles) {
    const credit = credits[profile.key];
    assert.equal(images[profile.key], credit.path);
    assert.ok(credit.creator && credit.title && credit.source && credit.modifications);
    assert.notEqual(credit.type, 'placeholder');
    if (credit.type === 'generated') {
      assert.equal(credit.license, 'AI-generated usage notice');
      assert.equal(credit.licenseUrl, '/credits/#ai-portraits');
      assert.deepEqual(credit.referenceInputs, []);
      const prompt = prompts.find(p => p.key === profile.key);
      assert.equal(prompt.mode, 'generate');
      assert.deepEqual(prompt.referenceInputs, []);
      assert.ok(prompt.prompt.includes('do not recreate any published photograph'));
    } else {
      assert.match(credit.license, /^(CC BY(?:-SA)? [234]\.0|Public domain)$/);
      assert.match(credit.licenseUrl, /^https:\/\/(creativecommons\.org|commons\.wikimedia\.org)\//);
      assert.match(credit.source, /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      if (credit.type === 'enhanced') {
        const input = readFileSync(new URL(`../${credit.inputPath}`, import.meta.url));
        assert.equal(createHash('sha256').update(input).digest('hex'), credit.originalSha256);
        assert.equal(prompts.find(p => p.key === profile.key).mode, 'enhance');
        assert.match(credit.modifications, /AI-enhanced/);
      }
    }
    const bytes = readFileSync(publicFile(credit.path));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), credit.sha256);
    assert.equal(bytes.subarray(0, 4).toString(), 'RIFF');
    assert.equal(bytes.subarray(8, 12).toString(), 'WEBP');
    const image = await sharp(bytes).metadata();
    assert.equal(image.width, credit.width);
    assert.equal(image.height, credit.height);
    assert.ok(image.width >= 800 && image.height >= 800, `${profile.name} must have a full-resolution portrait`);
  }
  assert.deepEqual(new Set(readdirSync(publicFile('/portraits/'))), new Set(Object.values(images).map(path => path.split('/').at(-1))));
});
test('company tiles use original ticker artwork and unlicensed daily data is excluded', () => {
  for (const company of companies.companies.filter(company => company.logo)) {
    assert.match(company.logo, /-ticker\.svg$/);
    assert.match(readFileSync(publicFile(`/company-logos/${company.logo}`), 'utf8'), /Original SPX Arena ticker tile; CC0 1.0/);
  }
  assert.deepEqual(drawdowns, {});
});
