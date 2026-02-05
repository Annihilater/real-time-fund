'use client';

import { ModalCard, ModalOverlay, SuccessMessage } from '../common/Modal';

export default function SuccessModal({ message, onClose }) {
  return (
    <ModalOverlay ariaLabel="成功提示" onClose={onClose}>
      <ModalCard>
        <SuccessMessage
          title={message}
          description="操作已完成，您可以继续使用。"
          onClose={onClose}
        />
      </ModalCard>
    </ModalOverlay>
  );
}
