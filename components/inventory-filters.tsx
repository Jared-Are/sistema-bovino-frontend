'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

interface FilterProps {
  onFiltersChange?: (filters: any) => void;
}

export function InventoryFilters({ onFiltersChange }: FilterProps) {
  const [selectedLotes, setSelectedLotes] = useState<string[]>([]);
  const [selectedEstados, setSelectedEstados] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const lotes = [
    { id: 'lote-1', label: 'Lote 1 - Terneras' },
    { id: 'lote-2', label: 'Lote 2 - Vacas Lecheras' },
    { id: 'lote-3', label: 'Lote 3 - Toros Reproductores' },
    { id: 'lote-4', label: 'Lote 4 - Engorde' },
  ];

  const estados = [
    { id: 'gestacion', label: 'Gestación' },
    { id: 'lactancia', label: 'Lactancia' },
    { id: 'vacia', label: 'Vacía' },
    { id: 'seco', label: 'Seco' },
    { id: 'preparto', label: 'Preparto' },
  ];

  const handleAddLote = (loteId: string) => {
    const newLotes = selectedLotes.includes(loteId)
      ? selectedLotes.filter((l) => l !== loteId)
      : [...selectedLotes, loteId];
    setSelectedLotes(newLotes);
    onFiltersChange?.({ lotes: newLotes, estados: selectedEstados, search: searchTerm });
  };

  const handleAddEstado = (estadoId: string) => {
    const newEstados = selectedEstados.includes(estadoId)
      ? selectedEstados.filter((e) => e !== estadoId)
      : [...selectedEstados, estadoId];
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
      {/* Search Input */}
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
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">Lotes</label>
        <div className="flex flex-wrap gap-2">
          {lotes.map((lote) => (
            <Button
              key={lote.id}
              onClick={() => handleAddLote(lote.id)}
              variant={selectedLotes.includes(lote.id) ? 'default' : 'outline'}
              size="sm"
              className={selectedLotes.includes(lote.id) ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            >
              <Plus className="w-3 h-3 mr-1" />
              {lote.label}
            </Button>
          ))}
        </div>
        {selectedLotes.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedLotes.map((loteId) => {
              const lote = lotes.find((l) => l.id === loteId);
              return (
                <Badge key={loteId} variant="secondary" className="bg-emerald-100 text-emerald-700">
                  {lote?.label}
                  <button
                    onClick={() => handleAddLote(loteId)}
                    className="ml-1 hover:text-emerald-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      {/* Estados Multi-select */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">Estados Reproductivos</label>
        <div className="flex flex-wrap gap-2">
          {estados.map((estado) => (
            <Button
              key={estado.id}
              onClick={() => handleAddEstado(estado.id)}
              variant={selectedEstados.includes(estado.id) ? 'default' : 'outline'}
              size="sm"
              className={selectedEstados.includes(estado.id) ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            >
              <Plus className="w-3 h-3 mr-1" />
              {estado.label}
            </Button>
          ))}
        </div>
        {selectedEstados.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedEstados.map((estadoId) => {
              const estado = estados.find((e) => e.id === estadoId);
              return (
                <Badge key={estadoId} variant="secondary" className="bg-purple-100 text-purple-700">
                  {estado?.label}
                  <button
                    onClick={() => handleAddEstado(estadoId)}
                    className="ml-1 hover:text-purple-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      {/* Clear Filters Button */}
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
