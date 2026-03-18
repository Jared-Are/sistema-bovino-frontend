"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Search } from "lucide-react";

interface ReproduccionFiltersProps {
  onFiltersChange?: (filters: any) => void;
  estados?: string[];
}

export function ReproduccionFilters({ onFiltersChange, estados = [] }: ReproduccionFiltersProps) {
  const [selectedEstados, setSelectedEstados] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddEstado = (estado: string) => {
    const newEstados = selectedEstados.includes(estado)
      ? selectedEstados.filter((e) => e !== estado)
      : [...selectedEstados, estado];
    setSelectedEstados(newEstados);
    onFiltersChange?.({ estados: newEstados, search: searchTerm });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onFiltersChange?.({ estados: selectedEstados, search: value });
  };

  const handleClearFilters = () => {
    setSelectedEstados([]);
    setSearchTerm("");
    onFiltersChange?.({ estados: [], search: "" });
  };

  const hasFilters = selectedEstados.length > 0 || searchTerm.length > 0;

  return (
    <div className="space-y-4 mb-6 p-4 bg-white rounded-lg border border-zinc-200 shadow-sm">
      <div className="relative">
        <label className="block text-sm font-medium text-zinc-700 mb-2">Búsqueda</label>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Buscar por arete, nombre o número de monta..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 bg-zinc-50"
          />
        </div>
      </div>

      {estados.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">Filtrar por Estado</label>
          <div className="flex flex-wrap gap-2">
            {estados.map((estado) => (
              <Button
                key={estado}
                onClick={() => handleAddEstado(estado)}
                variant={selectedEstados.includes(estado) ? "default" : "outline"}
                size="sm"
                className={selectedEstados.includes(estado) ? "bg-emerald-600 hover:bg-emerald-700" : ""}
              >
                <Plus className="w-3 h-3 mr-1" />
                {estado}
              </Button>
            ))}
          </div>
        </div>
      )}

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={handleClearFilters} className="w-full text-zinc-500 hover:text-zinc-900 mt-2">
          <X className="w-4 h-4 mr-2" />
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}