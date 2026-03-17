'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Loader2, Calendar, Activity, ClipboardList, Stethoscope } from "lucide-react";
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
        animalId: "",
        tipoServicio: "Monta Natural",
        fechaServicio: "",
        toroId: "sin-toro",
        codigoPajilla: "",
        observaciones: "",
        estado: "En Evaluación"
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return router.push('/login');

        const fetchData = async () => {
            try {
                const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

                // Traemos los animales y el registro actual al mismo tiempo
                const [animalesRes, registroRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/animales?limit=200`, { headers }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/reproduccion/${id}`, { headers })
                ]);
                
                if (animalesRes.ok) {
                    const animalesData: AnimalSimple[] = await animalesRes.json();
                    setVacas(animalesData.filter(a => a.sexo.toLowerCase() === 'hembra'));
                    setToros(animalesData.filter(a => a.sexo.toLowerCase() === 'macho'));
                }

                if (registroRes.ok) {
                    const registro = await registroRes.json();
                    setFormData({
                        animalId: registro.animal?.animal_id?.toString() || "",
                        tipoServicio: registro.tipo_servicio || "Monta Natural",
                        fechaServicio: registro.fecha_servicio?.split('T')[0] || "",
                        toroId: registro.toro?.animal_id?.toString() || "sin-toro",
                        codigoPajilla: registro.codigo_pajilla || "",
                        observaciones: registro.observaciones || "",
                        estado: registro.estado || "En Evaluación"
                    });
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
                animal_id: Number(formData.animalId),
                tipo_servicio: formData.tipoServicio,
                fecha_servicio: formData.fechaServicio,
                toro_id: formData.tipoServicio === "Monta Natural" && formData.toroId !== "sin-toro" ? Number(formData.toroId) : null,
                codigo_pajilla: formData.tipoServicio === "Inseminación Artificial" ? formData.codigoPajilla : null,
                observaciones: formData.observaciones || null,
                estado: formData.estado
            };

            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reproduccion/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("Error al actualizar");

            toast({ title: "¡Actualizado!", description: "Cambios guardados correctamente.", className: "bg-green-600 text-white" });
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
            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <div className="flex items-center gap-2"><Activity className="h-6 w-6 text-emerald-600" /><CardTitle>Editar Servicio Reproductivo</CardTitle></div>
                    <CardDescription>Actualiza el estado de gestación o corrige datos de la monta/inseminación.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Vaca o Novilla (Hembra) *</Label>
                                <Select value={formData.animalId} onValueChange={(v) => setFormData({...formData, animalId: v})}>
                                    <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                                    <SelectContent>
                                        {vacas.map((v) => <SelectItem key={v.animal_id} value={v.animal_id.toString()}>{v.arete} - {v.nombre || 'Sin nombre'}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Estado de Gestación</Label>
                                <Select value={formData.estado} onValueChange={(v) => setFormData({...formData, estado: v})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="En Evaluación">En Evaluación</SelectItem>
                                        <SelectItem value="Confirmada">Preñez Confirmada</SelectItem>
                                        <SelectItem value="Fallida">Fallida / Vacía</SelectItem>
                                        <SelectItem value="Aborto">Aborto</SelectItem>
                                        <SelectItem value="Parto Exitoso">Parto Exitoso</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tipo de Servicio *</Label>
                                <Select value={formData.tipoServicio} onValueChange={(v) => setFormData({...formData, tipoServicio: v})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Monta Natural">Monta Natural</SelectItem>
                                        <SelectItem value="Inseminación Artificial">Inseminación Artificial</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Fecha del Servicio *</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input type="date" className="pl-8" value={formData.fechaServicio} onChange={(e) => setFormData({...formData, fechaServicio: e.target.value})} required />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg border">
                            {formData.tipoServicio === "Monta Natural" ? (
                                <div>
                                    <Label className="flex items-center gap-2 mb-2"><Stethoscope className="h-4 w-4" /> Semental (Toro)</Label>
                                    <Select value={formData.toroId} onValueChange={(v) => setFormData({...formData, toroId: v})}>
                                        <SelectTrigger><SelectValue placeholder="Selecciona el toro" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="sin-toro">Toro externo / Desconocido</SelectItem>
                                            {toros.map((t) => <SelectItem key={t.animal_id} value={t.animal_id.toString()}>{t.arete} - {t.nombre || 'Sin nombre'}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) : (
                                <div>
                                    <Label className="flex items-center gap-2 mb-2"><Stethoscope className="h-4 w-4" /> Código de Pajilla (Semen)</Label>
                                    <Input placeholder="Ej. BR-1045" value={formData.codigoPajilla} onChange={(e) => setFormData({...formData, codigoPajilla: e.target.value})} />
                                </div>
                            )}
                        </div>

                        <div>
                            <Label className="flex items-center gap-2 mb-2"><ClipboardList className="h-4 w-4" /> Observaciones</Label>
                            <Input placeholder="Notas adicionales..." value={formData.observaciones} onChange={(e) => setFormData({...formData, observaciones: e.target.value})} />
                        </div>

                        <div className="flex gap-3 pt-4 border-t">
                            <Button type="submit" disabled={loading} className="bg-emerald-600">
                                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                {loading ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                            <Link href="/reproduccion"><Button type="button" variant="outline">Cancelar</Button></Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}