import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCalculator } from '../src/lib/calculator-loader.js';

function page() {
  const controls = [{ disabled: false }, { disabled: true }];
  const elements = {
    '[data-calc-content]': { hidden: false },
    '[data-calc-empty]': { hidden: true },
    '[data-calculator-load-error]': { hidden: true },
    '[data-calculator-retry]': { href: '/calculator/' },
  };
  const root = {
    dataset: {},
    ownerDocument: {
      location: { href: 'https://spxarena.com/calculator/?mode=goal' },
    },
    setAttribute(name, value) {
      this[name] = value;
    },
    querySelectorAll: () => controls,
    querySelector: (selector) => elements[selector],
  };
  return { root, controls, elements };
}

test('controls wait for the module, then initialization can set goal-specific states', async () => {
  const { root, controls } = page();
  let resolveModule;
  const loading = loadCalculator(
    root,
    () =>
      new Promise((resolve) => {
        resolveModule = resolve;
      }),
  );
  assert.equal(root.dataset.calculatorState, 'loading');
  assert.equal(root['aria-busy'], 'true');
  assert.ok(controls.every((control) => control.disabled));
  resolveModule({
    initializeCalculator: (element) => {
      assert.equal(element, root);
      assert.deepEqual(
        controls.map((control) => control.disabled),
        [false, true],
      );
      // Goal mode disables the monthly field and enables the target field.
      controls[0].disabled = true;
      controls[1].disabled = false;
    },
  });
  await loading;
  assert.equal(root.dataset.calculatorState, 'ready');
  assert.equal(root['aria-busy'], 'false');
  assert.deepEqual(
    controls.map((control) => control.disabled),
    [true, false],
  );
});

test('module and initialization failures replace stale results with a working retry path', async (t) => {
  t.mock.method(console, 'error', () => {});
  for (const load of [
    async () => {
      throw new Error('Chart dependency failed to load');
    },
    async () => ({
      initializeCalculator: () => {
        throw new Error('Initialization failed');
      },
    }),
  ]) {
    const { root, controls, elements } = page();
    await loadCalculator(root, load);
    assert.equal(root.dataset.calculatorState, 'failed');
    assert.equal(root['aria-busy'], 'false');
    assert.ok(controls.every((control) => control.disabled));
    assert.equal(elements['[data-calc-content]'].hidden, true);
    assert.equal(elements['[data-calculator-load-error]'].hidden, false);
    assert.equal(
      elements['[data-calculator-retry]'].href,
      root.ownerDocument.location.href,
    );
  }
});
