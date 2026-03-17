'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

interface SaludFiltersProps {
  onFiltersChange?: (filters: any) => void;
  tipos?: string[];
  estados?: string[];
}

const estadoLabels: Record<string, string> = {
  ACTIVO: 'Activo',
  PENDIENTE: 'Pendiente',
  COMPLETADO: 'Completado',
  CANCELADO: 'Cancelado',
};

export function SaludFilters({ onFiltersChange, tipos = [], estados = [] }: SaludFiltersProps) {
  const [selectedTipos, setSelectedTipos] = useState<string[]>([]);
  const [selectedEstados, setSelectedEstados] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddTipo = (tipo: string) => {
    const newTipos = selectedTipos.includes(tipo)
      ? selectedTipos.filter((t) => t !== tipo)
      : [...selectedTipos, tipo];
    setSelectedTipos(newTipos);
    onFiltersChange?.({ tipos: newTipos, estados: selectedEstados, search: searchTerm });
  };

  const handleAddEstado = (estado: string) => {
    const newEstados = selectedEstados.includes(estado)
      ? selectedEstados.filter((e) => e !== estado)
      : [...selectedEstados, estado];
    setSelectedEstados(newEstados);
    onFiltersChange?.({ tipos: selectedTipos, estados: newEstados, search: searchTerm });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onFiltersChange?.({ tipos: selectedTipos, estados: selectedEstados, search: value });
  };

  const handleClearFilters = () => {
    setSelectedTipos([]);
    setSelectedEstados([]);
    setSearchTerm('');
    onFiltersChange?.({ tipos: [], estados: [], search: '' });
  };

  const hasFilters = selectedTipos.length > 0 || selectedEstados.length > 0 || searchTerm.length > 0;

  return (
    <div className="space-y-4 mb-6 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
      {/* Search Input */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">Búsqueda</label>
        <Input
          placeholder="Buscar por arete, nombre o tratamiento..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="bg-white"
        />
      </div>

      {/* Tipos de Tratamiento Multi-select */}
      {tipos.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">Tipos de Tratamiento</label>
          <div className="flex flex-wrap gap-2">
            {tipos.map((tipo) => (
              <Button
                key={tipo}
                onClick={() => handleAddTipo(tipo)}
                variant={selectedTipos.includes(tipo) ? 'default' : 'outline'}
                size="sm"
                className={selectedTipos.includes(tipo) ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              >
                <Plus className="w-3 h-3 mr-1" />
                {tipo}
              </Button>
            ))}
          </div>
          {selectedTipos.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedTipos.map((tipo) => (
                <Badge key={tipo} variant="secondary" className="bg-emerald-100 text-emerald-700">
                  {tipo}
                  <button
                    onClick={() => handleAddTipo(tipo)}
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
          <label className="block text-sm font-medium text-zinc-700 mb-2">Estados</label>
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