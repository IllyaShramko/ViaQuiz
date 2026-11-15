import { useEffect, useId, useRef, useState } from 'react';
import {
  BinIcon,
  LogoIcon,
  UploadIcon,
  closeTopLayerPopover,
  ensureHintPopoverFallback,
} from '../../../../shared';
import type { QuizCoverFieldProps } from './QuizCoverField.types';
import styles from './QuizCoverField.module.css';

export function QuizCoverField({
  coverImg,
  isUploading,
  uploadError,
  onUploadFile,
  onRemoveCover,
}: QuizCoverFieldProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isHintOpen, setIsHintOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const hintTriggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const closeDelayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const popoverId = useId();
  const errorId = useId();

  const clearCloseDelay = () => {
    if (closeDelayTimerRef.current !== null) {
      clearTimeout(closeDelayTimerRef.current);
      closeDelayTimerRef.current = null;
    }
  };

  // Position fallback for browsers without native CSS Anchor Positioning (`position-area`)
  const syncFallbackCoordinates = () => {
    const trigger = hintTriggerRef.current;
    const popover = popoverRef.current;
    if (!trigger || !popover) return;
    if (
      typeof window.CSS?.supports === 'function' &&
      window.CSS.supports('(anchor-name: --a) and (position-area: block-end)')
    ) {
      return;
    }

    const triggerRect = trigger.getBoundingClientRect();
    const viewportPadding = 12;
    const popoverWidth = Math.min(352, window.innerWidth - viewportPadding * 2);
    const estimatedHeight = popover.offsetHeight || 200;

    let left = triggerRect.left;
    if (left + popoverWidth > window.innerWidth - viewportPadding) {
      left = window.innerWidth - popoverWidth - viewportPadding;
    }
    left = Math.max(viewportPadding, left);

    let top = triggerRect.bottom + 8;
    if (top + estimatedHeight > window.innerHeight - viewportPadding) {
      const aboveTop = triggerRect.top - estimatedHeight - 8;
      if (aboveTop >= viewportPadding) {
        top = aboveTop;
      }
    }

    popover.style.setProperty('--popover-top', `${Math.round(top)}px`);
    popover.style.setProperty('--popover-left', `${Math.round(left)}px`);
  };

  const openHintPopover = () => {
    clearCloseDelay();
    const trigger = hintTriggerRef.current;
    const popover = popoverRef.current;
    if (!popover || typeof popover.showPopover !== 'function') return;

    popover.removeAttribute('data-closing');
    syncFallbackCoordinates();
    if (!popover.matches(':popover-open')) {
      // Pass `source` so hover/focus fallback preserves the implicit anchor for CSS Anchor Positioning
      const showWithSource = popover.showPopover as (options?: { source?: HTMLElement }) => void;
      try {
        showWithSource.call(popover, trigger ? { source: trigger } : undefined);
      } catch {
        popover.showPopover();
      }
    }
  };

  const scheduleCloseHintPopover = (delayMs = 150) => {
    clearCloseDelay();
    closeDelayTimerRef.current = setTimeout(() => {
      const popover = popoverRef.current;
      if (popover && popover.matches(':popover-open')) {
        void closeTopLayerPopover(popover);
      }
    }, delayMs);
  };

  useEffect(() => {
    const popover = popoverRef.current;
    if (!popover) return;

    const cleanupHintFallback = ensureHintPopoverFallback(popover);

    const handleBeforeToggle = (event: Event) => {
      const toggleEvent = event as ToggleEvent;
      if (toggleEvent.newState === 'open') {
        popover.removeAttribute('data-closing');
        syncFallbackCoordinates();
      }
    };

    const handleToggle = (event: Event) => {
      const toggleEvent = event as ToggleEvent;
      const opening = toggleEvent.newState === 'open';
      if (opening) {
        syncFallbackCoordinates();
      }
      setIsHintOpen(opening);
    };

    popover.addEventListener('beforetoggle', handleBeforeToggle);
    popover.addEventListener('toggle', handleToggle);
    return () => {
      cleanupHintFallback();
      popover.removeEventListener('beforetoggle', handleBeforeToggle);
      popover.removeEventListener('toggle', handleToggle);
      clearCloseDelay();
    };
  }, []);

  const supportsNativeInterest =
    typeof HTMLButtonElement !== 'undefined' && 'interestForElement' in HTMLButtonElement.prototype;

  const handlePickFile = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUploadFile(file);
    }
    event.target.value = '';
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    if (isUploading) return;
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onUploadFile(file);
    }
  };

  const triggerProps = {
    interestfor: popoverId,
    popovertarget: popoverId,
    popovertargetaction: 'show',
  } as Record<string, string>;

  const popoverAttrs = {
    popover: 'hint',
  } as Record<string, string>;

  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <div className={styles.labelGroup}>
          <span className={styles.label}>Обкладинка вікторини</span>

          <button
            ref={hintTriggerRef}
            type="button"
            className={styles.hintTrigger}
            aria-label="Переглянути, як обкладинка виглядає у форматах 16:9 та 1:1"
            aria-expanded={isHintOpen}
            aria-controls={popoverId}
            onClick={() => {
              clearCloseDelay();
              popoverRef.current?.removeAttribute('data-closing');
              // Let native `popovertargetaction="show"` open with invoker anchoring; fall back only if unsupported
              if (!('popoverTargetElement' in HTMLButtonElement.prototype)) {
                openHintPopover();
              }
            }}
            onMouseEnter={() => {
              if (!supportsNativeInterest) openHintPopover();
            }}
            onMouseLeave={() => {
              if (!supportsNativeInterest) scheduleCloseHintPopover(160);
            }}
            onFocus={() => {
              if (!supportsNativeInterest) openHintPopover();
            }}
            onBlur={(event) => {
              if (supportsNativeInterest) return;
              const nextFocus = event.relatedTarget as Node | null;
              if (nextFocus && popoverRef.current?.contains(nextFocus)) return;
              scheduleCloseHintPopover(120);
            }}
            {...triggerProps}
          >
            ?
          </button>

          <div
            ref={popoverRef}
            id={popoverId}
            role="tooltip"
            className={styles.hintPopover}
            onMouseEnter={() => {
              if (!supportsNativeInterest) clearCloseDelay();
            }}
            onMouseLeave={() => {
              if (!supportsNativeInterest) scheduleCloseHintPopover(140);
            }}
            {...popoverAttrs}
          >
            <div className={styles.popoverHeader}>
              <span className={styles.popoverTitle}>Прев&apos;ю на сторінках сайту</span>
              <span className={styles.popoverSub}>object-fit: cover</span>
            </div>

            <div className={styles.previewGrid}>
              <div className={styles.previewItem}>
                <div className={`${styles.previewFrame} ${styles.previewFrameWide}`}>
                  {coverImg ? (
                    <img src={coverImg} alt="" className={styles.previewImg} />
                  ) : (
                    <div className={styles.previewPlaceholder}>
                      <LogoIcon size={22} />
                    </div>
                  )}
                </div>
                <span className={styles.previewCaption}>
                  <span className={styles.previewRatio}>16:9</span>
                  <span>· Картки та каталог</span>
                </span>
              </div>

              <div className={styles.previewItem}>
                <div className={`${styles.previewFrame} ${styles.previewFrameSquare}`}>
                  {coverImg ? (
                    <img src={coverImg} alt="" className={styles.previewImg} />
                  ) : (
                    <div className={styles.previewPlaceholder}>
                      <LogoIcon size={20} />
                    </div>
                  )}
                </div>
                <span className={styles.previewCaption}>
                  <span className={styles.previewRatio}>1:1</span>
                  <span>· Компактний</span>
                </span>
              </div>
            </div>

            <p className={styles.popoverNote}>
              {coverImg
                ? 'Перевірте, чи важливі деталі залишаються в центрі у вузькому форматі.'
                : 'Завантажте зображення, щоб перевірити обрізку в обох форматах.'}
            </p>
          </div>
        </div>

        <span className={styles.metaHint}>16:9 · до 5 МБ</span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className={styles.hiddenInput}
        onChange={handleFileChange}
        accept="image/png,image/jpeg,image/webp,image/gif"
        aria-describedby={uploadError ? errorId : undefined}
      />

      <div
        className={`${styles.coverRow} ${isDragOver ? styles.coverRowDragOver : ''}`}
        onDrop={handleDrop}
        onDragOver={(event) => {
          event.preventDefault();
          if (!isUploading) setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
      >
        <button
          type="button"
          className={`${styles.thumbButton} ${coverImg ? styles.thumbFilled : ''}`}
          onClick={handlePickFile}
          disabled={isUploading}
          aria-label={coverImg ? 'Змінити обкладинку вікторини' : 'Завантажити обкладинку вікторини'}
        >
          <span className={styles.thumbClip}>
            {coverImg ? (
              <>
                <img src={coverImg} alt="Обкладинка вікторини" className={styles.coverImage} />
                {!isUploading && (
                  <span className={styles.thumbHoverScrim} aria-hidden="true">
                    <UploadIcon size={15} />
                    <span>Змінити</span>
                  </span>
                )}
              </>
            ) : (
              <span className={styles.thumbPlaceholder}>
                <UploadIcon size={22} />
                <span>16:9</span>
              </span>
            )}

            {isUploading && (
              <span className={styles.thumbLoading}>
                <span className={styles.spinner} />
                <span>Завантаження...</span>
              </span>
            )}
          </span>
        </button>

        <div className={styles.controlsCol}>
          {coverImg ? (
            <>
              <div className={styles.controlsText}>
                <p className={styles.controlsTitle}>Обкладинка готова</p>
                <p className={styles.controlsDesc}>
                  Наведіть на «?», щоб перевірити, як кадр обрізається у 16:9 та 1:1.
                </p>
              </div>
              <div className={styles.actionsRow}>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={handlePickFile}
                  disabled={isUploading}
                >
                  <UploadIcon size={14} />
                  <span>Змінити</span>
                </button>
                <button
                  type="button"
                  className={`${styles.actionBtn} ${styles.removeBtn}`}
                  onClick={onRemoveCover}
                  disabled={isUploading}
                >
                  <BinIcon size={13} />
                  <span>Видалити</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className={styles.controlsText}>
                <p className={styles.controlsTitle}>Перетягніть файл або оберіть з пристрою</p>
                <p className={styles.controlsDesc}>PNG, JPG, WebP або GIF · рекомендовано 16:9</p>
              </div>
              <div className={styles.actionsRow}>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={handlePickFile}
                  disabled={isUploading}
                >
                  <UploadIcon size={14} />
                  <span>Обрати обкладинку</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {uploadError && (
        <p id={errorId} className={styles.uploadError} role="alert">
          {uploadError}
        </p>
      )}
    </div>
  );
}
