'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Printer, Calendar, Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { RegistroProduccion, TipoProduccion } from '@/lib/types/produccion';
import { cn } from '@/lib/utils';

interface ProduccionReportDialogProps {
    registrosLeche: RegistroProduccion[];
    registrosCarne: RegistroProduccion[];
    tipoInicial: TipoProduccion;
}

type ReportRange = 'diario' | 'semanal' | 'mensual' | 'ultimo-mes' | 'anual' | 'personalizado';

export function ProduccionReportDialog({ registrosLeche, registrosCarne, tipoInicial }: ProduccionReportDialogProps) {
    const hoyStr = new Date().toISOString().split('T')[0];
    const primerDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    
    const [fechaInicio, setFechaInicio] = useState(primerDiaMes);
    const [fechaFin, setFechaFin] = useState(hoyStr);
    const [tipo, setTipo] = useState<TipoProduccion>(tipoInicial);
    const [preset, setPreset] = useState<ReportRange>('mensual');
    const [isOpen, setIsOpen] = useState(false);

    // Obtener datos del usuario y finca de localStorage
    const usuarioStr = typeof window !== 'undefined' ? localStorage.getItem('usuario') : null;
    const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
    const fincaNombre = usuario?.finca?.nombre || 'Mi Finca';
    const userName = usuario?.nombre || 'Usuario';

    const now = new Date();
    const generationTime = now.toLocaleString('es-NI', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    // Filtrar registros por rango y tipo
    const filtrarPorRango = () => {
        const start = new Date(fechaInicio);
        start.setHours(0, 0, 0, 0);
        const end = new Date(fechaFin);
        end.setHours(23, 59, 59, 999);
        
        const source = tipo === 'leche' ? registrosLeche : registrosCarne;

        return source.filter((r: RegistroProduccion) => {
            const fechaReg = new Date(r.fecha);
            return fechaReg >= start && fechaReg <= end;
        });
    };

    const handlePresetChange = (p: ReportRange) => {
        setPreset(p);
        const hoy = new Date();
        const hoyS = hoy.toISOString().split('T')[0];
        
        switch (p) {
            case 'diario':
                setFechaInicio(hoyS);
                setFechaFin(hoyS);
                break;
            case 'semanal':
                const hace7 = new Date(hoy);
                hace7.setDate(hoy.getDate() - 7);
                setFechaInicio(hace7.toISOString().split('T')[0]);
                setFechaFin(hoyS);
                break;
            case 'mensual':
                const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
                setFechaInicio(inicioMes.toISOString().split('T')[0]);
                setFechaFin(hoyS);
                break;
            case 'ultimo-mes':
                const inicioMesPasado = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
                const finMesPasado = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
                setFechaInicio(inicioMesPasado.toISOString().split('T')[0]);
                setFechaFin(finMesPasado.toISOString().split('T')[0]);
                break;
            case 'anual':
                const inicioAnio = new Date(hoy.getFullYear(), 0, 1);
                setFechaInicio(inicioAnio.toISOString().split('T')[0]);
                setFechaFin(hoyS);
                break;
            default:
                break;
        }
    };

    const registrosFiltrados = filtrarPorRango();
    const totalProduccion = registrosFiltrados.reduce((sum: number, r: RegistroProduccion) => {
        const val = tipo === 'leche' ? Number(r.cantidad || 0) : Number(r.pesoCanal || 0);
        return sum + val;
    }, 0);

    const getRangeLabel = () => {
        const start = new Date(fechaInicio);
        const end = new Date(fechaFin);
        const format = { day: 'numeric', month: 'numeric', year: 'numeric' } as const;
        
        if (fechaInicio === fechaFin) {
            return start.toLocaleDateString('es-NI', { day: 'numeric', month: 'long', year: 'numeric' });
        }
        return `del ${start.toLocaleDateString('es-NI', format)} al ${end.toLocaleDateString('es-NI', format)}`;
    };

    const handlePrint = () => {
        const printContent = document.getElementById('report-content');
        if (!printContent) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Reporte de Producción - ${fincaNombre}</title>
                    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                    <style>
                        body { font-family: sans-serif; padding: 40px; color: #18181b; }
                        @page { size: portrait; margin: 0; }
                        .bg-zinc-500 { background-color: #71717a !important; }
                        .text-white { color: #ffffff !important; }
                        .text-zinc-900 { color: #18181b !important; }
                        .text-zinc-600 { color: #52525b !important; }
                        .text-zinc-100 { color: #f4f4f5 !important; }
                        .border-zinc-800 { border-color: #27272a !important; }
                        .bg-blue-600 { background-color: #2563eb !important; }
                    </style>
                </head>
                <body class="bg-white">
                    <div class="max-w-4xl mx-auto">
                        ${printContent.innerHTML}
                    </div>
                    <script>
                        window.onload = () => {
                            window.print();
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <FileText className="w-4 h-4" />
                    Generar Reporte
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Configurar Reporte de Producción</DialogTitle>
                    <DialogDescription>
                        Selecciona el tipo de producción y el rango de tiempo.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mb-6 bg-zinc-50 p-6 rounded-lg border border-zinc-200 shadow-sm">
                    {/* Sección: Más Recientes */}
                    <div>
                        <h3 className="text-[10px] font-black uppercase text-zinc-400 mb-3 flex items-center gap-2">
                            <span className="w-1 h-1 bg-zinc-400 rounded-full" />
                            Selección Rápida (Más Recientes)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-zinc-500">Tipo de Producción</Label>
                                <Select value={tipo} onValueChange={(v: TipoProduccion) => setTipo(v)}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="leche">Leche</SelectItem>
                                        <SelectItem value="carne">Carne</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-zinc-500">Periodo Predefinido</Label>
                                <Select value={preset} onValueChange={(v: ReportRange) => handlePresetChange(v)}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="diario">Hoy</SelectItem>
                                        <SelectItem value="semanal">Semanal</SelectItem>
                                        <SelectItem value="mensual">Este Mes</SelectItem>
                                        <SelectItem value="ultimo-mes">Mes Pasado</SelectItem>
                                        <SelectItem value="anual">Este Año</SelectItem>
                                        <SelectItem value="personalizado">Personalizado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {preset === 'personalizado' && (
                        <>
                            <div className="h-px bg-zinc-200" />
                            {/* Sección: Rango Específico */}
                            <div>
                                <h3 className="text-[10px] font-black uppercase text-zinc-400 mb-3 flex items-center gap-2">
                                    <span className="w-1 h-1 bg-zinc-400 rounded-full" />
                                    Rango Específico (Manual)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase text-zinc-500">Fecha Desde</Label>
                                        <Input 
                                            type="date" 
                                            value={fechaInicio} 
                                            max={fechaFin || hoyStr}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                setFechaInicio(e.target.value);
                                                setPreset('personalizado');
                                            }}
                                            className="h-9"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase text-zinc-500">Fecha Hasta</Label>
                                        <Input 
                                            type="date" 
                                            value={fechaFin} 
                                            max={hoyStr}
                                            min={fechaInicio}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                setFechaFin(e.target.value);
                                                setPreset('personalizado');
                                            }}
                                            className="h-9"
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="flex justify-end pt-2">
                        <Button onClick={handlePrint} className="h-10 bg-zinc-800 hover:bg-zinc-900 gap-2 font-black uppercase text-[11px] tracking-widest px-10 shadow-lg">
                            <Printer className="w-4 h-4" />
                            Imprimir / Guardar PDF
                        </Button>
                    </div>
                </div>

                {/* Report Preview / Print Area */}
                <div id="report-content" className="bg-white p-8 border rounded-lg shadow-sm print:border-0 print:shadow-none print:p-0">
                    {/* UNI Header Style */}
                    <div className="text-center mb-8 pb-4 border-b-2 border-zinc-800">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-left">
                                <h1 className="text-xl font-bold uppercase tracking-tight text-zinc-900">{fincaNombre}</h1>
                                <p className="text-xs font-bold text-zinc-600 uppercase">Control de Producción Ganadera</p>
                            </div>
                            <div className="text-right text-[10px] text-zinc-500 font-mono">
                                {generationTime}
                            </div>
                        </div>
                        <h2 className="text-lg font-black uppercase mt-4 underline underline-offset-4">
                            HISTORIAL DE PRODUCCIÓN DE {tipo === 'leche' ? 'LECHE' : 'CARNE'}
                        </h2>
                    </div>

                    {/* Meta Info Area */}
                    <div className="grid grid-cols-2 gap-y-2 text-sm mb-8">
                        <div className="flex gap-2">
                            <span className="font-bold uppercase w-32">Generado por:</span>
                            <span className="text-zinc-700">{userName}</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="font-bold uppercase w-32">Periodo:</span>
                            <span className="text-zinc-700 font-bold uppercase">{preset.replace('-', ' ')} ({getRangeLabel()})</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="font-bold uppercase w-32">Finca:</span>
                            <span className="text-zinc-700">{fincaNombre}</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="font-bold uppercase w-32">Tipo:</span>
                            <span className="text-zinc-700 uppercase">{tipo}</span>
                        </div>
                    </div>

                    {/* Table Area */}
                    <div className="border-t-2 border-zinc-800">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-100 text-[11px] font-black uppercase border-b border-zinc-800">
                                    <th className="py-2 px-2">Animal / Identificación</th>
                                    <th className="py-2 px-2">Fecha de Registro</th>
                                    <th className="py-2 px-2">Etiqueta Generada</th>
                                    <th className="py-2 px-2 text-right">Cantidad / Peso</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs">
                                {registrosFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-zinc-400 italic">
                                            No se encontraron registros para el periodo seleccionado.
                                        </td>
                                    </tr>
                                ) : (
                                    registrosFiltrados.map((r: RegistroProduccion, i: number) => (
                                        <tr key={r.id} className={cn(
                                            "border-b border-zinc-100",
                                            i % 2 === 0 ? "bg-white" : "bg-zinc-50/50"
                                        )}>
                                            <td className="py-2 px-2 font-bold uppercase">{r.nombreAnimal} ({r.arete})</td>
                                            <td className="py-2 px-2">{r.fecha}</td>
                                            <td className="py-2 px-2 font-mono text-[10px]">{r.numeroProduccion || 'N/A'}</td>
                                            <td className="py-2 px-2 text-right font-bold">
                                                {tipo === 'leche' ? `${Number(r.cantidad || 0).toFixed(2)} L` : `${Number(r.pesoCanal || 0).toFixed(2)} kg`}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals Bar */}
                    <div className="mt-6 flex justify-end">
                        <div className="w-full md:w-2/3 bg-zinc-500 text-white p-4 rounded-sm flex justify-between items-center shadow-md">
                            <span className="text-[12px] font-black uppercase tracking-wider">Total Producción Acumulada</span>
                            <span className="text-sm font-black">
                                {totalProduccion.toFixed(2)} {tipo === 'leche' ? 'Litros' : 'kg'}
                            </span>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-12 pt-4 border-t border-zinc-200 text-[10px] text-zinc-400 flex justify-between uppercase font-bold">
                        <span>Sistema de Gestión Bovino - Módulo de Reportes</span>
                        <span>Finca: {fincaNombre}</span>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
}
