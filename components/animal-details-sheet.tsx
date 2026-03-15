'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Animal } from '@/lib/mock-data';
import {
  Calendar,
  Weight,
  Heart,
  Stethoscope,
  TrendingUp,
  Plus,
  X as XIcon,
} from 'lucide-react';

interface AnimalDetailsSheetProps {
  animal: Animal | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AnimalDetailsSheet({
  animal,
  isOpen,
  onOpenChange,
}: AnimalDetailsSheetProps) {
  if (!animal) return null;

  const getReproductivoBadgeColor = (estado: string) => {
    const colors: Record<string, string> = {
      vacia: 'bg-blue-100 text-blue-800',
      gestacion: 'bg-purple-100 text-purple-800',
      lactancia: 'bg-emerald-100 text-emerald-800',
      seco: 'bg-gray-100 text-gray-800',
      preparto: 'bg-orange-100 text-orange-800',
    };
    return colors[estado] || colors['vacia'];
  };

  const getSaludBadgeColor = (estado: string) => {
    const colors: Record<string, string> = {
      sano: 'bg-emerald-100 text-emerald-800',
      enfermo: 'bg-red-100 text-red-800',
      tratamiento: 'bg-yellow-100 text-yellow-800',
      critico: 'bg-red-200 text-red-900',
    };
    return colors[estado] || colors['sano'];
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[45%] sm:w-[45%] overflow-y-auto p-0">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 border-b border-zinc-200 sticky top-0 z-10">
          <SheetHeader className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <SheetTitle className="text-3xl font-bold text-zinc-900">
                  {animal.nombre}
                </SheetTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-emerald-600 text-white">{animal.arete}</Badge>
                  <span className="text-sm text-zinc-600">{animal.raza}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 pt-4">
              <div className="bg-white rounded-lg p-3 border border-zinc-200">
                <p className="text-xs text-zinc-500 font-medium">Edad</p>
                <p className="text-lg font-bold text-zinc-900">{animal.edad} años</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-zinc-200">
                <p className="text-xs text-zinc-500 font-medium">Sexo</p>
                <p className="text-lg font-bold text-zinc-900">{animal.sexo}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-zinc-200">
                <p className="text-xs text-zinc-500 font-medium">Peso</p>
                <p className="text-lg font-bold text-zinc-900">{animal.ultimoPeso} kg</p>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex gap-2 flex-wrap pt-2">
              <Badge className={getReproductivoBadgeColor(animal.estadoReproductivo)}>
                {animal.estadoReproductivo === 'vacia' && 'Vacía'}
                {animal.estadoReproductivo === 'gestacion' && 'Gestación'}
                {animal.estadoReproductivo === 'lactancia' && 'Lactancia'}
                {animal.estadoReproductivo === 'seco' && 'Seco'}
                {animal.estadoReproductivo === 'preparto' && 'Preparto'}
              </Badge>
              <Badge className={getSaludBadgeColor(animal.estadoSalud)}>
                {animal.estadoSalud === 'sano' && 'Sano'}
                {animal.estadoSalud === 'enfermo' && 'Enfermo'}
                {animal.estadoSalud === 'tratamiento' && 'Tratamiento'}
                {animal.estadoSalud === 'critico' && 'Crítico'}
              </Badge>
            </div>
          </SheetHeader>
        </div>

        {/* Tabs Content */}
        <div className="p-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="reproduccion">Reproducción</TabsTrigger>
              <TabsTrigger value="salud">Salud</TabsTrigger>
              <TabsTrigger value="produccion">Producción</TabsTrigger>
            </TabsList>

            {/* Tab: Datos Generales */}
            <TabsContent value="general" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide">
                  Información General
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-zinc-200 rounded-lg p-3">
                    <p className="text-xs text-zinc-500 font-medium mb-1">Lote Actual</p>
                    <p className="text-sm font-medium text-zinc-900">{animal.lote}</p>
                  </div>
                  <div className="border border-zinc-200 rounded-lg p-3">
                    <p className="text-xs text-zinc-500 font-medium mb-1">Fecha Nacimiento</p>
                    <p className="text-sm font-medium text-zinc-900">
                      {new Date(animal.fechaNacimiento).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Genealogy */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide">
                  Genealogía
                </h3>

                {(animal.padre || animal.madre) && (
                  <div className="space-y-3">
                    {animal.padre && (
                      <div className="border border-zinc-200 rounded-lg p-3 bg-zinc-50">
                        <p className="text-xs text-zinc-500 font-medium mb-1">Padre</p>
                        <p className="text-sm font-medium text-zinc-900">{animal.padre}</p>
                      </div>
                    )}
                    {animal.madre && (
                      <div className="border border-zinc-200 rounded-lg p-3 bg-zinc-50">
                        <p className="text-xs text-zinc-500 font-medium mb-1">Madre</p>
                        <p className="text-sm font-medium text-zinc-900">{animal.madre}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tab: Reproducción */}
            <TabsContent value="reproduccion" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide">
                    Montas
                  </h3>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="w-4 h-4 mr-1" />
                    Registrar Monta
                  </Button>
                </div>

                {animal.montas.length > 0 ? (
                  <div className="space-y-3">
                    {animal.montas.map((monta) => (
                      <div
                        key={monta.id}
                        className="border border-zinc-200 rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-zinc-900">
                              {monta.tipo === 'natural' ? 'Monta Natural' : 'Inseminación Artificial'}
                            </p>
                            <p className="text-xs text-zinc-500 mt-1">
                              Fecha: {new Date(monta.fecha).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">
                            {monta.semental}
                          </Badge>
                        </div>
                        {monta.diagnostico && (
                          <div className="pt-2 border-t border-zinc-100">
                            <p className="text-xs text-zinc-500 font-medium">Diagnóstico</p>
                            <p className="text-sm font-medium text-emerald-700">
                              {monta.diagnostico === 'positivo' ? 'Positivo' : 'Negativo'} -{' '}
                              {monta.diagnosticoFecha &&
                                new Date(monta.diagnosticoFecha).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-dashed border-zinc-300 rounded-lg p-6 text-center">
                    <Heart className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                    <p className="text-sm text-zinc-500">Sin registros de montas</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tab: Salud */}
            <TabsContent value="salud" className="space-y-6">
              {/* Tratamientos */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide">
                    Tratamientos
                  </h3>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="w-4 h-4 mr-1" />
                    Nuevo Tratamiento
                  </Button>
                </div>

                {animal.tratamientos.length > 0 ? (
                  <div className="space-y-3">
                    {animal.tratamientos.map((tratamiento) => (
                      <div
                        key={tratamiento.id}
                        className="border border-zinc-200 rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-zinc-900">
                              {tratamiento.tipo}
                            </p>
                            <p className="text-xs text-zinc-500 mt-1">
                              Por: {tratamiento.veterinario}
                            </p>
                          </div>
                          <Badge
                            className={
                              tratamiento.estado === 'activo'
                                ? 'bg-yellow-100 text-yellow-800'
                                : tratamiento.estado === 'completado'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                            }
                          >
                            {tratamiento.estado === 'activo' && 'Activo'}
                            {tratamiento.estado === 'completado' && 'Completado'}
                            {tratamiento.estado === 'suspendido' && 'Suspendido'}
                          </Badge>
                        </div>
                        <p className="text-xs text-zinc-500">
                          {new Date(tratamiento.fecha).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-dashed border-zinc-300 rounded-lg p-6 text-center">
                    <Stethoscope className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                    <p className="text-sm text-zinc-500">Sin tratamientos registrados</p>
                  </div>
                )}
              </div>

              {/* Vacunas */}
              <div className="space-y-4 pt-6 border-t border-zinc-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide">
                    Vacunas
                  </h3>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="w-4 h-4 mr-1" />
                    Registrar Vacuna
                  </Button>
                </div>

                {animal.vacunas.length > 0 ? (
                  <div className="space-y-3">
                    {animal.vacunas.map((vacuna) => (
                      <div
                        key={vacuna.id}
                        className="border border-zinc-200 rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-zinc-900">{vacuna.nombre}</p>
                            <p className="text-xs text-zinc-500 mt-1">
                              Veterinario: {vacuna.veterinario}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-zinc-500">Fecha aplicación</p>
                            <p className="font-medium text-zinc-900">
                              {new Date(vacuna.fecha).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                          <div>
                            <p className="text-zinc-500">Próxima dosis</p>
                            <p className="font-medium text-zinc-900">
                              {new Date(vacuna.proximaFecha).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-dashed border-zinc-300 rounded-lg p-6 text-center">
                    <Stethoscope className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                    <p className="text-sm text-zinc-500">Sin vacunas registradas</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tab: Producción */}
            <TabsContent value="produccion" className="space-y-6">
              {animal.sexo === 'Hembra' && animal.produccionDiaria ? (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide">
                    Producción de Leche
                  </h3>

                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-6 border border-emerald-200">
                    <p className="text-xs text-emerald-600 font-medium mb-1">Producción Diaria</p>
                    <p className="text-4xl font-bold text-emerald-900">
                      {animal.produccionDiaria}
                      <span className="text-lg ml-2">L/día</span>
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-zinc-900">Historial de Pesajes</h4>
                    {animal.pesajes.length > 0 ? (
                      <div className="space-y-2">
                        {animal.pesajes.map((pesaje) => (
                          <div
                            key={pesaje.id}
                            className="border border-zinc-200 rounded-lg p-3 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <Weight className="w-4 h-4 text-zinc-400" />
                              <div>
                                <p className="text-sm font-medium text-zinc-900">
                                  {pesaje.peso} kg
                                </p>
                                <p className="text-xs text-zinc-500">
                                  {new Date(pesaje.fecha).toLocaleDateString('es-ES')}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border border-dashed border-zinc-300 rounded-lg p-6 text-center">
                        <TrendingUp className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                        <p className="text-sm text-zinc-500">Sin pesajes registrados</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-zinc-300 rounded-lg p-12 text-center">
                  <TrendingUp className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                  <p className="text-sm text-zinc-500">
                    {animal.sexo === 'Macho'
                      ? 'Datos de producción no disponibles para machos'
                      : 'Sin datos de producción'}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
