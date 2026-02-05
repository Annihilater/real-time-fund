'use client';

import { ModalCard, ModalOverlay } from '../common/Modal';
import { TrashIcon } from '../common/icons';

export default function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <ModalOverlay ariaLabel="删除确认" onClose={onCancel} zIndex={10002}>
      <ModalCard style={{ maxWidth: '400px' }}>
        <div className="title" style={{ marginBottom: 12 }}>
          <TrashIcon width="20" height="20" className="danger" />
          <span>{title}</span>
        </div>
        <p className="muted" style={{ marginBottom: 24, fontSize: '14px', lineHeight: '1.6' }}>
          {message}
        </p>
        <div className="row" style={{ gap: 12 }}>
          <button className="button secondary" onClick={onCancel} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'var(--text)' }}>取消</button>
          <button className="button danger" onClick={onConfirm} style={{ flex: 1 }}>确定删除</button>
        </div>
      </ModalCard>
    </ModalOverlay>
  );
}
