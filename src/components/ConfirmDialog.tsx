import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'primary' | 'danger' | 'urgent' | 'success';
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
  confirmDisabled?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  tone = 'primary',
  onConfirm,
  onCancel,
  children,
  confirmDisabled = false
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open ?
      <motion.div
        className="absolute inset-0 z-40 flex items-end justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}>
        
          <button
          type="button"
          aria-label="Dismiss"
          onClick={onCancel}
          className="absolute inset-0 bg-black/50" />
        
          <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 16, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          className="relative w-full rounded-t-2xl border-t border-line bg-surface p-5 pb-6 shadow-lift">
          
            <h2 className="text-xl font-bold tracking-[-0.02em] text-ink">{title}</h2>
            {description ?
          <div className="mt-2 text-[15px] leading-relaxed text-muted">{description}</div> :
          null}
            {children ? <div className="mt-4">{children}</div> : null}
            <div className="mt-5 space-y-2.5">
              <Button variant={tone} size="lg" onClick={onConfirm} disabled={confirmDisabled}>
                {confirmLabel}
              </Button>
              <Button variant="secondary" size="lg" onClick={onCancel}>
                {cancelLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div> :
      null}
    </AnimatePresence>);

}