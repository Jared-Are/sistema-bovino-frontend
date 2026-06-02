'use client';

import { useState, useEffect } from 'react';
import {
    Users,
    Milk,
    Activity,
    Heart,
    TrendingUp,
    RefreshCw,
    Loader2,
    Syringe,
    FileText,
    Scale,
    Baby,
    Clock,
    AlertCircle,
    Skull,
    CalendarPlus,
    CheckCircle2,
    FlaskConical,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { UniversalReportDialog } from './universal-report-dialog';
import type { RegistroProduccion } from '@/lib/types/produccion';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const getLocalDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
        const cleanStr = dateString.split('T')[0];
        const [year, month, day] = cleanStr.split('-');
        if (!year || !month || !day) return dateString.split('T')[0];
        return `${year}-${month}-${day}`;
    } catch {
        return dateString.split('T')[0];
    }
};

const getLocalDateObj = (dateString?: string): Date | null => {
    if (!dateString) return null;
    try {
        const cleanStr = dateString.split('T')[0];
        const [year, month, day] = cleanStr.split('-');
        if (!year || !month || !day) return null;
        return new Date(Number(year), Number(month) - 1, Number(day));
    } catch {
        return null;
    }
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface DashboardData {
    // Existentes
    totalAnimals: number;
    productionToday: number;
    inTreatment: number;
    reproEventsMonth: number;
    vacasPreñadas: number;
    tasaPreñez: number;
    partosMes: number;
    productionTrend: any[];
    distribution: any[];
    montasChart: { name: string; value: number }[];      // donut total
    montasChartMes: { name: string; value: number }[];   // donut mes actual
    healthEvents: any[];
    registrosLeche: RegistroProduccion[];
    registrosCarne: RegistroProduccion[];
    // Producción
    litrosPorVacaLactante: number;
    pesoPromedioCanal: number;
    pesoPromedioAnimales: number;
    // Reproducción
    tasaConcepcionTotal: number;
    vacasEnEvaluacion: number;
    partosTotales: number;
    // Salud & Inventario
    tratamientosPendientes: number;
    enfermedadesTop: { nombre: string; count: number }[];
    mortalidadMes: number;
    animalesNuevosMes: number;
}

// ---------------------------------------------------------------------------
// KPI Card component (mejorado: acepta `alert` para borde rojo)
// ---------------------------------------------------------------------------
const KPICard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color,
    alert = false,
}: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: any;
    color: 'emerald' | 'blue' | 'rose' | 'amber' | 'violet' | 'cyan' | 'orange';
    alert?: boolean;
}) => {
    const colorMap = {
        emerald: 'bg-emerald-50 text-emerald-600',
        blue: 'bg-blue-50 text-blue-600',
        rose: 'bg-rose-50 text-rose-600',
        amber: 'bg-amber-50 text-amber-600',
        violet: 'bg-violet-50 text-violet-600',
        cyan: 'bg-cyan-50 text-cyan-600',
        orange: 'bg-orange-50 text-orange-600',
    };
    const textMap = {
        emerald: 'text-emerald-600',
        blue: 'text-blue-600',
        rose: 'text-rose-600',
        amber: 'text-amber-600',
        violet: 'text-violet-600',
        cyan: 'text-cyan-600',
        orange: 'text-orange-600',
    };

    return (
        <Card className={cn('hover:shadow-md transition-all', alert && 'border-rose-200 bg-rose-50/30')}>
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest truncate">{title}</p>
                        <h3 className={cn('text-2xl font-black mt-0.5', textMap[color])}>{value}</h3>
                        <p className="text-xs text-zinc-400 mt-1 leading-tight">{subtitle}</p>
                    </div>
                    <div className={cn('p-2.5 rounded-xl shrink-0', colorMap[color])}>
                        <Icon className="w-5 h-5" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// ---------------------------------------------------------------------------
// Sección principal
// ---------------------------------------------------------------------------
export function DashboardSection() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<DashboardData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [montasScope, setMontasScope] = useState<'total' | 'mes'>('total');

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const baseUrl = process.env.NEXT_PUBLIC_API_URL;
            const auth = { Authorization: `Bearer ${token}` };

            const [
                respAnimals, respLeche, respCarne,
                respSalud, respRepro, respPartos,
            ] = await Promise.all([
                fetch(`${baseUrl}/animales`, { headers: auth }),
                fetch(`${baseUrl}/produccion/leche`, { headers: auth }),
                fetch(`${baseUrl}/produccion/carne`, { headers: auth }),
                fetch(`${baseUrl}/salud/tratamientos`, { headers: auth }),
                fetch(`${baseUrl}/reproduccion/montas`, { headers: auth }),
                fetch(`${baseUrl}/reproduccion/partos`, { headers: auth }),
            ]);

            const [animalsData, lecheData, carneData, saludData, reproData, partosData] = await Promise.all([
                respAnimals.json(), respLeche.json(), respCarne.json(),
                respSalud.json(), respRepro.json(), respPartos.json(),
            ]);

            const animals = Array.isArray(animalsData) ? animalsData : [];
            const salud = Array.isArray(saludData) ? saludData : [];
            const repro = Array.isArray(reproData) ? reproData : [];
            const partos = Array.isArray(partosData) ? partosData : [];

            // --- Mapeo producción ---
            const mapLeche = (b: any): RegistroProduccion => ({
                id: b.id.toString(),
                tipo: 'leche',
                animalId: b.animal?.animal_id?.toString() || '',
                arete: b.animal?.arete || 'N/A',
                nombreAnimal: b.animal?.nombre || 'Sin nombre',
                numeroProduccion: b.numero_produccion,
                cantidad: b.cantidad,
                fecha: getLocalDate(b.fecha_creacion || b.fecha),
                animal: b.animal,
            });

            const mapCarne = (b: any): RegistroProduccion => {
                const rawDate = b.fecha_creacion || b.fecha;
                const dateStr = getLocalDate(rawDate);
                let numeroProduccion = b.numero_produccion || b.numeroProduccion || b.etiqueta;
                if (!numeroProduccion && rawDate && b.animal?.animal_id) {
                    const d = new Date(rawDate);
                    const ddmmyy = `${d.getDate().toString().padStart(2, '0')}${(d.getMonth() + 1).toString().padStart(2, '0')}${d.getFullYear().toString().slice(2)}`;
                    numeroProduccion = `C-${ddmmyy}-${b.animal.animal_id.toString().padStart(3, '0')}`;
                }
                return {
                    id: b.id.toString(), tipo: 'carne',
                    animalId: b.animal?.animal_id?.toString() || '',
                    arete: b.animal?.arete || 'N/A',
                    nombreAnimal: b.animal?.nombre || 'Sin nombre',
                    pesoCanal: b.peso_canal,
                    numeroProduccion, fecha: dateStr, animal: b.animal,
                };
            };

            const rLeche = Array.isArray(lecheData) ? lecheData.map(mapLeche) : [];
            const rCarne = Array.isArray(carneData) ? carneData.map(mapCarne) : [];

            // ================================================================
            // KPIs — base
            // ================================================================
            const now = new Date();
            const mesActual = now.getMonth();
            const anoActual = now.getFullYear();
            const hoy = getLocalDate(now.toISOString());

            // Producción hoy
            const produccionHoy = rLeche
                .filter((r: any) => r.fecha === hoy)
                .reduce((s: number, r: any) => s + Number(r.cantidad || 0), 0);

            // Montas del mes
            const montasEsteMes = repro.filter((r: any) => {
                const f = r.fecha_programacion || r.fecha_creacion;
                if (!f) return false;
                const d = getLocalDateObj(f);
                return d && d.getMonth() === mesActual && d.getFullYear() === anoActual;
            });

            // Vacas preñadas = montas confirmadas activas
            const vacasPreñadas = repro.filter((r: any) => r.estado === 'Confirmada').length;

            // Partos del mes
            const partosMes = partos.filter((p: any) => {
                const f = p.fecha_parto || p.fecha_creacion;
                if (!f) return false;
                const d = getLocalDateObj(f);
                return d && d.getMonth() === mesActual && d.getFullYear() === anoActual;
            }).length;

            // Tasa de preñez del mes
            const montasConfirmadasMes = montasEsteMes.filter((r: any) => r.estado === 'Confirmada');
            const tasaPreñez = montasEsteMes.length > 0
                ? Number((montasConfirmadasMes.length / montasEsteMes.length * 100).toFixed(1))
                : 0;

            // ================================================================
            // KPIs NUEVOS — Producción
            // ================================================================
            // L / vaca lactante (basado en registros de hoy o últimos 7 días si hoy = 0)
            const lactantes = animals.filter((a: any) =>
                a.estado_reproductivo === 'Lactante' ||
                a.estado_reproductivo === 'Lactando'
            );
            const litrosPorVacaLactante = lactantes.length > 0 && produccionHoy > 0
                ? Number((produccionHoy / lactantes.length).toFixed(1))
                : 0;

            // Peso promedio canal (todos los registros de carne)
            const pesosCarne = rCarne
                .map((r: any) => Number(r.pesoCanal || 0))
                .filter((p: number) => p > 0);
            const pesoPromedioCanal = pesosCarne.length > 0
                ? Number((pesosCarne.reduce((a: number, b: number) => a + b, 0) / pesosCarne.length).toFixed(1))
                : 0;

            // Peso promedio actual del hato
            const pesosAnimales = animals
                .map((a: any) => Number(a.peso_actual || 0))
                .filter((p: number) => p > 0);
            const pesoPromedioAnimales = pesosAnimales.length > 0
                ? Number((pesosAnimales.reduce((a: number, b: number) => a + b, 0) / pesosAnimales.length).toFixed(1))
                : 0;

            // ================================================================
            // KPIs NUEVOS — Reproducción
            // ================================================================
            // Tasa de concepción global (todas las montas con diagnóstico)
            const montasConDiag = repro.filter((r: any) =>
                r.estado === 'Confirmada' || r.estado === 'Fallida'
            );
            const montasConfirmadasTotal = montasConDiag.filter((r: any) => r.estado === 'Confirmada');
            const tasaConcepcionTotal = montasConDiag.length > 0
                ? Number((montasConfirmadasTotal.length / montasConDiag.length * 100).toFixed(1))
                : 0;

            // Vacas en evaluación (montas sin diagnóstico todavía)
            const vacasEnEvaluacion = repro.filter((r: any) => r.estado === 'En Evaluación').length;

            // Intervalo entre partos: se estima desde la fecha de la monta confirmada + 283 días (gestación bovina).
            // La BD no guarda fecha_parto real, así que usamos la fecha estimada para cada vaca.
            // Solo se consideran vacas con ≥ 2 partos registrados y se filtran intervalos < 200 días (inválidos).
            const fechaEstimadaPorVaca: Record<string, number[]> = {};
            for (const p of partos) {
                const animalId = p.diagnostico_prenez?.monta?.hembra?.animal_id;
                if (!animalId) continue;
                // Preferimos la fecha de la monta (más precisa biológicamente)
                const fechaMonta = p.diagnostico_prenez?.monta?.fecha_programacion;
                let ts: number | null = null;
                if (fechaMonta) {
                    const d = new Date(fechaMonta);
                    d.setDate(d.getDate() + 283); // +283 días = gestación bovina promedio
                    ts = d.getTime();
                } else {
                    // Fallback: fecha_creacion del parto (solo si no hay monta)
                    const fallback = p.fecha_creacion;
                    if (fallback) ts = new Date(fallback).getTime();
                }
                if (ts && !isNaN(ts)) {
                    if (!fechaEstimadaPorVaca[animalId]) fechaEstimadaPorVaca[animalId] = [];
                    fechaEstimadaPorVaca[animalId].push(ts);
                }
            }
            const intervalos: number[] = [];
            for (const timestamps of Object.values(fechaEstimadaPorVaca)) {
                if (timestamps.length < 2) continue;
                const sorted = timestamps.sort((a, b) => a - b);
                for (let i = 1; i < sorted.length; i++) {
                    const diff = Math.round((sorted[i] - sorted[i - 1]) / 86_400_000);
                    if (diff >= 200) intervalos.push(diff); // Filtrar intervalos imposibles
                }
            }
            const intervaloEntrePartos = intervalos.length > 0
                ? Math.round(intervalos.reduce((a, b) => a + b, 0) / intervalos.length)
                : null;

            // ================================================================
            // KPIs NUEVOS — Salud & Inventario
            // ================================================================
            const tratamientosPendientes = salud.filter((t: any) => t.estado !== 'Completado').length;

            // Top 3 enfermedades / diagnósticos del mes
            const enfermedadesMes = salud.filter((t: any) => {
                const f = t.fecha || t.fecha_creacion;
                if (!f) return false;
                const d = getLocalDateObj(f);
                return d && d.getMonth() === mesActual && d.getFullYear() === anoActual;
            });
            const enfCount: Record<string, number> = {};
            for (const t of enfermedadesMes) {
                const nombre = t.diagnostico || t.tipo || t.enfermedad || 'Sin diagnóstico';
                enfCount[nombre] = (enfCount[nombre] || 0) + 1;
            }
            const enfermedadesTop = Object.entries(enfCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([nombre, count]) => ({ nombre, count }));

            // Mortalidad: animales con fecha_eliminacion en el mes actual
            const mortalidadMes = animals.filter((a: any) => {
                if (!a.fecha_eliminacion) return false;
                const d = getLocalDateObj(a.fecha_eliminacion);
                return d && d.getMonth() === mesActual && d.getFullYear() === anoActual;
            }).length;

            // Animales nuevos en los últimos 30 días
            const hace30 = new Date();
            hace30.setDate(hace30.getDate() - 30);
            const animalesNuevosMes = animals.filter((a: any) => {
                const f = a.fecha_creacion;
                return f && new Date(f) >= hace30;
            }).length;

            // ================================================================
            // Charts
            // ================================================================
            // Tendencia 7 días
            const ultimos7Dias = Array.from({ length: 7 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;
                const totalLeche = rLeche
                    .filter((r: any) => r.fecha === dateStr)
                    .reduce((s: number, r: any) => s + Number(r.cantidad || 0), 0);
                const totalCarne = rCarne
                    .filter((r: any) => r.fecha === dateStr)
                    .reduce((s: number, r: any) => s + Number(r.pesoCanal || 0), 0);
                return {
                    fecha: d.toLocaleDateString('es-NI', { day: 'numeric', month: 'short' }),
                    leche: totalLeche,
                    carne: totalCarne,
                };
            });

            // Distribución estado reproductivo (mantenemos por si se usa en otro lugar)
            const estadosCount = animals.reduce((acc: any, a: any) => {
                const estado = a.estado_reproductivo || 'Sin estado';
                acc[estado] = (acc[estado] || 0) + 1;
                return acc;
            }, {});
            const distribution = Object.entries(estadosCount)
                .map(([name, value]) => ({ name, value }));

            // Donut de montas por estado (datos significativos)
            const montasEstadoCount: Record<string, number> = {};
            for (const m of repro) {
                const estado = m.estado || 'Sin estado';
                montasEstadoCount[estado] = (montasEstadoCount[estado] || 0) + 1;
            }
            // Orden lógico: Confirmada, En Evaluación, Fallida, Parto Exitoso, Aborto
            const MONTA_ORDER = ['Confirmada', 'En Evaluación', 'Fallida', 'Parto Exitoso', 'Aborto'];
            const montasChart = [
                ...MONTA_ORDER.filter(k => montasEstadoCount[k] !== undefined)
                    .map(k => ({ name: k, value: montasEstadoCount[k] })),
                ...Object.entries(montasEstadoCount)
                    .filter(([k]) => !MONTA_ORDER.includes(k))
                    .map(([name, value]) => ({ name, value }))
            ];

            // Donut del mes actual (misma lógica filtrada al mes)
            const montasEstadoCountMes: Record<string, number> = {};
            for (const m of montasEsteMes) {
                const estado = m.estado || 'Sin estado';
                montasEstadoCountMes[estado] = (montasEstadoCountMes[estado] || 0) + 1;
            }
            const montasChartMes = [
                ...MONTA_ORDER.filter(k => montasEstadoCountMes[k] !== undefined)
                    .map(k => ({ name: k, value: montasEstadoCountMes[k] })),
                ...Object.entries(montasEstadoCountMes)
                    .filter(([k]) => !MONTA_ORDER.includes(k))
                    .map(([name, value]) => ({ name, value }))
            ];

            // Eventos de salud por día (últimos 7)
            const saludTrend = Array.from({ length: 7 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                const dateStr = d.toISOString().split('T')[0];
                const count = salud.filter((t: any) =>
                    (t.fecha || t.fecha_creacion)?.split('T')[0] === dateStr
                ).length;
                return {
                    fecha: d.toLocaleDateString('es-NI', { day: 'numeric', month: 'short' }),
                    eventos: count,
                };
            });

            // Chart enfermedades del mes (para bar chart)
            const enfermedadesChart = Object.entries(enfCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6)
                .map(([name, value]) => ({ name, value }));

            setData({
                totalAnimals: animals.length,
                productionToday: produccionHoy,
                inTreatment: tratamientosPendientes,
                reproEventsMonth: montasEsteMes.length,
                vacasPreñadas,
                tasaPreñez,
                partosMes,
                productionTrend: ultimos7Dias,
                distribution,
                montasChart,
                montasChartMes,
                healthEvents: saludTrend,
                registrosLeche: rLeche,
                registrosCarne: rCarne,
                // nuevos
                litrosPorVacaLactante,
                pesoPromedioCanal,
                pesoPromedioAnimales,
                tasaConcepcionTotal,
                intervaloEntrePartos,
                vacasEnEvaluacion,
                partosTotales: partos.length,
                tratamientosPendientes,
                enfermedadesTop,
                mortalidadMes,
                animalesNuevosMes,
                // guardamos chart extra en healthEvents para enfermedades
                // (lo pasamos como propiedad separada abajo dentro del closure)
                _enfermedadesChart: enfermedadesChart,
            } as any);
        } catch (err) {
            console.error(err);
            setError('No se pudieron cargar los datos del dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                <p className="text-zinc-500 font-medium animate-pulse">Sincronizando datos del hato...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-8 text-center bg-red-50 border border-red-100 rounded-2xl">
                <p className="text-red-600 font-bold">{error}</p>
                <Button onClick={fetchData} variant="outline" className="mt-4 gap-2">
                    <RefreshCw className="w-4 h-4" /> Reintentar
                </Button>
            </div>
        );
    }

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];
    // Mapa fijo nombre→color: independiente del orden o cantidad de estados presentes
    const MONTA_COLOR_MAP: Record<string, string> = {
        'Confirmada': '#10b981', // verde
        'En Evaluación': '#8486e2', // lavanda
        'Fallida': '#ef4444', // rojo
        'Parto Exitoso': '#3b82f6', // azul
        'Aborto': '#1a0f0a', // negro
    };
    const MONTA_COLOR_FALLBACK = '#a855f7'; // morado para estados desconocidos
    const d = data as any; // para acceder a _enfermedadesChart

    return (
        <div className="space-y-8 animate-in fade-in duration-700">

            {/* ── Header barra de reportes ── */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-5 bg-white rounded-2xl border border-zinc-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-zinc-900">PANEL DE CONTROL</h2>
                    <p className="text-xs text-zinc-400 mt-0.5">Resumen general del hato · Datos en tiempo real</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                        onClick={() => setReportModalOpen(true)}
                        className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-wider text-[11px] h-10 gap-2 px-6 rounded-xl shadow-sm"
                    >
                        <FileText className="w-4 h-4" />
                        Generar Reporte
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchData}
                        className="flex-1 sm:flex-none bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-700 gap-2 text-[11px] font-bold uppercase tracking-wider h-10 px-6 rounded-xl transition-all"
                    >
                        <RefreshCw className="w-3.5 h-3.5" /> Actualizar
                    </Button>
                </div>
            </div>

            {/* ── KPIs principales (fila top) ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KPICard title="Total Hato" value={data.totalAnimals} subtitle="Animales registrados" icon={Users} color="blue" />
                <KPICard title="Leche Hoy" value={`${data.productionToday} L`} subtitle="Producción diaria" icon={Milk} color="emerald" />
                <KPICard title="Vacas Preñadas" value={data.vacasPreñadas} subtitle="Montas confirmadas" icon={Heart} color="amber" />
                <KPICard title="Alerta Sanitaria" value={data.tratamientosPendientes} subtitle="Tratamientos en curso" icon={Syringe} color="rose" alert={data.tratamientosPendientes > 0} />
            </div>

            {/* ── Tabs principales ── */}
            <Tabs defaultValue="produccion" className="space-y-12">
                <TabsList className="bg-gray-200 border border-zinc-400 rounded-xl">
                    <TabsTrigger value="produccion" className="w-[250px]">Producción</TabsTrigger>
                    <TabsTrigger value="reproduccion" className="w-[250px]">Reproducción</TabsTrigger>
                    <TabsTrigger value="salud" className="w-[250px]">Salud & Inventario</TabsTrigger>
                </TabsList>

                {/* ══════════ TAB PRODUCCIÓN ══════════ */}
                <TabsContent value="produccion" className="space-y-6">
                    {/* KPIs de producción */}
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-2">
                        <KPICard
                            title="Peso Prom. Canal"
                            value={data.pesoPromedioCanal > 0 ? `${data.pesoPromedioCanal} kg` : '—'}
                            subtitle="Promedio registros de carne"
                            icon={Scale}
                            color="orange"
                        />
                        <KPICard
                            title="Peso Prom. Hato"
                            value={data.pesoPromedioAnimales > 0 ? `${data.pesoPromedioAnimales} kg` : '—'}
                            subtitle="Peso actual promedio"
                            icon={Scale}
                            color="violet"
                        />
                    </div>

                    {/* Gráfica tendencia */}
                    <Card className="border-none shadow-sm">
                        <CardHeader className="bg-zinc-50/50 border-b border-zinc-100">
                            <CardTitle className="text-sm font-black uppercase text-zinc-600 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                Tendencia de Producción — Últimos 7 días
                            </CardTitle>
                            <CardDescription>Litros de leche y kg de carne por día</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data.productionTrend}>
                                        <defs>
                                            <linearGradient id="gLeche" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="gCarne" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                                        <XAxis dataKey="fecha" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                        <Legend verticalAlign="top" height={36} />
                                        <Area type="monotone" dataKey="leche" name="Leche (L)" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#gLeche)" />
                                        <Area type="monotone" dataKey="carne" name="Carne (kg)" stroke="#f97316" strokeWidth={2.5} fillOpacity={1} fill="url(#gCarne)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ══════════ TAB REPRODUCCIÓN ══════════ */}
                <TabsContent value="reproduccion" className="space-y-6">
                    {/* KPIs de reproducción */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <KPICard
                            title="Tasa de Preñez (mes)"
                            value={`${data.tasaPreñez}%`}
                            subtitle={`${data.reproEventsMonth} montas este mes`}
                            icon={Heart}
                            color="amber"
                        />
                        <KPICard
                            title="Concepción Global"
                            value={`${data.tasaConcepcionTotal}%`}
                            subtitle="Todas las montas evaluadas"
                            icon={CheckCircle2}
                            color="emerald"
                        />
                        <KPICard
                            title="En Evaluación"
                            value={data.vacasEnEvaluacion}
                            subtitle="Montas sin diagnóstico"
                            icon={FlaskConical}
                            color="cyan"
                            alert={data.vacasEnEvaluacion > 0}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Donut: Estado de montas (datos reales y significativos) */}
                        <Card className="border-none shadow-sm">
                            <CardHeader className="bg-zinc-50/50 border-b border-zinc-100">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <div>
                                        <CardTitle className="text-sm font-black uppercase text-zinc-600 flex items-center gap-2">
                                            <Heart className="w-4 h-4 text-amber-500" />
                                            Resultado de Montas
                                        </CardTitle>
                                        <CardDescription className="mt-0.5">
                                            {montasScope === 'total' ? 'Histórico — todas las montas' : 'Mes actual'}
                                        </CardDescription>
                                    </div>
                                    {/* Toggle Total / Mes */}
                                    <div className="flex gap-1 bg-zinc-100 p-0.5 rounded-lg">
                                        <button
                                            onClick={() => setMontasScope('total')}
                                            className={cn(
                                                'text-[11px] font-bold px-3 py-1 rounded-md transition-all',
                                                montasScope === 'total'
                                                    ? 'bg-white text-zinc-800 shadow-sm'
                                                    : 'text-zinc-400 hover:text-zinc-600'
                                            )}
                                        >
                                            Histórico
                                        </button>
                                        <button
                                            onClick={() => setMontasScope('mes')}
                                            className={cn(
                                                'text-[11px] font-bold px-3 py-1 rounded-md transition-all',
                                                montasScope === 'mes'
                                                    ? 'bg-white text-zinc-800 shadow-sm'
                                                    : 'text-zinc-400 hover:text-zinc-600'
                                            )}
                                        >
                                            Este mes
                                        </button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {(() => {
                                    const chartData = montasScope === 'total' ? data.montasChart : data.montasChartMes;
                                    const total = chartData.reduce((s: number, m: any) => s + m.value, 0);
                                    return chartData.length === 0 ? (
                                        <p className="text-sm text-zinc-400 text-center py-8">
                                            {montasScope === 'mes' ? 'Sin montas este mes' : 'Sin montas registradas'}
                                        </p>
                                    ) : (
                                        <div className="flex flex-col sm:flex-row items-center gap-6">
                                            <div className="relative w-[160px] h-[160px] shrink-0">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={chartData}
                                                            dataKey="value"
                                                            nameKey="name"
                                                            cx="50%" cy="50%"
                                                            innerRadius={48}
                                                            outerRadius={72}
                                                            paddingAngle={4}
                                                            startAngle={90}
                                                            endAngle={-270}
                                                        >
                                                            {chartData.map((item: any, i: number) => (
                                                                <Cell key={i} fill={MONTA_COLOR_MAP[item.name] ?? MONTA_COLOR_FALLBACK} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip
                                                            contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }}
                                                            formatter={(val: any, name: any) => [`${val} montas`, name]}
                                                        />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                    <span className="text-2xl font-black text-zinc-800">{total}</span>
                                                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Total</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2.5 flex-1 w-full">
                                                {chartData.map((item: any, i: number) => (
                                                    <div key={i} className="flex items-center gap-2">
                                                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: MONTA_COLOR_MAP[item.name] ?? MONTA_COLOR_FALLBACK }} />
                                                        <span className="text-xs text-zinc-500 flex-1">{item.name}</span>
                                                        <span className="text-xs font-black text-zinc-800">{item.value}</span>
                                                        <span className="text-[10px] text-zinc-400 w-9 text-right">
                                                            {total > 0 ? `${Math.round(item.value / total * 100)}%` : '0%'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </CardContent>
                        </Card>

                        {/* Resumen reproductivo detallado */}
                        <Card className="border-none shadow-sm">
                            <CardHeader className="bg-zinc-50/50 border-b border-zinc-100">
                                <CardTitle className="text-sm font-black uppercase text-zinc-600 flex items-center gap-2">
                                    <Baby className="w-4 h-4 text-amber-500" />
                                    Resumen Reproductivo
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-3">
                                {[
                                    { label: 'Vacas preñadas (activas)', value: data.vacasPreñadas, color: 'text-amber-600' },
                                    { label: 'Partos este mes', value: data.partosMes, color: 'text-emerald-600' },
                                    { label: 'Montas este mes', value: data.reproEventsMonth, color: 'text-blue-600' },
                                    { label: 'Montas en evaluación', value: data.vacasEnEvaluacion, color: 'text-cyan-600' },
                                    { label: 'Tasa de preñez del mes', value: `${data.tasaPreñez}%`, color: 'text-amber-600' },
                                    { label: 'Concepción global (total)', value: `${data.tasaConcepcionTotal}%`, color: 'text-emerald-600' },
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm p-3 bg-zinc-50 rounded-xl">
                                        <span className="text-zinc-500 text-xs font-medium">{item.label}</span>
                                        <span className={cn('font-black text-sm', item.color)}>{item.value}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* ══════════ TAB SALUD & INVENTARIO ══════════ */}
                <TabsContent value="salud" className="space-y-6">
                    {/* Solo los KPIs que NO están en la fila superior */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <KPICard
                            title="Mortalidad del Mes"
                            value={data.mortalidadMes}
                            subtitle="Bajas registradas este mes"
                            icon={Skull}
                            color="rose"
                            alert={data.mortalidadMes > 0}
                        />
                        <KPICard
                            title="Animales Nuevos"
                            value={data.animalesNuevosMes}
                            subtitle="Últimos 30 días"
                            icon={CalendarPlus}
                            color="emerald"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Top enfermedades */}
                        <Card className="border-none shadow-sm">
                            <CardHeader className="bg-zinc-50/50 border-b border-zinc-100">
                                <CardTitle className="text-sm font-black uppercase text-zinc-600 flex items-center gap-2">
                                    <FlaskConical className="w-4 h-4 text-rose-500" />
                                    Diagnósticos más frecuentes del mes
                                </CardTitle>
                                <CardDescription>Top enfermedades / tipos de tratamiento</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                {(d._enfermedadesChart || []).length === 0 ? (
                                    <div className="text-center py-10 text-zinc-400">
                                        <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">Sin tratamientos registrados este mes</p>
                                    </div>
                                ) : (
                                    <div className="h-[220px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={d._enfermedadesChart} layout="vertical">
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f1f1" />
                                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                                                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#555' }} width={100} />
                                                <Tooltip
                                                    cursor={{ fill: '#f8f8f8' }}
                                                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                    formatter={(v: any) => [v, 'Casos']}
                                                />
                                                <Bar dataKey="value" name="Casos" radius={[0, 4, 4, 0]} barSize={18}>
                                                    {(d._enfermedadesChart || []).map((_: any, i: number) => (
                                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}

                                {/* Badges top 3 */}
                                {data.enfermedadesTop.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-zinc-100">
                                        {data.enfermedadesTop.map((e, i) => (
                                            <Badge key={i} variant="secondary" className="text-xs gap-1.5">
                                                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: COLORS[i] }} />
                                                {e.nombre} · {e.count}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Tratamientos semanales */}
                        <Card className="border-none shadow-sm">
                            <CardHeader className="bg-zinc-50/50 border-b border-zinc-100">
                                <CardTitle className="text-sm font-black uppercase text-zinc-600 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-rose-500" />
                                    Tratamientos — Últimos 7 días
                                </CardTitle>
                                <CardDescription>Número de tratamientos registrados por día</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data.healthEvents}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                                            <XAxis dataKey="fecha" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                                            <Tooltip
                                                cursor={{ fill: '#f8f8f8' }}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                formatter={(v: number) => [v, 'Tratamientos']}
                                            />
                                            <Bar dataKey="eventos" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            <UniversalReportDialog
                isOpen={reportModalOpen}
                onClose={() => setReportModalOpen(false)}
                registrosLeche={data.registrosLeche}
                registrosCarne={data.registrosCarne}
            />
        </div>
    );
}
