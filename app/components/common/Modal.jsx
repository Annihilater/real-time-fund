'use client';

import { motion } from 'framer-motion';

export function ModalOverlay({ ariaLabel, onClose, children, zIndex }) {
  const overlayProps = {
    className: 'modal-overlay',
    role: 'dialog',
    'aria-modal': 'true',
    onClick: onClose,
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  };

  if (ariaLabel) overlayProps['aria-label'] = ariaLabel;
  if (zIndex) overlayProps.style = { zIndex };

  return (
    <motion.div {...overlayProps}>
      {children}
    </motion.div>
  );
}

export function ModalCard({ children, className = '', style }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className={`glass card modal ${className}`.trim()}
      style={style}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </motion.div>
  );
}

export function SuccessMessage({ title, description, onClose, ctaLabel = '关闭' }) {
  return (
    <div className="success-message" style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{ fontSize: '48px', marginBottom: 16 }}>🎉</div>
      <h3 style={{ marginBottom: 8 }}>{title}</h3>
      <p className="muted">{description}</p>
      <button className="button" onClick={onClose} style={{ marginTop: 24, width: '100%' }}>
        {ctaLabel}
      </button>
    </div>
  );
}
