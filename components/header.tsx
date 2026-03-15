'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { KPICards } from './kpi-cards';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="fixed top-0 right-0 left-64 bg-white border-b border-zinc-200 z-10">
      {/* Top Bar */}
      <div className="h-16 flex items-center justify-between px-8 border-b border-zinc-200">
        {/* Global Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              type="text"
              placeholder="Buscar animales por arete, nombre, lote..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-8 py-2 bg-zinc-50 border-zinc-200 text-sm w-full"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-zinc-200"
              >
                <X className="w-4 h-4 text-zinc-400" />
              </Button>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 ml-auto">
          <div className="text-right">
            <p className="text-sm font-medium text-zinc-900">Hacienda El Sol</p>
            <p className="text-xs text-zinc-500">Propietario</p>
          </div>
          <Avatar className="w-10 h-10 bg-emerald-600">
            <AvatarFallback className="bg-emerald-600 text-white font-semibold">
              JP
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="px-8 py-4">
        <KPICards />
      </div>
    </header>
  );
}
