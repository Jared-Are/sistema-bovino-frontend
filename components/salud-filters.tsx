'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Calendar } from 'lucide-react';

interface SaludFiltersProps {
  onFiltersChange?: (filters: {
    tipos: string[];
    estados: string[];
    search: string;
    mes?: string;
  }) => void;
  tipos?: string[];
  estados?: string[];
  fechasDisponibles?: string[];
  showDateFilter?: boolean;
}

const estadoLabels: Record<string, string> = {
  ACTIVO: 'Activo',
  PENDIENTE: 'Pendiente',
  COMPLETADO: 'Completado',
  CANCELADO: 'Cancelado',
};

export function SaludFilters({ 
  onFiltersChange, 
  tipos = [], 
  estados = [],
  fechasDisponibles = [],
  showDateFilter = true
}: SaludFiltersProps) {
  const [selectedTipos, setSelectedTipos] = useState<string[]>([]);
  const [selectedEstados, setSelectedEstados] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [mesSeleccionado, setMesSeleccionado] = useState<string>('todos');

  useEffect(() => {
    const filters = {
      tipos: selectedTipos,
      estados: selectedEstados,
      search: searchTerm,
      mes: mesSeleccionado !== 'todos' ? mesSeleccionado : undefined,
    };
    
    onFiltersChange?.(filters);
  }, [selectedTipos, selectedEstados, searchTerm, mesSeleccionado, onFiltersChange]);

  const handleAddTipo = (tipo: string) => {
    const newTipos = selectedTipos.includes(tipo)
      ? selectedTipos.filter((t) => t !== tipo)
      : [...selectedTipos, tipo];
    setSelectedTipos(newTipos);
  };

  const handleAddEstado = (estado: string) => {
    const newEstados = selectedEstados.includes(estado)
      ? selectedEstados.filter((e) => e !== estado)
      : [...selectedEstados, estado];
    setSelectedEstados(newEstados);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleClearFilters = () => {
    setSelectedTipos([]);
    setSelectedEstados([]);
    setSearchTerm('');
    setMesSeleccionado('todos');
  };

  const hasFilters = 
    selectedTipos.length > 0 || 
    selectedEstados.length > 0 || 
    searchTerm.length > 0 ||
    mesSeleccionado !== 'todos';

  const formatearMes = (mes: string) => {
    const [year, month] = mes.split('-');
    const fecha = new Date(parseInt(year), parseInt(month) - 1);
    return fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-4 mb-6 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
      {/* Search Input */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">
          Búsqueda
        </label>
        <Input
          placeholder="Buscar por número de tratamiento, arete, nombre o tipo..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="bg-white"
        />
        <p className="text-xs text-zinc-400 mt-1">
          Ej: TRAT-0001, arete, nombre del animal o tipo de tratamiento
        </p>
      </div>

      {/* Filtro por Mes */}
      {showDateFilter && fechasDisponibles.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            Filtrar por Mes
          </label>
          <Select value={mesSeleccionado} onValueChange={setMesSeleccionado}>
            <SelectTrigger className="w-full bg-white">
              <Calendar className="h-4 w-4 mr-2 text-zinc-500" />
              <SelectValue placeholder="Seleccionar mes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los meses</SelectItem>
              {fechasDisponibles.map((mes) => (
                <SelectItem key={mes} value={mes}>
                  {formatearMes(mes)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Tipos de Tratamiento Multi-select */}
      {tipos.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            Tipos de Tratamiento
          </label>
          <div className="flex flex-wrap gap-2">
            {tipos.map((tipo) => (
              <Button
                key={tipo}
                onClick={() => handleAddTipo(tipo)}
                variant={selectedTipos.includes(tipo) ? 'default' : 'outline'}
                size="sm"
                className={selectedTipos.includes(tipo) ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-white'}
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
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            Estados
          </label>
          <div className="flex flex-wrap gap-2">
            {estados.map((estado) => (
              <Button
                key={estado}
                onClick={() => handleAddEstado(estado)}
                variant={selectedEstados.includes(estado) ? 'default' : 'outline'}
                size="sm"
                className={selectedEstados.includes(estado) ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-white'}
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
          className="w-full bg-white"
        >
          <X className="w-4 h-4 mr-2" />
          Limpiar todos los filtros
        </Button>
      )}
    </div>
  );
}