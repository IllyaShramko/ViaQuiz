let supportsDisplayTransition: boolean | undefined;

/**
 * Probes whether the browser genuinely transitions `display: none` with `allow-discrete`.
 * Some browsers parse `transition-behavior: allow-discrete` yet apply `display: none` immediately.
 */
export function canTransitionDisplay(): boolean {
  if (supportsDisplayTransition !== undefined) {
    return supportsDisplayTransition;
  }

  if (
    typeof window === 'undefined' ||
    !window.CSS?.supports?.('transition-behavior', 'allow-discrete') ||
    !document.body
  ) {
    return false;
  }

  const probe = document.createElement('div');
  probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block;';
  document.body.appendChild(probe);
  void getComputedStyle(probe).display;
  probe.style.display = 'none';
  supportsDisplayTransition = getComputedStyle(probe).display === 'block';
  probe.remove();

  return supportsDisplayTransition;
}

export function supportsTopLayerExit(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.CSS?.supports?.('overlay', 'auto')) && canTransitionDisplay();
}

export async function waitForSubtreeAnimations(element: HTMLElement): Promise<void> {
  if (typeof element.getAnimations !== 'function') return;
  const animations = element.getAnimations({ subtree: true });
  if (animations.length === 0) return;

  await Promise.race([
    Promise.allSettled(animations.map((animation) => animation.finished)),
    new Promise<void>((resolve) => setTimeout(resolve, 600)),
  ]);
}

export function isPointerOutsideElement(
  event: Pick<PointerEvent, 'clientX' | 'clientY'>,
  element: HTMLElement,
): boolean {
  const rect = element.getBoundingClientRect();
  return (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  );
}

/**
 * Closes a modal `<dialog>` while allowing exit transitions to finish across browsers.
 */
export async function closeTopLayerDialog(dialog: HTMLDialogElement): Promise<void> {
  if (!dialog.open) return;

  if (!supportsTopLayerExit()) {
    dialog.setAttribute('data-closing', '');
    await waitForSubtreeAnimations(dialog);
    if (!dialog.hasAttribute('data-closing')) return;
    dialog.removeAttribute('data-closing');
    if (dialog.open) {
      dialog.close();
    }
    return;
  }

  dialog.close();
  await waitForSubtreeAnimations(dialog);
}

/**
 * Closes a `[popover]` element while preserving exit animations on browsers without top-layer exit.
 */
export async function closeTopLayerPopover(popover: HTMLElement): Promise<void> {
  if (!popover.matches(':popover-open')) return;

  if (!supportsTopLayerExit()) {
    popover.setAttribute('data-closing', '');
    await waitForSubtreeAnimations(popover);
    if (!popover.hasAttribute('data-closing')) return;
    popover.removeAttribute('data-closing');
    if (popover.matches(':popover-open')) {
      popover.hidePopover();
    }
    return;
  }

  popover.hidePopover();
}

/**
 * Ensures `popover="hint"` falls back to `popover="auto"` when `"hint"` is unsupported,
 * so clicking or pressing Esc can still dismiss a toggletip.
 */
export function ensureHintPopoverFallback(popover: HTMLElement): () => void {
  const probe = document.createElement('div') as HTMLElement & { popover?: string };
  probe.popover = 'hint';
  if (probe.popover === 'hint') {
    return () => {};
  }

  const handleBeforeToggle = (event: Event) => {
    const toggleEvent = event as ToggleEvent;
    if (toggleEvent.newState === 'open' && popover.getAttribute('popover') === 'hint') {
      popover.setAttribute('popover', 'auto');
    }
  };

  popover.addEventListener('beforetoggle', handleBeforeToggle);
  return () => popover.removeEventListener('beforetoggle', handleBeforeToggle);
}
