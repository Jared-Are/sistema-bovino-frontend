'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

interface AnimalFiltersProps {
  onFiltersChange?: (filters: any) => void;
  lotes?: string[];
  razas?: string[]; 
}

export default function AnimalFilters({ onFiltersChange, lotes = [], razas = [] }: AnimalFiltersProps) {
  const [selectedLotes, setSelectedLotes] = useState<string[]>([]);
  const [selectedRazas, setSelectedRazas] = useState<string[]>([]); 
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddLote = (lote: string) => {
    const newLotes = selectedLotes.includes(lote)
      ? selectedLotes.filter((l) => l !== lote)
      : [...selectedLotes, lote];
    setSelectedLotes(newLotes);
    onFiltersChange?.({ lotes: newLotes, razas: selectedRazas, search: searchTerm });
  };

  const handleAddRaza = (raza: string) => {
    const newRazas = selectedRazas.includes(raza)
      ? selectedRazas.filter((r) => r !== raza)
      : [...selectedRazas, raza];
    setSelectedRazas(newRazas);
    onFiltersChange?.({ lotes: selectedLotes, razas: newRazas, search: searchTerm });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onFiltersChange?.({ lotes: selectedLotes, razas: selectedRazas, search: value });
  };

  const handleClearFilters = () => {
    setSelectedLotes([]);
    setSelectedRazas([]);
    setSearchTerm('');
    onFiltersChange?.({ lotes: [], razas: [], search: '' });
  };

  const hasFilters = selectedLotes.length > 0 || selectedRazas.length > 0 || searchTerm.length > 0;

  return (
    <div className="space-y-4 mb-6 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">Búsqueda</label>
        <Input
          placeholder="Buscar por arete, nombre o lote..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="bg-white"
        />
      </div>

      {/* Filtro por Razas */}
      {razas.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">Razas</label>
          <div className="flex flex-wrap gap-2">
            {razas.map((raza) => (
              <Button
                key={raza}
                onClick={() => handleAddRaza(raza)}
                variant={selectedRazas.includes(raza) ? 'default' : 'outline'}
                size="sm"
                className={selectedRazas.includes(raza) ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              >
                <Plus className="w-3 h-3 mr-1" />
                {raza}
              </Button>
            ))}
          </div>
          {selectedRazas.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedRazas.map((raza) => (
                <Badge key={raza} variant="secondary" className="bg-emerald-100 text-emerald-700">
                  {raza}
                  <button
                    onClick={() => handleAddRaza(raza)}
                    className="ml-1 hover:text-emerald-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filtro por Lotes */}
      {lotes.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">Lotes</label>
          <div className="flex flex-wrap gap-2">
            {lotes.map((lote) => (
              <Button
                key={lote}
                onClick={() => handleAddLote(lote)}
                variant={selectedLotes.includes(lote) ? 'default' : 'outline'}
                size="sm"
                className={selectedLotes.includes(lote) ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              >
                <Plus className="w-3 h-3 mr-1" />
                {lote}
              </Button>
            ))}
          </div>
          {selectedLotes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedLotes.map((lote) => (
                <Badge key={lote} variant="secondary" className="bg-emerald-100 text-emerald-700">
                  {lote}
                  <button
                    onClick={() => handleAddLote(lote)}
                    className="ml-1 hover:text-emerald-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {hasFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearFilters}
          className="w-full"
        >
          <X className="w-4 h-4 mr-2" />
          Limpiar todos los filtros
        </Button>
      )}
    </div>
  );
}