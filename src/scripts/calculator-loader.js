import { loadCalculator } from '../lib/calculator-loader.js';

const root = document.querySelector('[data-page="calculator"]');
if (root) loadCalculator(root, () => import('./calculator.js'));
