import { Modal } from './Modal'
import styles from './ConfirmDialog.module.css'

interface ConfirmDialogProps {
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Modal title="确认" onClose={onCancel} width={360}>
      <p className={styles.message}>{message}</p>
      <div className={styles.actions}>
        <button className={styles.cancel} onClick={onCancel}>取消</button>
        <button className={styles.confirm} onClick={onConfirm}>确认</button>
      </div>
    </Modal>
  )
}
