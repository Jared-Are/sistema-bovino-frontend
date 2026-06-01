'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Users,
    Milk,
    Activity,
    Heart,
    TrendingUp,
    PieChart as PieChartIcon,
    RefreshCw,
    Loader2,
    Syringe,
    ArrowUpRight,
    ArrowDownRight,
    FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UniversalReportDialog } from './universal-report-dialog';
import type { RegistroProduccion, LecheBackend, CarneBackend } from '@/lib/types/produccion';
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
    Legend
} from 'recharts';
import { cn } from '@/lib/utils';

const getLocalDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
        // Al instanciar new Date con una cadena ISO (ej: 2026-03-29T00:00:00Z)
        // el navegador automáticamente ajusta la fecha al timezone local del cliente (ej: Nicaragua UTC-6 devuelve 28)
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString.split('T')[0];
        
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch {
        return dateString.split('T')[0];
    }
}

// --- Types ---
interface DashboardData {
    totalAnimals: number;
    productionToday: number;
    inTreatment: number;
    reproEventsMonth: number;
    vacasPreñadas: number;
    tasaPreñez: number;
    partosMes: number;
    nuevosAnimales: number;
    productionTrend: any[];
    distribution: any[];
    healthEvents: any[];
    registrosLeche: RegistroProduccion[];
    registrosCarne: RegistroProduccion[];
}

// --- Helper Components ---
const KPICard = ({ title, value, subtitle, icon: Icon, color, trend }: any) => {
    const colorVariants = {
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        rose: "bg-rose-50 text-rose-600 border-rose-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
    };

    return (
        <Card className="hover:shadow-md transition-all">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">{title}</p>
                        <h3 className="text-3xl font-black text-zinc-900 mt-1">{value}</h3>
                        <div className="flex items-center gap-1.5 mt-2">
                            <p className="text-xs text-zinc-400">{subtitle}</p>
                        </div>
                    </div>
                    <div className={cn("p-3 rounded-2xl", colorVariants[color as keyof typeof colorVariants])}>
                        <Icon className="w-6 h-6" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export function DashboardSection() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<DashboardData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [reportModalOpen, setReportModalOpen] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const baseUrl = process.env.NEXT_PUBLIC_API_URL;

            // Fetching from correct endpoints
            const [respAnimals, respLeche, respCarne, respSalud, respRepro, respPartos] = await Promise.all([
                fetch(`${baseUrl}/animales`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${baseUrl}/produccion/leche`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${baseUrl}/produccion/carne`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${baseUrl}/salud/tratamientos`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${baseUrl}/reproduccion/montas`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${baseUrl}/reproduccion/partos`, { headers: { 'Authorization': `Bearer ${token}` } }),
            ]);

            const [animalsData, lecheData, carneData, saludData, reproData, partosData] = await Promise.all([
                respAnimals.json(),
                respLeche.json(),
                respCarne.json(),
                respSalud.json(),
                respRepro.json(),
                respPartos.json(),
            ]);

            const animals = Array.isArray(animalsData) ? animalsData : [];
            const leche = Array.isArray(lecheData) ? lecheData : [];
            const salud = Array.isArray(saludData) ? saludData : [];
            const repro = Array.isArray(reproData) ? reproData : [];
            const partos = Array.isArray(partosData) ? partosData : [];

            // Mapeo para Reporte de Producción (Manteniendo lógica original de produccion-section.tsx)
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
                    id: b.id.toString(),
                    tipo: 'carne',
                    animalId: b.animal?.animal_id?.toString() || '',
                    arete: b.animal?.arete || 'N/A',
                    nombreAnimal: b.animal?.nombre || 'Sin nombre',
                    pesoCanal: b.peso_canal,
                    numeroProduccion: numeroProduccion,
                    fecha: dateStr,
                    animal: b.animal,
                };
            };

            const rLeche = Array.isArray(lecheData) ? lecheData.map(mapLeche) : [];
            const rCarne = Array.isArray(carneData) ? carneData.map(mapCarne) : [];

            // Cálculos
            const hoy = new Date().toISOString().split('T')[0];
            const produccionHoy = rLeche
                .filter((r: any) => r.fecha === hoy)
                .reduce((sum: number, r: any) => sum + Number(r.cantidad || 0), 0);

            const enTratamiento = salud.filter((t: any) => t.estado !== 'Completado').length;

            const mesActual = new Date().getMonth();
            const montasEsteMes = repro.filter((r: any) => {
                const rFecha = r.fecha || r.fecha_creacion;
                return rFecha && new Date(rFecha).getMonth() === mesActual;
            }).length;

            // Vacas preñadas basadas en montas confirmadas (que no han tenido parto aún)
            const vacasPreñadas = repro.filter((r: any) => r.estado === 'Confirmada').length;

            const partosMes = partos.filter((p: any) => {
                const pFecha = p.fecha_parto || p.fecha_creacion;
                return pFecha && new Date(pFecha).getMonth() === mesActual;
            }).length;

            // Tasa de preñez basada en las montas del mes actual
            const montasTotalesMes = repro.filter((r: any) => {
                const rFecha = r.fecha || r.fecha_creacion;
                return rFecha && new Date(rFecha).getMonth() === mesActual;
            });
            const montasConfirmadasMes = montasTotalesMes.filter((r: any) => r.estado === 'Confirmada');
            
            const tasaPreñez = montasTotalesMes.length > 0 
                ? Number((montasConfirmadasMes.length / montasTotalesMes.length * 100).toFixed(1)) 
                : 0;

            // Tendencia de producción (últimos 7 días)
            const ultimos7Dias = Array.from({ length: 7 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                
                // Formato YYYY-MM-DD local
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;

                const totalLeche = rLeche
                    .filter((r: any) => r.fecha === dateStr)
                    .reduce((sum: number, r: any) => sum + Number(r.cantidad || 0), 0);
                const totalCarne = rCarne
                    .filter((r: any) => r.fecha === dateStr)
                    .reduce((sum: number, r: any) => sum + Number(r.pesoCanal || 0), 0);
                return {
                    fecha: d.toLocaleDateString('es-NI', { day: 'numeric', month: 'short' }),
                    leche: totalLeche,
                    carne: totalCarne
                };
            });

            // Distribución por estado reproductivo
            const estadosCount = animals.reduce((acc: any, a: any) => {
                const estado = a.estado_reproductivo || 'Desconocido';
                acc[estado] = (acc[estado] || 0) + 1;
                return acc;
            }, {});

            const distribution = Object.entries(estadosCount).map(([name, value]) => ({ name, value }));

            // Eventos de salud por día
            const saludTrend = Array.from({ length: 7 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                const dateStr = d.toISOString().split('T')[0];
                const count = salud.filter((t: any) => (t.fecha || t.fecha_creacion)?.split('T')[0] === dateStr).length;
                return {
                    fecha: d.toLocaleDateString('es-NI', { day: 'numeric' }),
                    eventos: count
                };
            });

            setData({
                totalAnimals: animals.length,
                productionToday: produccionHoy,
                inTreatment: enTratamiento,
                reproEventsMonth: montasEsteMes,
                vacasPreñadas,
                tasaPreñez,
                partosMes,
                nuevosAnimales: vacasPreñadas,
                productionTrend: ultimos7Dias,
                distribution,
                healthEvents: saludTrend,
                registrosLeche: rLeche,
                registrosCarne: rCarne
            });
        } catch (err) {
            console.error(err);
            setError("No se pudieron cargar los datos del dashboard");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Registro de Reportes Unificado */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-5 bg-white rounded-2xl border border-zinc-200 shadow-sm mb-6">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900">
                        PANEL DE REPORTES
                    </h2>
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
                        Actualizar
                    </Button>
                </div>
            </div>

            {/* KPI Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Total Hato"
                    value={data.totalAnimals}
                    subtitle="Animales registrados"
                    icon={Users}
                    color="blue"
                />
                <KPICard
                    title="Leche Hoy"
                    value={`${data.productionToday} L`}
                    subtitle="Producción diaria"
                    icon={Milk}
                    color="emerald"
                />
                <KPICard
                    title="Salud / Alerta"
                    value={data.inTreatment}
                    subtitle="En tratamiento"
                    icon={Syringe}
                    color="rose"
                />
                <KPICard
                    title="Reproducción"
                    value={data.reproEventsMonth}
                    subtitle="Montas este mes"
                    icon={Heart}
                    color="amber"
                />
            </div>


            {/* Charts Section */}
            <Tabs defaultValue="overview" className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <TabsList className="bg-white border border-zinc-200">
                        <TabsTrigger value="overview">Producción</TabsTrigger>
                        <TabsTrigger value="health">Salud y Estado</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="overview">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2 overflow-hidden border-none shadow-sm">
                            <CardHeader className="bg-zinc-50/50 border-b border-zinc-100">
                                <CardTitle className="text-sm font-black uppercase text-zinc-600 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                                    Tendencia de Producción Lechera
                                </CardTitle>
                                <CardDescription>Producción total de los últimos 7 días</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={data.productionTrend}>
                                            <defs>
                                                <linearGradient id="colorLeche" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorCarne" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                                            <XAxis
                                                dataKey="fecha"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 10, fill: '#888' }}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 10, fill: '#888' }}
                                            />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            />
                                            <Legend verticalAlign="top" height={36} />
                                            <Area
                                                type="monotone"
                                                dataKey="leche"
                                                name="Leche (L)"
                                                stroke="#10b981"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorLeche)"
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="carne"
                                                name="Carne (kg)"
                                                stroke="#f59e0b"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorCarne)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm overflow-hidden text-center">
                            <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 items-center">
                                <CardTitle className="text-sm font-black uppercase text-zinc-600 flex items-center gap-2">
                                    <Heart className="w-4 h-4 text-amber-500" />
                                    Resumen Reproductivo
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 flex flex-col items-center justify-center">
                                <div className="text-6xl font-black text-amber-500 mb-2">{data.vacasPreñadas}</div>
                                <div className="text-xs font-bold uppercase text-zinc-400 tracking-widest">Vacas Preñadas Actuales</div>
                                <div className="mt-8 space-y-3 w-full">
                                    <div className="flex justify-between items-center text-sm p-3 bg-zinc-50 rounded-xl">
                                        <span className="font-medium text-zinc-600">Montas del Mes</span>
                                        <span className="font-black">{data.reproEventsMonth}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm p-3 bg-zinc-50 rounded-xl">
                                        <span className="font-medium text-zinc-600">Tasa de Preñez Hato</span>
                                        <span className="font-black text-emerald-600">{data.tasaPreñez}%</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="health">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-none shadow-sm overflow-hidden flex flex-col justify-center min-h-[300px] border border-dashed border-zinc-200">
                            <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center">
                                <div className="p-4 bg-zinc-100 rounded-full mb-4">
                                    <Users className="w-8 h-8 text-zinc-400" />
                                </div>
                                <h3 className="text-lg font-bold text-zinc-700">En construcción...</h3>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm overflow-hidden">
                            <CardHeader className="bg-zinc-50/50 border-b border-zinc-100">
                                <CardTitle className="text-sm font-black uppercase text-zinc-600 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-rose-500" />
                                    Tratamientos Semanales
                                </CardTitle>
                                <CardDescription>Número de tratamientos diarios</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data.healthEvents}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                                            <XAxis
                                                dataKey="fecha"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 10, fill: '#888' }}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 10, fill: '#888' }}
                                            />
                                            <Tooltip
                                                cursor={{ fill: '#f8f8f8' }}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                formatter={(value: number) => [value, 'Tratamientos']}
                                            />
                                            <Bar
                                                dataKey="eventos"
                                                fill="#ef4444"
                                                radius={[4, 4, 0, 0]}
                                                barSize={20}
                                            />
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
