import { useEffect, useId, useRef, useState } from 'react';
import {
  closeTopLayerDialog,
  isPointerOutsideElement,
  waitForSubtreeAnimations,
} from '../../tools/topLayer';
import { CloseIcon } from '../icons';
import type { ModalProps, ModalSize } from './Modal.types';
import styles from './Modal.module.css';

const SIZE_CLASS: Record<ModalSize, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
  xl: styles.sizeXl,
  unstyled: styles.sizeUnstyled,
};

export function Modal({
  isOpen,
  onClose,
  onAfterClose,
  size = 'md',
  title,
  subtitle,
  ariaLabel,
  footer,
  showCloseButton = true,
  isBusy = false,
  closedBy = 'any',
  bodyClassName,
  className,
  children,
}: ModalProps) {
  const [isDialogRendered, setIsDialogRendered] = useState(isOpen);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const pressedOutsideRef = useRef(false);
  const hasOpenedRef = useRef(isOpen);

  const isOpenRef = useRef(isOpen);
  const isBusyRef = useRef(isBusy);
  const onCloseRef = useRef(onClose);
  const onAfterCloseRef = useRef(onAfterClose);

  const headingId = useId();

  useEffect(() => {
    isOpenRef.current = isOpen;
    isBusyRef.current = isBusy;
    onCloseRef.current = onClose;
    onAfterCloseRef.current = onAfterClose;
  });

  // Synchronize open/close transitions with native `<dialog>` top-layer lifecycle
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    let cancelled = false;
    let rafId: number | null = null;

    if (isOpen) {
      hasOpenedRef.current = true;
      dialog.removeAttribute('data-closing');
      if (!dialog.open) {
        dialog.showModal();
      }
      rafId = requestAnimationFrame(() => {
        if (!cancelled) {
          setIsDialogRendered(true);
        }
      });
    } else if (dialog.open) {
      void closeTopLayerDialog(dialog).then(() => {
        if (cancelled) return;
        hasOpenedRef.current = false;
        setIsDialogRendered(false);
        onAfterCloseRef.current?.();
      });
    } else if (hasOpenedRef.current) {
      void waitForSubtreeAnimations(dialog).then(() => {
        if (cancelled) return;
        hasOpenedRef.current = false;
        setIsDialogRendered(false);
        onAfterCloseRef.current?.();
      });
    }

    return () => {
      cancelled = true;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [isOpen]);

  // Handle Escape, native light-dismiss, and pointerdown/pointerup fallback for Safari
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (event: Event) => {
      event.preventDefault();
      if (!isBusyRef.current) {
        onCloseRef.current();
      }
    };

    const handleClose = () => {
      if (isOpenRef.current) {
        onCloseRef.current();
      }
    };

    const supportsClosedBy = 'closedBy' in HTMLDialogElement.prototype;

    const handlePointerDown = (event: PointerEvent) => {
      if (supportsClosedBy || !dialog.open || closedBy !== 'any') {
        pressedOutsideRef.current = false;
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target?.closest('[popover]')) {
        pressedOutsideRef.current = false;
        return;
      }
      pressedOutsideRef.current = isPointerOutsideElement(event, dialog);
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (supportsClosedBy || !dialog.open || closedBy !== 'any') return;
      const wasOutside = pressedOutsideRef.current;
      pressedOutsideRef.current = false;
      if (wasOutside && isPointerOutsideElement(event, dialog) && !isBusyRef.current) {
        onCloseRef.current();
      }
    };

    dialog.addEventListener('cancel', handleCancel);
    dialog.addEventListener('close', handleClose);
    if (!supportsClosedBy) {
      dialog.addEventListener('pointerdown', handlePointerDown);
      dialog.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      dialog.removeEventListener('cancel', handleCancel);
      dialog.removeEventListener('close', handleClose);
      if (!supportsClosedBy) {
        dialog.removeEventListener('pointerdown', handlePointerDown);
        dialog.removeEventListener('pointerup', handlePointerUp);
      }
    };
  }, [closedBy]);

  const shouldRenderContent = isOpen || isDialogRendered;
  const isUnstyled = size === 'unstyled';
  const dialogAttrs = {
    closedby: isBusy ? 'none' : closedBy,
  } as Record<string, string>;

  const dialogClasses = [
    styles.dialog,
    isUnstyled ? '' : styles.dialogStyled,
    SIZE_CLASS[size],
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleRequestClose = () => {
    if (!isBusy) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className={dialogClasses}
      aria-labelledby={title !== undefined ? headingId : undefined}
      aria-label={title === undefined ? ariaLabel : undefined}
      {...dialogAttrs}
    >
      {shouldRenderContent &&
        (isUnstyled ? (
          children
        ) : (
          <div className={styles.shell}>
            {title !== undefined && (
              <div className={styles.header}>
                <div className={styles.titleGroup}>
                  <h2 id={headingId} className={styles.title}>
                    {title}
                  </h2>
                  {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                </div>
                {showCloseButton && (
                  <button
                    type="button"
                    className={styles.closeBtn}
                    onClick={handleRequestClose}
                    disabled={isBusy}
                    aria-label="Закрити"
                  >
                    <CloseIcon size={16} aria-hidden="true" />
                  </button>
                )}
              </div>
            )}

            <div className={`${styles.body} ${bodyClassName ?? ''}`}>{children}</div>

            {footer && <div className={styles.footer}>{footer}</div>}
          </div>
        ))}
    </dialog>
  );
}
