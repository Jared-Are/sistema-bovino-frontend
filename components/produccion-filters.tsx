'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Calendar, ArrowUpDown } from 'lucide-react';

interface ProduccionFiltersProps {
  onSearchChange: (search: string) => void;
  onSortChange: (sort: string) => void;
  onDirectionChange: (dir: 'asc' | 'desc') => void;
  onDateChange: (date: string) => void;
  sortValue: string;
  directionValue: 'asc' | 'desc';
  dateValue: string;
}

export function ProduccionFilters({
  onSearchChange,
  onSortChange,
  onDirectionChange,
  onDateChange,
  sortValue,
  directionValue,
  dateValue
}: ProduccionFiltersProps) {
  return (
    <div className="bg-white p-3 sm:p-4 rounded-xl border border-zinc-200 shadow-sm mb-4 sm:mb-6 space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4">
        {/* Search */}
        <div className="relative flex-1 sm:min-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder="Buscar por arete o nombre..."
            className="pl-10 text-sm h-9 sm:h-10"
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Date Filter */}
        <div className="relative w-full sm:min-w-[180px] sm:w-auto">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            type="date"
            className="pl-10 text-sm h-9 sm:h-10 w-full"
            value={dateValue}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </div>

        {/* Sort By */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={sortValue} onValueChange={onSortChange}>
            <SelectTrigger className="flex-1 sm:w-[180px] text-sm h-9 sm:h-10">
              <SelectValue placeholder="Ordenar por..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fecha">Fecha de creación</SelectItem>
              <SelectItem value="nombre">Orden alfabético</SelectItem>
              <SelectItem value="cantidad">Cantidad / Peso</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 sm:h-10 sm:w-10 shrink-0"
            onClick={() => onDirectionChange(directionValue === 'asc' ? 'desc' : 'asc')}
            title={directionValue === 'asc' ? 'Ascendente' : 'Descendente'}
          >
            <ArrowUpDown className={`w-4 h-4 transition-transform ${directionValue === 'desc' ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </div>
    </div>
  );
}
