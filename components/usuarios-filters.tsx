'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Shield, UserCheck } from 'lucide-react';

interface UsuarioFiltersProps {
  onFiltersChange?: (filters: any) => void;
  roles?: string[];
  estados?: string[];
}

// 1. OPCIONES para botones filtro
const opcionesRoles = ['Propietario', 'Veterinario', 'Operario'];
const opcionesEstados = ['Activo', 'Invitado', 'Bloqueado'];

// 2. LABELS para mostrar bonito
const rolLabels: Record<string, string> = {
  'Propietario': 'propietario',
  'Veterinario': 'veterinario', 
  'Operario': 'operario',
};

const estadoLabels: Record<string, string> = {
  'Activo': 'activo',
  'Invitado': 'invitado',
  'Bloqueado': 'bloqueado',
};

export function UsuarioFilters({ onFiltersChange, roles = [], estados = [] }: UsuarioFiltersProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedEstados, setSelectedEstados] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddRol = (rol: string) => {
    const newRoles = selectedRoles.includes(rol)
      ? selectedRoles.filter((r) => r !== rol)
      : [...selectedRoles, rol];
    setSelectedRoles(newRoles);
    onFiltersChange?.({ roles: newRoles, estados: selectedEstados, search: searchTerm });
  };

  const handleAddEstado = (estado: string) => {
    const newEstados = selectedEstados.includes(estado)
      ? selectedEstados.filter((e) => e !== estado)
      : [...selectedEstados, estado];
    setSelectedEstados(newEstados);
    onFiltersChange?.({ roles: selectedRoles, estados: newEstados, search: searchTerm });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onFiltersChange?.({ roles: selectedRoles, estados: selectedEstados, search: value });
  };

  const handleClearFilters = () => {
    setSelectedRoles([]);
    setSelectedEstados([]);
    setSearchTerm('');
    onFiltersChange?.({ roles: [], estados: [], search: '' });
  };

  const hasFilters = selectedRoles.length > 0 || selectedEstados.length > 0 || searchTerm.length > 0;

  return (
    <div className="space-y-4 mb-6 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">Búsqueda</label>
        <Input
          placeholder="Buscar por nombre, teléfono o email..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="bg-white"
        />
      </div>

      {/* Roles Multi-select */}
      {roles.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">Roles</label>
          <div className="flex flex-wrap gap-2">
            {roles.map((rol) => (
              <Button
                key={rol}
                onClick={() => handleAddRol(rol)}
                variant={selectedRoles.includes(rol) ? 'default' : 'outline'}
                size="sm"
                className={selectedRoles.includes(rol) ? 'bg-purple-600 hover:bg-purple-700' : ''}
              >
                <Plus className="w-3 h-3 mr-1" />
                {rolLabels[rol] || rol}
              </Button>
            ))}
          </div>
          {selectedRoles.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedRoles.map((rol) => (
                <Badge key={rol} variant="secondary" className="bg-purple-100 text-purple-700">
                  {rolLabels[rol] || rol}
                  <button
                    onClick={() => handleAddRol(rol)}
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
                <UserCheck className="w-3 h-3 mr-1" />
                {estadoLabels[estado] || estado}
              </Button>
            ))}
          </div>
          {selectedEstados.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedEstados.map((estado) => (
                <Badge key={estado} variant="secondary" className="bg-emerald-100 text-emerald-700">
                  {estadoLabels[estado] || estado}
                  <button
                    onClick={() => handleAddEstado(estado)}
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