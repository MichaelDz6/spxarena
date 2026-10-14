// Keep import failures visible instead of leaving a static result and dead controls.
export async function loadCalculator(root, loadModule) {
  const controls = root.querySelectorAll('button, input');
  const disabledBeforeLoad = new Set(
    [...controls].filter((control) => control.disabled),
  );
  root.dataset.calculatorState = 'loading';
  root.setAttribute('aria-busy', 'true');
  controls.forEach((control) => {
    control.disabled = true;
  });
  try {
    const { initializeCalculator } = await loadModule();
    // The controller sets mode-specific disabled states during initialization.
    controls.forEach((control) => {
      control.disabled = disabledBeforeLoad.has(control);
    });
    initializeCalculator(root);
    root.dataset.calculatorState = 'ready';
  } catch (error) {
    root.dataset.calculatorState = 'failed';
    controls.forEach((control) => {
      control.disabled = true;
    });
    root.querySelector('[data-calc-content]').hidden = true;
    root.querySelector('[data-calc-empty]').hidden = true;
    root.querySelector('[data-calculator-load-error]').hidden = false;
    root.querySelector('[data-calculator-retry]').href =
      root.ownerDocument.location.href;
    console.error('Unable to initialize the investment calculator.', error);
  } finally {
    root.setAttribute('aria-busy', 'false');
  }
}
