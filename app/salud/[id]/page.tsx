'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
    ArrowLeft, 
    Save, 
    Loader2,
    Calendar,
    Stethoscope,
    AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const tratamientoSchema = z.object({
    tipoId: z.string().min(1, "Selecciona el tipo de tratamiento"),
    animalId: z.string().min(1, "Selecciona el animal"),
    fecha: z.string().min(1, "La fecha es requerida"),
    descripcion: z.string().optional(),
    estado: z.string().min(1, "Selecciona el estado")
});

type AnimalSimple = { animal_id: number; arete: string; nombre: string; };
type TipoSimple = { id: number; nombre: string; };

export default function EditarTratamientoPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { toast } = useToast();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [animales, setAnimales] = useState<AnimalSimple[]>([]);
    const [tipos, setTipos] = useState<TipoSimple[]>([]);
    
    const [formData, setFormData] = useState({
        tipoId: "",
        animalId: "",
        fecha: "",
        descripcion: "",
        estado: "PENDIENTE"
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!id) {
                setError("ID no válido");
                setLoading(false);
                return;
            }

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    router.push('/');
                    return;
                }

                const headers = { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };

                const [tratamientoRes, animalesRes, tiposRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/salud/tratamientos/${id}`, { headers }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/animales?limit=200`, { headers }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/salud/tipos-tratamiento`, { headers })
                ]);

                if (!tratamientoRes.ok) throw new Error("Tratamiento no encontrado");

                const tratamiento = await tratamientoRes.json();
                
                setFormData({
                    tipoId: tratamiento.tipo_tratamiento?.id?.toString() || "",
                    animalId: tratamiento.animal?.animal_id?.toString() || "",
                    fecha: tratamiento.fecha?.split('T')[0] || "",
                    descripcion: tratamiento.descripcion || "",
                    estado: tratamiento.estado || "PENDIENTE",
                });

                if (animalesRes.ok) {
                    const data = await animalesRes.json();
                    setAnimales(data);
                }
                
                if (tiposRes.ok) {
                    const data = await tiposRes.json();
                    setTipos(data);
                }

            } catch (err: any) {
                setError(err.message);
                toast({ title: "Error", description: err.message, variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, router, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const valid = tratamientoSchema.parse(formData);

            const payload = {
                tipo_tratamiento_id: Number(valid.tipoId),
                animal_id: Number(valid.animalId),
                fecha: valid.fecha,
                descripcion: valid.descripcion || null,
                estado: valid.estado
            };

            const token = localStorage.getItem('token');
            if (!token) throw new Error('No autorizado');

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/salud/tratamientos/${id}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al actualizar tratamiento');
            }

            toast({ 
                title: "¡Tratamiento Actualizado!", 
                description: "Los cambios se guardaron correctamente.",
                className: "bg-green-600 text-white"
            });
            
            router.push("/salud");

        } catch (err: any) {
            const mensaje = err instanceof z.ZodError ? err.errors[0].message : err.message;
            toast({ title: "Error", description: mensaje, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 p-8 flex justify-center items-center">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-zinc-50 p-8">
                <div className="flex flex-col items-center justify-center h-64 text-center p-6 bg-red-50 rounded-lg border border-red-100">
                    <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                    <h3 className="text-lg font-bold text-red-700 mb-2">Error al cargar tratamiento</h3>
                    <p className="text-muted-foreground max-w-md">{error}</p>
                    <Button className="mt-4" onClick={() => router.push("/salud")}>
                        Volver a la lista
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 p-8">
            <Link href="/salud">
                <Button variant="ghost" size="sm" className="mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Volver
                </Button>
            </Link>

            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Stethoscope className="h-6 w-6 text-emerald-600" />
                        <CardTitle>Editar Tratamiento</CardTitle>
                    </div>
                    <CardDescription>Modifica los datos del tratamiento sanitario</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tipo de Tratamiento *</Label>
                                <Select value={formData.tipoId} onValueChange={(v) => setFormData({...formData, tipoId: v})}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona el tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tipos.map((t) => (
                                            <SelectItem key={t.id} value={t.id.toString()}>
                                                {t.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Animal *</Label>
                                <Select value={formData.animalId} onValueChange={(v) => setFormData({...formData, animalId: v})}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona el animal" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {animales.map((a) => (
                                            <SelectItem key={a.animal_id} value={a.animal_id.toString()}>
                                                {a.arete} - {a.nombre || 'Sin nombre'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Fecha *</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input 
                                        type="date" 
                                        className="pl-8" 
                                        value={formData.fecha}
                                        onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Estado *</Label>
                                <Select value={formData.estado} onValueChange={(v) => setFormData({...formData, estado: v})}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona el estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                                        <SelectItem value="ACTIVO">Activo</SelectItem>
                                        <SelectItem value="COMPLETADO">Completado</SelectItem>
                                        <SelectItem value="CANCELADO">Cancelado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Descripción / Observaciones</Label>
                            <Textarea
                                placeholder="Detalles adicionales del tratamiento..."
                                value={formData.descripcion}
                                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                                rows={4}
                            />
                        </div>

                        <div className="flex gap-3 pt-4 border-t">
                            <Button type="submit" disabled={saving} className="bg-emerald-600">
                                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                {saving ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                            <Link href="/salud">
                                <Button type="button" variant="outline">Cancelar</Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}