'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, Lock } from 'lucide-react';

interface CambiarContrasenaModalProps {
  isOpen: boolean;
  onClose: () => void;
  esObligatorio?: boolean;
}

export function CambiarContrasenaModal({ isOpen, onClose, esObligatorio = false }: CambiarContrasenaModalProps) {
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNueva, setShowNueva] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [errors, setErrors] = useState<{
    nuevaContrasena?: string;
    confirmarContrasena?: string;
  }>({});

  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!nuevaContrasena) {
      newErrors.nuevaContrasena = 'La nueva contraseña es requerida';
    } else if (nuevaContrasena.length < 6) {
      newErrors.nuevaContrasena = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!confirmarContrasena) {
      newErrors.confirmarContrasena = 'Confirma tu nueva contraseña';
    } else if (nuevaContrasena !== confirmarContrasena) {
      newErrors.confirmarContrasena = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuarios/cambiar-contrasena`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nuevaContrasena,
        }),
      });

      if (response.status === 401) {
        toast({
          title: "Sesión Expirada",
          description: "Tu sesión ha expirado por seguridad o el usuario ya no existe. Por favor, inicia sesión de nuevo.",
          variant: "destructive",
        });
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        localStorage.removeItem('userRole');
        window.location.href = '/';
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.message || 'Error al cambiar la contraseña',
          variant: "destructive",
        });
        throw new Error(data.message);
      }

      // Actualizar localStorage para que ya no pida cambiar la contraseña
      const usuarioStr = localStorage.getItem('usuario');
      if (usuarioStr) {
        try {
          const usuario = JSON.parse(usuarioStr);
          usuario.debe_cambiar_contrasena = false;
          localStorage.setItem('usuario', JSON.stringify(usuario));
          // Disparar evento para actualizar sidebar y remover estado obligatorio
          window.dispatchEvent(new Event('login'));
        } catch (err) {
          console.error('Error al actualizar localStorage de usuario:', err);
        }
      }

      toast({
        title: "¡Contraseña Actualizada!",
        description: "Tu contraseña ha sido cambiada exitosamente",
        className: "bg-green-600 text-white",
      });

      setNuevaContrasena('');
      setConfirmarContrasena('');
      setErrors({});
      onClose();

    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (esObligatorio) return; // Bloquear cierre si es obligatorio
    setNuevaContrasena('');
    setConfirmarContrasena('');
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-zinc-900">
              Cambiar Contraseña
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-500 mt-1">
              {esObligatorio
                ? 'Por seguridad, debes cambiar tu contraseña temporal antes de continuar utilizando la aplicación.'
                : 'Ingresa tu nueva contraseña'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Nueva Contraseña *
              </label>
              <div className="relative">
                <input
                  type={showNueva ? 'text' : 'password'}
                  value={nuevaContrasena}
                  onChange={(e) => setNuevaContrasena(e.target.value)}
                  className={`w-full px-3 py-2 border ${
                    errors.nuevaContrasena ? 'border-red-500' : 'border-zinc-200'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 pr-10`}
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowNueva(!showNueva)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                </button>
              </div>
              {errors.nuevaContrasena && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.nuevaContrasena}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Confirmar Contraseña *
              </label>
              <div className="relative">
                <input
                  type={showConfirmar ? 'text' : 'password'}
                  value={confirmarContrasena}
                  onChange={(e) => setConfirmarContrasena(e.target.value)}
                  className={`w-full px-3 py-2 border ${
                    errors.confirmarContrasena ? 'border-red-500' : 'border-zinc-200'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 pr-10`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmar(!showConfirmar)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                </button>
              </div>
              {errors.confirmarContrasena && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.confirmarContrasena}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            {!esObligatorio && (
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Cambiar Contraseña
                </>
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}