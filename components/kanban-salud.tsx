'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Clock, XCircle, GripVertical } from 'lucide-react';

type Tratamiento = {
  id: number;
  tipo_tratamiento?: { id: number; nombre: string };
  animal?: { animal_id: number; arete: string; nombre: string };
  estado: string;
  fecha: string;
  descripcion?: string;
};

interface KanbanSaludProps {
  tratamientos: Tratamiento[];
  onTratamientoClick?: (tratamiento: Tratamiento) => void;
  onEstadoChange?: (id: number, nuevoEstado: string) => void;
  onEdit?: (tratamiento: Tratamiento) => void;      // 👈 Agregar
  onDelete?: (id: number) => void;   
}

type EstadoId = 'PENDIENTE' | 'ACTIVO' | 'COMPLETADO' | 'CANCELADO';

const ESTADOS: Array<{
  id: EstadoId;
  label: string;
  icon: any;
  bgColor: string;
  borderColor: string;
  textColor: string;
}> = [
  { id: 'PENDIENTE', label: 'Pendientes', icon: Clock, bgColor: 'bg-blue-50', borderColor: 'border-blue-200', textColor: 'text-blue-700' },
  { id: 'ACTIVO', label: 'Activos', icon: AlertCircle, bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', textColor: 'text-yellow-700' },
  { id: 'COMPLETADO', label: 'Completados', icon: CheckCircle2, bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', textColor: 'text-emerald-700' },
  { id: 'CANCELADO', label: 'Cancelados', icon: XCircle, bgColor: 'bg-red-50', borderColor: 'border-red-200', textColor: 'text-red-700' },
];

const ESTADOS_DESTINO: Record<EstadoId, EstadoId[]> = {
  PENDIENTE: ['ACTIVO', 'CANCELADO'],
  ACTIVO: ['COMPLETADO', 'CANCELADO'],
  COMPLETADO: [],
  CANCELADO: [],
};

// Componente memoizado para cada tarjeta
const TratamientoCard = memo(({ 
  tratamiento, 
  onClick,
  isDragging 
}: { 
  tratamiento: Tratamiento; 
  estadoColor: string;
  onClick: () => void;
  isDragging: boolean;
}) => {
  const puedeArrastrar = tratamiento.estado !== 'COMPLETADO' && tratamiento.estado !== 'CANCELADO';
  
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      id: tratamiento.id,
      estadoActual: tratamiento.estado
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable={puedeArrastrar}
      onDragStart={handleDragStart}
      onClick={onClick}
      className={`
        bg-white rounded-lg border p-3 transition-all select-none
        ${puedeArrastrar ? 'cursor-grab active:cursor-grabbing hover:shadow-md hover:border-zinc-300' : 'opacity-60 cursor-default'}
        ${isDragging ? 'opacity-50 scale-95' : ''}
      `}
    >
      <div className="flex items-start gap-2">
        {puedeArrastrar && <GripVertical className="h-4 w-4 text-zinc-400 mt-0.5 flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-1">
            <span className="font-medium text-sm truncate">
              {tratamiento.animal?.arete}
            </span>
          </div>
          <p className="text-xs text-zinc-500 truncate">
            {tratamiento.tipo_tratamiento?.nombre}
          </p>
          <div className="flex items-center justify-between mt-2 text-[10px]">
            <span className="text-zinc-400">
              {new Date(tratamiento.fecha).toLocaleDateString()}
            </span>
            {tratamiento.descripcion && (
              <Badge variant="secondary" className="text-[8px] px-1 py-0 h-4">
                nota
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

TratamientoCard.displayName = 'TratamientoCard';

// Componente memoizado para cada columna
const ColumnaKanban = memo(({ 
  estado, 
  items, 
  onTratamientoClick,
  onDrop,
  onDragOver,
  onDragLeave,
  isDragOver,
  puedeSoltar
}: { 
  estado: typeof ESTADOS[0];
  items: Tratamiento[];
  onTratamientoClick: (tratamiento: Tratamiento) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  isDragOver: boolean;
  puedeSoltar: boolean;
}) => {
  const Icon = estado.icon;
  const [draggingId] = useState<number | null>(null);

  return (
    <div
      className={`
        rounded-xl border-2 transition-all duration-150
        ${estado.bgColor} ${estado.borderColor}
        ${isDragOver && puedeSoltar ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}
        ${isDragOver && !puedeSoltar ? 'opacity-50' : ''}
      `}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <div className="p-3 border-b border-white/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${estado.textColor}`} />
            <h3 className={`text-sm font-semibold ${estado.textColor}`}>
              {estado.label}
            </h3>
          </div>
          <Badge variant="secondary" className="bg-white text-xs px-2">
            {items.length}
          </Badge>
        </div>
      </div>

      <div className="p-2 space-y-2 min-h-[400px] max-h-[500px] overflow-y-auto">
        {items.map(tratamiento => (
          <TratamientoCard
            key={tratamiento.id}
            tratamiento={tratamiento}
            estadoColor={estado.textColor}
            onClick={() => onTratamientoClick(tratamiento)}
            isDragging={draggingId === tratamiento.id}
          />
        ))}
        
        {items.length === 0 && (
          <div className="text-center py-6">
            <p className="text-xs text-zinc-400">Sin elementos</p>
          </div>
        )}
      </div>
    </div>
  );
});

ColumnaKanban.displayName = 'ColumnaKanban';

export function KanbanSalud({ tratamientos, onTratamientoClick, onEstadoChange }: KanbanSaludProps) {
  const [mesFiltro, setMesFiltro] = useState<string>('todos');
  const [dragOverState, setDragOverState] = useState<{ column: EstadoId | null; canDrop: boolean }>({
    column: null,
    canDrop: false
  });

  const { agrupados, total } = useMemo(() => {
    const filtrados = mesFiltro === 'todos' 
      ? tratamientos 
      : tratamientos.filter(t => {
          const fecha = new Date(t.fecha);
          return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}` === mesFiltro;
        });

    const grupos = {
      PENDIENTE: filtrados.filter(t => t.estado === 'PENDIENTE'),
      ACTIVO: filtrados.filter(t => t.estado === 'ACTIVO'),
      COMPLETADO: filtrados.filter(t => t.estado === 'COMPLETADO'),
      CANCELADO: filtrados.filter(t => t.estado === 'CANCELADO'),
    };

    return { agrupados: grupos, total: filtrados.length };
  }, [tratamientos, mesFiltro]);

  const handleDragOver = useCallback((e: React.DragEvent, columnId: EstadoId) => {
    e.preventDefault();
    
    const dragData = e.dataTransfer.getData('text/plain');
    if (!dragData) return;

    try {
      const { estadoActual } = JSON.parse(dragData);
      const destinosPermitidos = ESTADOS_DESTINO[estadoActual as EstadoId];
      const canDrop = destinosPermitidos?.includes(columnId) || false;
      
      setDragOverState({ column: columnId, canDrop });
    } catch {
    }
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverState({ column: null, canDrop: false });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, columnId: EstadoId) => {
    e.preventDefault();
    setDragOverState({ column: null, canDrop: false });

    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const tratamiento = tratamientos.find(t => t.id === data.id);
      
      if (!tratamiento) return;

      const destinosPermitidos = ESTADOS_DESTINO[tratamiento.estado as EstadoId];
      if (!destinosPermitidos?.includes(columnId)) return;

      onEstadoChange?.(data.id, columnId);
    } catch (error) {
      console.error('Error en drop:', error);
    }
  }, [tratamientos, onEstadoChange]);

  return (
    <div className="space-y-4">
      {/* Columnas Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {ESTADOS.map(estado => (
          <ColumnaKanban
            key={estado.id}
            estado={estado}
            items={agrupados[estado.id]}
            onTratamientoClick={(t) => onTratamientoClick?.(t)}
            onDrop={(e) => handleDrop(e, estado.id)}
            onDragOver={(e) => handleDragOver(e, estado.id)}
            onDragLeave={handleDragLeave}
            isDragOver={dragOverState.column === estado.id}
            puedeSoltar={dragOverState.canDrop && dragOverState.column === estado.id}
          />
        ))}
      </div>
    </div>
  );
}