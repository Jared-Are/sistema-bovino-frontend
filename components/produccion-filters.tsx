'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ProduccionFiltersProps {
  onSearchChange: (search: string) => void;
}

export function ProduccionFilters({ onSearchChange }: ProduccionFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm mb-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <Input
          placeholder="Buscar por arete o nombre..."
          className="pl-10"
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}
