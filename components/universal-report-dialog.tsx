'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Printer,
  Calendar as CalendarIcon,
  Loader2,
  Table as TableIcon,
  Milk,
  Activity,
  Heart,
  Users
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import {
  Dialog as ShadDialog,
  DialogContent as ShadDialogContent,
  DialogHeader as ShadDialogHeader,
  DialogTitle as ShadDialogTitle,
  DialogDescription as ShadDialogDescription,
  DialogFooter as ShadDialogFooter,
} from "@/components/ui/dialog";
import type { RegistroProduccion } from '@/lib/types/produccion';
import { cn } from '@/lib/utils';

interface UniversalReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  registrosLeche?: RegistroProduccion[];
  registrosCarne?: RegistroProduccion[];
}

type ReportType = 'produccion' | 'salud' | 'reproduccion' | 'inventario';

export function UniversalReportDialog({ isOpen, onClose, registrosLeche = [], registrosCarne = [] }: UniversalReportDialogProps) {
  const usuarioStr = typeof window !== 'undefined' ? localStorage.getItem('usuario') : null;
  const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
  const fincaNombre = usuario?.finca?.nombre || 'Mi Finca';
  const initialUserName = usuario?.nombre || usuario?.name || 'Usuario';

  const [reportType, setReportType] = useState<ReportType>('produccion');
  const [subType, setSubType] = useState<'leche' | 'carne'>('leche');
  const [preset, setPreset] = useState('este-mes');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState(initialUserName);

  // Inicializar fechas para el mes actual
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    setFechaInicio(firstDay.toISOString().split('T')[0]);
    setFechaFin(now.toISOString().split('T')[0]);
  }, []);

  const handlePresetChange = (val: string) => {
    setPreset(val);
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (val) {
      case 'hoy':
        start = now;
        break;
      case 'esta-semana':
        start.setDate(now.getDate() - now.getDay());
        break;
      case 'este-mes':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'mes-pasado':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'este-año':
        start = new Date(now.getFullYear(), 0, 1);
        break;
    }

    setFechaInicio(start.toISOString().split('T')[0]);
    setFechaFin(end.toISOString().split('T')[0]);
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;

      let endpoint = '';
      if (reportType === 'produccion') endpoint = `/produccion/${subType}`;
      else if (reportType === 'salud') endpoint = '/salud/tratamientos';
      else if (reportType === 'reproduccion') endpoint = '/reproduccion/montas';
      else if (reportType === 'inventario') endpoint = '/animales';

      const response = await fetch(`${baseUrl}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const rawData = await response.json();
      let data = Array.isArray(rawData) ? rawData : [];

      // Filtrar por fecha si aplica (excepto inventario que es estado actual)
      if (reportType !== 'inventario') {
        data = data.filter((item: any) => {
          const itemDate = item.fecha || item.fecha_programacion || item.fecha_creacion;
          if (!itemDate) return false;
          const dateStr = itemDate.split('T')[0];
          return dateStr >= fechaInicio && dateStr <= fechaFin;
        });
      }

      const reportTitle = {
        produccion: `REPORTE DE PRODUCCIÓN (${subType.toUpperCase()})`,
        salud: 'REPORTE SANITARIO Y DE SALUD',
        reproduccion: 'REPORTE DE REPRODUCCIÓN',
        inventario: 'INVENTARIO GENERAL DEL HATO'
      }[reportType];

      openPrintWindow(data, reportTitle);
      onClose();
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setLoading(false);
    }
  };

  const openPrintWindow = (data: any[], title: string) => {
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

    const getRangeLabel = () => {
      if (!fechaInicio || !fechaFin) return reportType === 'inventario' ? 'Estado Actual' : 'Periodo no definido';
      const start = new Date(fechaInicio + 'T00:00:00');
      const end = new Date(fechaFin + 'T00:00:00');
      const formatObj = { day: 'numeric', month: 'numeric', year: 'numeric' } as const;
      if (fechaInicio === fechaFin) {
        return start.toLocaleDateString('es-NI', { day: 'numeric', month: 'long', year: 'numeric' });
      }
      return `del ${start.toLocaleDateString('es-NI', formatObj)} al ${end.toLocaleDateString('es-NI', formatObj)}`;
    };

    if (reportType === 'produccion') {
      const rawSource = subType === 'leche' ? (registrosLeche || []) : (registrosCarne || []);
      // Filtrar por fecha para producción
      const source = rawSource.filter(r => {
        if (!r.fecha) return false;
        const itemDate = r.fecha.split('T')[0];
        return itemDate >= fechaInicio && itemDate <= fechaFin;
      });

      const total = source.reduce((sum, r) => sum + (subType === 'leche' ? Number(r.cantidad || 0) : Number(r.pesoCanal || 0)), 0);

      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const tableRowsProduccion = source.length === 0
        ? '<tr><td colspan="4" style="padding: 32px; text-align: center; color: #a1a1aa; font-style: italic;">No se encontraron registros en el periodo seleccionado.</td></tr>'
        : source.map((r, i) => `
            <tr style="border-bottom: 1px solid #f4f4f5; background-color: ${i % 2 === 0 ? '#ffffff' : '#fafafa'}; font-size: 12px;">
              <td style="padding: 10px; font-weight: bold; text-transform: uppercase;">${r.nombreAnimal} (${r.arete})</td>
              <td style="padding: 10px;">${r.fecha}</td>
              <td style="padding: 10px; font-family: monospace; font-size: 10px;">${r.numeroProduccion || 'N/A'}</td>
              <td style="padding: 10px; text-align: right; font-weight: bold;">
                  ${subType === 'leche' ? `${Number(r.cantidad || 0).toFixed(2)} L` : `${Number(r.pesoCanal || 0).toFixed(2)} kg`}
              </td>
            </tr>
          `).join('');

      printWindow.document.write(`
            <html>
                <head>
                    <title>Reporte de Producción - ${fincaNombre}</title>
                    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                    <style>
                        body { font-family: sans-serif; padding: 40px; color: #18181b; }
                        @page { size: portrait; margin: 0; }
                    </style>
                </head>
                <body class="bg-white">
                    <div class="max-w-4xl mx-auto">
                        <div class="text-center mb-8 pb-4 border-b-2 border-zinc-800">
                            <div class="flex items-center justify-between mb-2">
                                <div class="text-left leading-tight">
                                    <h1 class="text-xl font-bold uppercase tracking-tight text-zinc-900">${fincaNombre}</h1>
                                    <p class="text-[10px] font-bold text-zinc-500 uppercase">Control de Producción Ganadera</p>
                                </div>
                                <div class="text-right text-[10px] text-zinc-500 font-mono">
                                    ${generationTime}
                                </div>
                            </div>
                            <h2 class="text-lg font-black uppercase mt-4 underline underline-offset-4">
                                HISTORIAL DE PRODUCCIÓN DE ${subType === 'leche' ? 'LECHE' : 'CARNE'}
                            </h2>
                        </div>

                        <div class="grid grid-cols-2 gap-y-2 text-sm mb-8">
                            <div class="flex gap-2">
                                <span class="font-bold uppercase w-32">Generado por:</span>
                                <span class="text-zinc-700 font-bold">${userName || 'Usuario'}</span>
                            </div>
                            <div class="flex gap-2">
                                <span class="font-bold uppercase w-32">Periodo:</span>
                                <span class="text-zinc-700 font-bold uppercase">${getRangeLabel()}</span>
                            </div>
                            <div class="flex gap-2">
                                <span class="font-bold uppercase w-32">Finca:</span>
                                <span class="text-zinc-700">${fincaNombre}</span>
                            </div>
                            <div class="flex gap-3">
                                <span class="font-bold uppercase">Tipo:</span>
                                <span class="text-zinc-700 uppercase">${subType}</span>
                            </div>
                        </div>

                        <div class="border-t-2 border-zinc-800">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="bg-zinc-100 text-[11px] font-black uppercase border-b border-zinc-800">
                                        <th style="padding: 10px;">Animal / Identificación</th>
                                        <th style="padding: 10px;">Fecha</th>
                                        <th style="padding: 10px;">Etiqueta</th>
                                        <th style="padding: 10px; text-align: right;">Cantidad / Peso</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${tableRowsProduccion}
                                </tbody>
                            </table>
                        </div>

                        <div class="mt-6 flex justify-end">
                            <div style="width: 66%; background-color: #71717a; color: white; padding: 16px; border-radius: 2px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                                <span style="font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em;">Total Producción Acumulada</span>
                                <span style="font-size: 12px; font-weight: 700;">
                                    ${total.toFixed(2)} ${subType === 'leche' ? 'Litros' : 'kg'}
                                </span>
                            </div>
                        </div>

                        <div class="mt-12 pt-4 border-t border-zinc-200 text-[10px] text-zinc-400 flex justify-between uppercase font-bold">
                            <span>Sistema de Gestión Bovino - Módulo de Reportes</span>
                            <span>Finca: ${fincaNombre}</span>
                        </div>
                    </div>
                    <script>
                        window.onload = () => { window.print(); window.onafterprint = () => window.close(); };
                    </script>
                </body>
            </html>
        `);
      printWindow.document.close();
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const fechaGen = format(new Date(), "dd/MM/yyyy HH:mm");
    const rangeLabel = getRangeLabel();

    // Definir columnas según el tipo
    let tableHeaders = '';
    let tableRows = '';
    let totalValue = '';

    if (reportType === 'salud') {
      tableHeaders = '<th>Animal</th><th>Tratamiento</th><th>Fecha</th><th>Estado</th>';
      tableRows = data.map(r => `
          <tr>
            <td>${r.animal?.nombre || 'N/A'}</td>
            <td>${(typeof r.tipo_tratamiento === 'object' ? r.tipo_tratamiento?.nombre : r.tipo_tratamiento) || r.descripcion || '-'}</td>
            <td>${format(new Date(r.fecha || r.fecha_creacion), 'dd/MM/yyyy')}</td>
            <td><span class="status-${(r.estado || 'pendiente').toLowerCase()}">${r.estado || 'Pendiente'}</span></td>
          </tr>
        `).join('');
      totalValue = `${data.length} Tratamientos registrados`;
    } else if (reportType === 'reproduccion') {
      tableHeaders = '<th>Animal</th><th>Fecha Monta</th><th>Tipo</th><th>Resultado</th>';
      tableRows = data.map(r => `
          <tr>
            <td>${r.hembra?.nombre || r.animal?.nombre || 'N/A'}</td>
            <td>${format(new Date(r.fecha || r.fecha_programacion || r.fecha_creacion), 'dd/MM/yyyy')}</td>
            <td>${r.tipo_monta || 'Natural'}</td>
            <td>${r.estado || r.resultado || r.status || 'En Evaluación'}</td>
          </tr>
        `).join('');
      totalValue = `${data.length} Eventos reproductivos`;
    } else if (reportType === 'inventario') {
      tableHeaders = '<th>Arete</th><th>Nombre</th><th>Raza</th><th>Estado Repro.</th><th>Peso</th>';
      tableRows = data.map(r => `
          <tr>
            <td>${r.arete || '-'}</td>
            <td>${r.nombre || '-'}</td>
            <td>${r.raza?.nombre || '-'}</td>
            <td>${r.estado_reproductivo || '-'}</td>
            <td style="text-align: right;">${r.peso_actual || '0'} kg</td>
          </tr>
        `).join('');
      totalValue = `${data.length} Animales en el hato`;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; color: #333; margin: 40px; }
            .header { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
            .finca-name { font-size: 24px; font-weight: 900; color: #1a1a1a; margin: 0; text-transform: uppercase; }
            .report-title { font-size: 14px; font-weight: 700; color: #666; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; font-size: 12px; }
            .meta-item b { color: #888; text-transform: uppercase; font-size: 10px; display: block; margin-bottom: 2px; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            th { text-align: left; background: #f8f9fa; padding: 12px; font-size: 11px; text-transform: uppercase; color: #666; border-bottom: 2px solid #eee; }
            td { padding: 12px; font-size: 13px; border-bottom: 1px solid #eee; }
            .footer-total { margin-top: 30px; background: #1a1a1a; color: white; padding: 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
            .total-label { font-size: 12px; font-weight: 700; text-transform: uppercase; opacity: 0.8; }
            .total-amount { font-size: 24px; font-weight: 900; }
            .status-completado { color: #10b981; font-weight: bold; }
            .status-pendiente { color: #f59e0b; font-weight: bold; }
            @media print {
              body { margin: 20px; }
              .footer-total { background: #1a1a1a !important; -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="finca-name">${fincaNombre}</h1>
            <div class="report-title">${title}</div>
            <div class="meta-grid">
              <div class="meta-item"><b>Finca</b>${fincaNombre}</div>
              <div class="meta-item"><b>Generado por</b>${userName || 'Usuario'}</div>
              <div class="meta-item"><b>Fecha de Emisión</b>${fechaGen}</div>
              <div class="meta-item"><b>Periodo Seleccionado</b>${rangeLabel}</div>
            </div>
          </div>
          <table>
            <thead><tr>${tableHeaders}</tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
          <div class="footer-total">
            <span class="total-label">Resumen Final del Periodo</span>
            <span class="total-amount">${totalValue}</span>
          </div>
          <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <ShadDialog open={isOpen} onOpenChange={onClose}>
      <ShadDialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none">
        <div className="bg-zinc-900 p-6 text-white">
          <ShadDialogHeader>
            <ShadDialogTitle className="text-xl font-black flex items-center gap-2 text-white">
              <FileText className="w-5 h-5 text-emerald-400" />
              CENTRO DE REPORTES
            </ShadDialogTitle>
            <ShadDialogDescription className="text-zinc-400">
              Seleccione el tipo de informe y el periodo deseado.
            </ShadDialogDescription>
          </ShadDialogHeader>
        </div>

        <div className="p-6 space-y-6 bg-white">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Módulo de Interés</Label>
              <Select value={reportType} onValueChange={(v: any) => setReportType(v)}>
                <SelectTrigger className="font-bold border-zinc-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="produccion">Producción</SelectItem>
                  <SelectItem value="salud">Salud/Sanitario</SelectItem>
                  <SelectItem value="reproduccion">Reproducción</SelectItem>
                  <SelectItem value="inventario">Inventario Animales</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reportType === 'produccion' && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Tipo de Producción</Label>
                <Select value={subType} onValueChange={(v: any) => setSubType(v)}>
                  <SelectTrigger className="font-bold border-zinc-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leche">Láctea (Leche)</SelectItem>
                    <SelectItem value="carne">Cárnica (Carne)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {reportType !== 'inventario' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Selección Rápida</Label>
                <Select value={preset} onValueChange={handlePresetChange}>
                  <SelectTrigger className="border-zinc-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hoy">Hoy</SelectItem>
                    <SelectItem value="esta-semana">Esta Semana</SelectItem>
                    <SelectItem value="este-mes">Este Mes</SelectItem>
                    <SelectItem value="mes-pasado">Mes Pasado</SelectItem>
                    <SelectItem value="este-año">Este Año</SelectItem>
                    <SelectItem value="personalizado">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {preset === 'personalizado' && (
                <div className="grid grid-cols-2 gap-4 animate-in zoom-in-95 duration-200">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Desde</Label>
                    <Input
                      type="date"
                      value={fechaInicio}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setFechaInicio(e.target.value)}
                      className="border-zinc-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Hasta</Label>
                    <Input
                      type="date"
                      value={fechaFin}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setFechaFin(e.target.value)}
                      className="border-zinc-200"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white rounded-xl shadow-sm border border-zinc-100">
                {reportType === 'produccion' && <Milk className="w-5 h-5 text-emerald-500" />}
                {reportType === 'salud' && <Activity className="w-5 h-5 text-rose-500" />}
                {reportType === 'reproduccion' && <Heart className="w-5 h-5 text-amber-500" />}
                {reportType === 'inventario' && <Users className="w-5 h-5 text-blue-500" />}
              </div>
              <div>
                <h4 className="text-xs font-black uppercase text-zinc-700">Vista Previa</h4>
                <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
                  Se generará un documento formal con la lista de registros y totales para el periodo seleccionado.
                </p>
              </div>
            </div>
          </div>
        </div>

        <ShadDialogFooter className="p-6 bg-zinc-50/50 border-t border-zinc-100 sm:justify-start">
          <Button
            onClick={generateReport}
            disabled={loading}
            className="w-full bg-zinc-900 hover:bg-black text-white font-black uppercase tracking-widest text-xs h-12 gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
            Generar e Imprimir Reporte
          </Button>
        </ShadDialogFooter>
      </ShadDialogContent>
    </ShadDialog>
  );
}
