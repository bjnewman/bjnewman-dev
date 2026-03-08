export const IRIS_DURATION_MS = 800;

export function setIrisCenter(x: number, y: number, direction: 'enter' | 'exit') {
  document.documentElement.setAttribute('data-iris-x', String(Math.round(x)));
  document.documentElement.setAttribute('data-iris-y', String(Math.round(y)));
  document.documentElement.setAttribute('data-iris-direction', direction);
}

export function initIrisTransition() {
  document.addEventListener('astro:before-swap', ((e: Event) => {
    const swapEvent = e as Event & { viewTransition?: { ready: Promise<void> } };
    const root = document.documentElement;
    const xAttr = root.getAttribute('data-iris-x');
    const yAttr = root.getAttribute('data-iris-y');
    const direction = root.getAttribute('data-iris-direction');
    if (!xAttr || !yAttr || !direction) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const x = parseInt(xAttr, 10);
    const y = parseInt(yAttr, 10);
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    // Clear attributes so they don't affect subsequent navigations
    root.removeAttribute('data-iris-x');
    root.removeAttribute('data-iris-y');
    root.removeAttribute('data-iris-direction');

    const viewTransition = swapEvent.viewTransition;
    if (!viewTransition) return;

    const isEnter = direction === 'enter';

    viewTransition.ready.then(() => {
      // Iris-close on old page (shrink circle to point)
      document.documentElement.animate(
        {
          clipPath: isEnter
            ? [`circle(${maxRadius}px at ${x}px ${y}px)`, `circle(0px at ${x}px ${y}px)`]
            : [`circle(${maxRadius}px at ${x}px ${y}px)`, `circle(0px at ${x}px ${y}px)`],
        },
        {
          duration: IRIS_DURATION_MS,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-old(root)',
        },
      );
      // Fade-in new page (hold black, then reveal)
      document.documentElement.animate(
        { opacity: ['0', '0', '1'] },
        {
          duration: IRIS_DURATION_MS,
          easing: 'ease-out',
          pseudoElement: '::view-transition-new(root)',
        },
      );
    });
  }) as EventListener);
}
