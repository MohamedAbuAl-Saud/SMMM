import confetti from 'canvas-confetti';

export function triggerConfetti(options?: confetti.Options) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  try {
    const testCanvas = document.createElement('canvas');
    if (!testCanvas || typeof testCanvas.getBoundingClientRect !== 'function') {
      return;
    }
    confetti(options);
  } catch (err) {
    console.warn('Confetti skipped:', err);
  }
}
