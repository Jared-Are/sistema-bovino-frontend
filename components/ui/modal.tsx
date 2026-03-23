import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive' | 'warning';
  loading?: boolean;
  onConfirm?: () => void | Promise<void>;
}

export default function Modal({
  open,
  onOpenChange,
  title = "¿Está seguro?",
  description = "Esta acción no se puede deshacer.",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default",
  loading = false,
  onConfirm,
}: ModalProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'destructive':
        return {
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
          icon: <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />,
        };
      case 'warning':
        return {
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          icon: <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />,
        };
      default:
        return {
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
          icon: null,
        };
    }
  };

  const styles = getVariantStyles();

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    onOpenChange(false);
  };

  const handleCancel = () => {
    if (!loading) {
      onOpenChange(false);
    }
  };

  // Generar un ID único para la descripción
  const descriptionId = `modal-description-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={descriptionId}>
        <DialogHeader>
          <div className="flex flex-col items-center text-center">
            {styles.icon && <div className="mb-4">{styles.icon}</div>}
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
            <DialogDescription id={descriptionId} className="pt-2 text-sm text-muted-foreground">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="justify-center sm:justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            className={styles.confirmButton}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}