"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Loader2, Calendar, Activity, Stethoscope, Syringe } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

type AnimalSimple = { animal_id: number; arete: string; nombre: string; sexo: string; };

export default function EditarReproduccionPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { toast } = useToast();
    
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    
    const [vacas, setVacas] = useState<AnimalSimple[]>([]);
    const [toros, setToros] = useState<AnimalSimple[]>([]);
    
    const [formData, setFormData] = useState({
        numero_monta: "", // 👈 ¡Esto era lo que faltaba para que el backend nos dejara guardar!
        animal_hembra_id: "",
        tipo_monta: "Monta Natural",
        fecha_programacion: "",
        animal_macho_id: "sin-toro",
        codigo_pajilla: "", 
        estado: "En Evaluación"
    });

    const normalizarEstado = (estadoRaw: string) => {
        if (!estadoRaw) return "En Evaluación";
        const est = estadoRaw.toLowerCase();
        if (est.includes("confirmada")) return "Confirmada";
        if (est.includes("fallida")) return "Fallida";
        return "En Evaluación"; 
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return router.push('/login');

        const fetchData = async () => {
            try {
                const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

                const [animalesRes, registroRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/animales?limit=200`, { headers }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/reproduccion/montas/${id}`, { headers }) 
                ]);
                
                if (animalesRes.ok) {
                    const animalesData: AnimalSimple[] = await animalesRes.json();
                    setVacas(animalesData.filter(a => a.sexo.toLowerCase() === 'hembra'));
                    setToros(animalesData.filter(a => a.sexo.toLowerCase() === 'macho'));
                }

                if (registroRes.ok) {
                    const registro = await registroRes.json();
                    
                    setFormData({
                        numero_monta: registro.numero_monta || "", // 👈 Lo recuperamos de la base de datos
                        animal_hembra_id: registro.hembra ? String(registro.hembra.animal_id) : "",
                        tipo_monta: registro.tipo_monta || "Monta Natural",
                        fecha_programacion: registro.fecha_programacion ? registro.fecha_programacion.split('T')[0] : "",
                        animal_macho_id: registro.macho ? String(registro.macho.animal_id) : "sin-toro",
                        codigo_pajilla: registro.codigo_pajilla || "", 
                        estado: normalizarEstado(registro.estado)
                    });
                } else {
                    toast({ title: "Error", description: "No se encontró la monta en el servidor.", variant: "destructive" });
                }
            } catch (err) {
                toast({ title: "Error", description: "No se pudieron cargar los datos.", variant: "destructive" });
            } finally {
                setDataLoading(false);
            }
        };
        fetchData();
    }, [id, router, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                numero_monta: formData.numero_monta, // 👈 Se lo enviamos al guardia de seguridad del backend
                animal_hembra_id: formData.animal_hembra_id ? Number(formData.animal_hembra_id) : null,
                tipo_monta: formData.tipo_monta,
                fecha_programacion: formData.fecha_programacion || null,
                animal_macho_id: formData.tipo_monta === "Monta Natural" && formData.animal_macho_id !== "sin-toro" ? Number(formData.animal_macho_id) : null,
                codigo_pajilla: formData.tipo_monta === "Inseminación Artificial" ? formData.codigo_pajilla : null,
                estado: formData.estado
            };

            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reproduccion/montas/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                 const errData = await response.json();
                 throw new Error(errData.message || "Error al actualizar la monta en el servidor.");
            }

            toast({ title: "¡Actualizado!", description: "Cambios guardados correctamente.", className: "bg-emerald-600 text-white" });
            router.push("/reproduccion");

        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    if (dataLoading) return <div className="min-h-screen flex justify-center items-center"><Loader2 className="h-10 w-10 animate-spin text-emerald-600" /></div>;

    return (
        <div className="min-h-screen bg-zinc-50 p-8">
            <Link href="/reproduccion"><Button variant="ghost" size="sm" className="mb-6"><ArrowLeft className="h-4 w-4 mr-2" /> Volver</Button></Link>
            <Card className="max-w-3xl mx-auto border-emerald-100 shadow-sm">
                <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 pb-6">
                    <div className="flex items-center gap-2"><Activity className="h-6 w-6 text-emerald-600" /><CardTitle>Editar Servicio Reproductivo</CardTitle></div>
                    <CardDescription>Corrige datos de la monta o inseminación.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Hembra Receptora *</Label>
                                <Select value={formData.animal_hembra_id} onValueChange={(v) => setFormData({...formData, animal_hembra_id: v})}>
                                    <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                                    <SelectContent>
                                        {vacas.map((v) => <SelectItem key={v.animal_id} value={v.animal_id.toString()}>{v.arete} - {v.nombre || 'Sin nombre'}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Estado del Servicio</Label>
                                <Select value={formData.estado} onValueChange={(v) => setFormData({...formData, estado: v})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="En Evaluación">En Evaluación</SelectItem>
                                        <SelectItem value="Confirmada">Preñez Confirmada</SelectItem>
                                        <SelectItem value="Fallida">Fallida / Vacía</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tipo de Monta *</Label>
                                <Select value={formData.tipo_monta} onValueChange={(v) => setFormData({...formData, tipo_monta: v})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Monta Natural">Monta Natural</SelectItem>
                                        <SelectItem value="Inseminación Artificial">Inseminación Artificial</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Fecha de la Monta</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input type="date" className="pl-8" value={formData.fecha_programacion} onChange={(e) => setFormData({...formData, fecha_programacion: e.target.value})} />
                                </div>
                            </div>
                        </div>

                        {formData.tipo_monta === "Monta Natural" ? (
                            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                                <Label className="flex items-center gap-2 mb-2"><Stethoscope className="h-4 w-4 text-emerald-600" /> Semental (Toro)</Label>
                                <Select value={formData.animal_macho_id} onValueChange={(v) => setFormData({...formData, animal_macho_id: v})}>
                                    <SelectTrigger className="bg-white"><SelectValue placeholder="Selecciona el toro" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sin-toro">Toro externo / Desconocido</SelectItem>
                                        {toros.map((t) => <SelectItem key={t.animal_id} value={t.animal_id.toString()}>{t.arete} - {t.nombre || 'Sin nombre'}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <Label className="flex items-center gap-2 mb-2"><Syringe className="h-4 w-4 text-blue-600" /> Código de Pajilla (Semen)</Label>
                                <Input 
                                    placeholder="Ej. BR-1045" 
                                    className="bg-white"
                                    value={formData.codigo_pajilla} 
                                    onChange={(e) => setFormData({...formData, codigo_pajilla: e.target.value})} 
                                />
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Link href="/reproduccion"><Button type="button" variant="outline">Cancelar</Button></Link>
                            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                Guardar Cambios
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}