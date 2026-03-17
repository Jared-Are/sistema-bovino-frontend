'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
    Stethoscope
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const tratamientoSchema = z.object({
    tipoId: z.string().min(1, "Selecciona el tipo de tratamiento"),
    animalId: z.string().min(1, "Selecciona el animal"),
    fecha: z.string().min(1, "La fecha es requerida"),
    descripcion: z.string().optional(),
    estado: z.string().default("PENDIENTE")
});

type AnimalSimple = { animal_id: number; arete: string; nombre: string; };
type TipoSimple = { id: number; nombre: string; };

export default function NuevoTratamientoPage() {
    const router = useRouter();
    const { toast } = useToast();
    
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    
    const [animales, setAnimales] = useState<AnimalSimple[]>([]);
    const [tipos, setTipos] = useState<TipoSimple[]>([]);
    
    const [formData, setFormData] = useState({
        tipoId: "",
        animalId: "",
        fecha: new Date().toISOString().split('T')[0],
        descripcion: "",
        estado: "PENDIENTE"
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/');
            return;
        }

        const fetchData = async () => {
            setDataLoading(true);
            try {
                const headers = { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };
                
                const [animalesRes, tiposRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/animales?limit=200`, { headers }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/salud/tipos-tratamiento`, { headers })
                ]);

                if (animalesRes.ok) {
                    const data = await animalesRes.json();
                    setAnimales(data);
                }
                
                if (tiposRes.ok) {
                    const data = await tiposRes.json();
                    setTipos(data);
                }
            } catch (err) {
                toast({ title: "Error", description: "No se pudieron cargar los datos", variant: "destructive" });
            } finally {
                setDataLoading(false);
            }
        };
        fetchData();
    }, [router, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

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

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/salud/tratamientos`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al crear tratamiento');
            }

            toast({ 
                title: "¡Registro Exitoso!", 
                description: "Tratamiento guardado correctamente",
                className: "bg-green-600 text-white" 
            });
            
            router.push("/salud");

        } catch (err: any) {
            const mensaje = err instanceof z.ZodError ? err.errors[0].message : err.message;
            toast({ title: "Error", description: mensaje, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    if (dataLoading) {
        return (
            <div className="min-h-screen bg-zinc-50 p-8 flex justify-center items-center">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
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
                        <CardTitle>Registrar Tratamiento</CardTitle>
                    </div>
                    <CardDescription>Agrega un nuevo tratamiento sanitario al animal</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tipo de Tratamiento *</Label>
                                <Select value={formData.tipoId} onValueChange={(v) => setFormData({...formData, tipoId: v})}>
                                    <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                                    <SelectContent>
                                        {tipos.map((t) => (
                                            <SelectItem key={t.id} value={t.id.toString()}>{t.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Animal *</Label>
                                <Select value={formData.animalId} onValueChange={(v) => setFormData({...formData, animalId: v})}>
                                    <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
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
                                    <Input type="date" className="pl-8" 
                                        value={formData.fecha}
                                        onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                                        required />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Estado</Label>
                                <Select value={formData.estado} onValueChange={(v) => setFormData({...formData, estado: v})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                                rows={3}
                            />
                        </div>

                        <div className="flex gap-3 pt-4 border-t">
                            <Button type="submit" disabled={loading} className="bg-emerald-600">
                                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                {loading ? "Guardando..." : "Guardar Tratamiento"}
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