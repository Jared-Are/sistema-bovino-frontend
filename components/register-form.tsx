'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Loader2 } from 'lucide-react';

export default function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    nombreFinca: '',
    ubicacion: '',
    nombrePropietario: '',
    telefono: '',
    contrasena: '',
    confirmarContrasena: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (form.contrasena !== form.confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      //Crear finca
      const fincaRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fincas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombreFinca,
          ubicacion: form.ubicacion || undefined,
        }),
      });

      const fincaData = await fincaRes.json();
      if (!fincaRes.ok) throw new Error(fincaData.message || 'Error al crear finca');

      // Crear usuario
      const usuarioRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombrePropietario,
          telefono: form.telefono,
          contrasena: form.contrasena,
          rol: 'propietario',
          fincaId: fincaData.finca_id,
        }),
      });
      const contentType = usuarioRes.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await usuarioRes.text();
        console.error('Respuesta no JSON:', text);
        throw new Error('Error del servidor. Intenta de nuevo.');
      }

      const usuarioData = await usuarioRes.json();
      if (!usuarioRes.ok) throw new Error(usuarioData.message || 'Error al crear usuario');

      const usuarioParaGuardar = {
        nombre: usuarioData.usuario.nombre || form.nombrePropietario,
        rol: 'propietario',
        finca: {
          finca_id: fincaData.finca_id,
          nombre: fincaData.nombre || form.nombreFinca,
          ubicacion: fincaData.ubicacion || form.ubicacion || 'No especificada'
        }
      };

      //Guardar en localStorage
      localStorage.setItem('token', usuarioData.access_token);
      localStorage.setItem('usuario', JSON.stringify(usuarioParaGuardar));
      localStorage.setItem('userRole', 'propietario');
      
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Nombre Finca *
          </label>
          <input
            value={form.nombreFinca}
            onChange={(e) => setForm({...form, nombreFinca: e.target.value})}
            placeholder="El Porvenir"
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Ubicación
          </label>
          <input
            value={form.ubicacion}
            onChange={(e) => setForm({...form, ubicacion: e.target.value})}
            placeholder="San Carlos"
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">
          Nombre Propietario *
        </label>
        <input
          value={form.nombrePropietario}
          onChange={(e) => setForm({...form, nombrePropietario: e.target.value})}
          placeholder="Juan Pérez"
          className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">
          Teléfono *
        </label>
        <input
          type="tel"
          value={form.telefono}
          onChange={(e) => setForm({...form, telefono: e.target.value})}
          placeholder="88880000"
          className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Contraseña *
          </label>
          <input
            type="password"
            value={form.contrasena}
            onChange={(e) => setForm({...form, contrasena: e.target.value})}
            placeholder="••••••••"
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Confirmar *
          </label>
          <input
            type="password"
            value={form.confirmarContrasena}
            onChange={(e) => setForm({...form, confirmarContrasena: e.target.value})}
            placeholder="••••••••"
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
            required
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Registrando...
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4" />
            Registrar Finca
          </>
        )}
      </button>
    </form>
  );
}