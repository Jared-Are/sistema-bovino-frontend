'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

type Tratamiento = {
  id: number;
  numero_tratamiento?: string;
  tipo_tratamiento?: { id: number; nombre: string };
  animal?: { animal_id: number; arete: string; nombre: string };
  estado: string;
  fecha: string;
  descripcion?: string;
};

interface CalendarioSaludProps {
  tratamientos: Tratamiento[];
  onTratamientoClick?: (tratamiento: Tratamiento) => void;
  // 👈 Filtros recibidos desde el padre
  filters?: {
    tipos: string[];
    estados: string[];
    search: string;
    mes?: string;
  };
}

const getEstadoColor = (estado: string) => {
  switch (estado) {
    case 'PENDIENTE': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'ACTIVO': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'COMPLETADO': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'CANCELADO': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getEstadoLabel = (estado: string) => {
  switch (estado) {
    case 'PENDIENTE': return 'Pendiente';
    case 'ACTIVO': return 'Activo';
    case 'COMPLETADO': return 'Completado';
    case 'CANCELADO': return 'Cancelado';
    default: return estado;
  }
};

export function CalendarioSalud({ tratamientos, onTratamientoClick, filters }: CalendarioSaludProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const tratamientosFiltrados = useMemo(() => {
    if (!filters) return tratamientos;
    
    return tratamientos.filter(t => {
      if (filters.tipos.length > 0) {
        if (!t.tipo_tratamiento?.nombre) return false;
        if (!filters.tipos.includes(t.tipo_tratamiento.nombre)) return false;
      }
      
      if (filters.estados.length > 0) {
        if (!filters.estados.includes(t.estado)) return false;
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matches = 
          t.numero_tratamiento?.toLowerCase().includes(searchLower) ||
          t.animal?.arete?.toLowerCase().includes(searchLower) ||
          t.animal?.nombre?.toLowerCase().includes(searchLower) ||
          t.tipo_tratamiento?.nombre?.toLowerCase().includes(searchLower);
        
        if (!matches) return false;
      }
      
      if (filters.mes) {
        const fechaTratamiento = t.fecha.split('T')[0]; // YYYY-MM-DD
        if (!fechaTratamiento.startsWith(filters.mes)) return false;
      }
      
      return true;
    });
  }, [tratamientos, filters]);

  const eventosPorDia = useMemo(() => {
    const mapa = new Map<string, Tratamiento[]>();
    tratamientosFiltrados.forEach(t => {
      const fecha = t.fecha.split('T')[0];
      if (!mapa.has(fecha)) mapa.set(fecha, []);
      mapa.get(fecha)!.push(t);
    });
    return mapa;
  }, [tratamientosFiltrados]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const eventosDeFechaSeleccionada = selectedDate 
    ? eventosPorDia.get(format(selectedDate, 'yyyy-MM-dd')) || []
    : [];

  // Estados disponibles
  const estados = ['PENDIENTE', 'ACTIVO', 'COMPLETADO', 'CANCELADO'];

  return (
    <div className="space-y-6">
      {/* Calendario */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-emerald-600" />
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-zinc-500 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {/* Ajustar para que empiece en lunes */}
            {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[100px] bg-zinc-50 rounded-lg border border-dashed border-zinc-200" />
            ))}

            {daysInMonth.map((day: Date) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const eventosDelDia = eventosPorDia.get(dateStr) || [];
              const isSelected = selectedDate && isSameDay(day, selectedDate);

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-[100px] p-2 rounded-lg border cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-zinc-200 hover:border-emerald-300 hover:bg-emerald-50/30'
                  }`}
                >
                  <span className="text-sm font-medium">{format(day, 'd')}</span>
                  {eventosDelDia.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {eventosDelDia.slice(0, 3).map(e => (
                        <div
                          key={e.id}
                          onClick={(event) => {
                            event.stopPropagation();
                            onTratamientoClick?.(e);
                          }}
                          className={`text-xs p-1 rounded truncate ${getEstadoColor(e.estado)}`}
                          title={`${e.animal?.arete} - ${e.tipo_tratamiento?.nombre}`}
                        >
                          {e.animal?.arete}
                        </div>
                      ))}
                      {eventosDelDia.length > 3 && (
                        <div className="text-xs text-zinc-500 text-center">
                          +{eventosDelDia.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Leyenda de estados */}
          <div className="mt-4 pt-4 border-t flex flex-wrap gap-3">
            <span className="text-xs text-zinc-500">Estados:</span>
            {estados.map(estado => (
              <div key={estado} className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded ${getEstadoColor(estado).split(' ')[0]}`} />
                <span className="text-xs text-zinc-600">{getEstadoLabel(estado)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detalle del día seleccionado */}
      {selectedDate && (
        <Card>
          <CardContent className="p-6">
            <h4 className="font-semibold mb-4">
              Tratamientos del {format(selectedDate, "d 'de' MMMM yyyy", { locale: es })}
            </h4>
            {eventosDeFechaSeleccionada.length === 0 ? (
              <p className="text-zinc-500 text-sm">No hay tratamientos para esta fecha</p>
            ) : (
              <div className="space-y-3">
                {eventosDeFechaSeleccionada.map(t => (
                  <div
                    key={t.id}
                    onClick={() => onTratamientoClick?.(t)}
                    className="border rounded-lg p-3 cursor-pointer hover:border-emerald-300 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">
                          {t.numero_tratamiento} - {t.animal?.arete} {t.animal?.nombre && `(${t.animal.nombre})`}
                        </p>
                        <p className="text-sm text-zinc-600">{t.tipo_tratamiento?.nombre}</p>
                      </div>
                      <Badge className={getEstadoColor(t.estado)}>
                        {getEstadoLabel(t.estado)}
                      </Badge>
                    </div>
                    {t.descripcion && (
                      <p className="text-xs text-zinc-500 mt-2">{t.descripcion}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}