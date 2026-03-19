'use client';

import { useState } from 'react';
import LoginForm from '@/components/login-form';
import RegisterForm from '@/components/register-form';

export default function AuthPage() {
  const [modo, setModo] = useState<'login' | 'register'>('login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 p-6">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setModo('login')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                modo === 'login'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setModo('register')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                modo === 'register'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Registrar Finca
            </button>
          </div>
          {modo === 'login' ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </div>
  );
}