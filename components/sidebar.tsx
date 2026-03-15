'use client';

import { useState } from 'react';
import {
  Home,
  Beef,
  Heart,
  Stethoscope,
  TrendingUp,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  Bell,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const menuItems = [
  { id: 'inicio', label: 'Inicio', icon: Home, href: '/', active: false },
  { id: 'inventario', label: 'Inventario', icon: Beef, href: '/inventario', active: true },
  { id: 'reproduccion', label: 'Reproducción', icon: Heart, href: '/reproduccion', active: false },
  { id: 'salud', label: 'Salud', icon: Stethoscope, href: '/salud', active: false },
  { id: 'produccion', label: 'Producción', icon: TrendingUp, href: '/produccion', active: false },
  { id: 'personal', label: 'Personal', icon: Users, href: '/personal', active: false },
  { id: 'configuracion', label: 'Configuración', icon: Settings, href: '/configuracion', active: false },
];

export function Sidebar() {
  const [selectedRole, setSelectedRole] = useState('Propietario');
  const notificationCount = 3;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-zinc-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-zinc-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Beef className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-900">Gestión</h1>
              <p className="text-xs text-zinc-500">Bovina</p>
            </div>
          </div>
          <div className="relative">
            <Button variant="ghost" size="sm" className="p-2 hover:bg-zinc-100">
              <Bell className="w-5 h-5 text-zinc-600" />
              {notificationCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                  {notificationCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Role Selector */}
      <div className="px-4 py-4 border-b border-zinc-200">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between text-sm h-9"
            >
              <span className="text-xs font-medium text-zinc-700">{selectedRole}</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem onClick={() => setSelectedRole('Propietario')}>
              Propietario
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedRole('Veterinario')}>
              Veterinario
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedRole('Operario')}>
              Operario
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-emerald-50 text-emerald-700 font-medium border border-emerald-200'
                  : 'text-zinc-700 hover:bg-zinc-50'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-zinc-200">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-zinc-700 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar Sesión</span>
        </Button>
      </div>
    </aside>
  );
}
