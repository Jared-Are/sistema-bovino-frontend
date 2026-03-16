'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

interface AnimalFiltersProps {
  onFiltersChange?: (filters: any) => void;
  lotes?: string[];
  estados?: string[];
}

export function AnimalFilters({ onFiltersChange, lotes = [], estados = [] }: AnimalFiltersProps) {
  const [selectedLotes, setSelectedLotes] = useState<string[]>([]);
  const [selectedEstados, setSelectedEstados] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Mapeo para mostrar labels bonitos
  const estadoLabels: Record<string, string> = {
    vacia: 'Vacía',
    gestacion: 'Gestación',
    lactancia: 'Lactancia',
    seco: 'Seco',
    preparto: 'Preparto',
  };

  const handleAddLote = (lote: string) => {
    const newLotes = selectedLotes.includes(lote)
      ? selectedLotes.filter((l) => l !== lote)
      : [...selectedLotes, lote];
    setSelectedLotes(newLotes);
    onFiltersChange?.({ lotes: newLotes, estados: selectedEstados, search: searchTerm });
  };

  const handleAddEstado = (estado: string) => {
    const newEstados = selectedEstados.includes(estado)
      ? selectedEstados.filter((e) => e !== estado)
      : [...selectedEstados, estado];
    setSelectedEstados(newEstados);
    onFiltersChange?.({ lotes: selectedLotes, estados: newEstados, search: searchTerm });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onFiltersChange?.({ lotes: selectedLotes, estados: selectedEstados, search: value });
  };

  const handleClearFilters = () => {
    setSelectedLotes([]);
    setSelectedEstados([]);
    setSearchTerm('');
    onFiltersChange?.({ lotes: [], estados: [], search: '' });
  };

  const hasFilters = selectedLotes.length > 0 || selectedEstados.length > 0 || searchTerm.length > 0;

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

      {/* Lotes Multi-select */}
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

      {/* Estados Multi-select */}
      {estados.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">Estados Reproductivos</label>
          <div className="flex flex-wrap gap-2">
            {estados.map((estado) => (
              <Button
                key={estado}
                onClick={() => handleAddEstado(estado)}
                variant={selectedEstados.includes(estado) ? 'default' : 'outline'}
                size="sm"
                className={selectedEstados.includes(estado) ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              >
                <Plus className="w-3 h-3 mr-1" />
                {estadoLabels[estado] || estado}
              </Button>
            ))}
          </div>
          {selectedEstados.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedEstados.map((estado) => (
                <Badge key={estado} variant="secondary" className="bg-purple-100 text-purple-700">
                  {estadoLabels[estado] || estado}
                  <button
                    onClick={() => handleAddEstado(estado)}
                    className="ml-1 hover:text-purple-900"
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