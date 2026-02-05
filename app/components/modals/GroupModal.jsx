'use client';

import { useState } from 'react';
import { ModalCard, ModalOverlay } from '../common/Modal';
import { CloseIcon, PlusIcon } from '../common/icons';

export default function GroupModal({ onClose, onConfirm }) {
  const [name, setName] = useState('');
  return (
    <ModalOverlay ariaLabel="新增分组" onClose={onClose}>
      <ModalCard style={{ maxWidth: '400px' }}>
        <div className="title" style={{ marginBottom: 20, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <PlusIcon width="20" height="20" />
            <span>新增分组</span>
          </div>
          <button className="icon-button" onClick={onClose} style={{ border: 'none', background: 'transparent' }}>
            <CloseIcon width="20" height="20" />
          </button>
        </div>
        <div className="form-group" style={{ marginBottom: 20 }}>
          <label className="muted" style={{ display: 'block', marginBottom: 8, fontSize: '14px' }}>分组名称（最多 8 个字）</label>
          <input
            className="input"
            autoFocus
            placeholder="请输入分组名称..."
            value={name}
            onChange={(e) => {
              const v = e.target.value || '';
              // 限制最多 8 个字符（兼容中英文），超出部分自动截断
              setName(v.slice(0, 8));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && name.trim()) onConfirm(name.trim());
            }}
          />
        </div>
        <div className="row" style={{ gap: 12 }}>
          <button className="button secondary" onClick={onClose} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'var(--text)' }}>取消</button>
          <button className="button" onClick={() => name.trim() && onConfirm(name.trim())} disabled={!name.trim()} style={{ flex: 1 }}>确定</button>
        </div>
      </ModalCard>
    </ModalOverlay>
  );
}
