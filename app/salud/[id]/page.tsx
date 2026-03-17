'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
    ArrowLeft, 
    Save, 
    Loader2,
    Stethoscope,
    AlertTriangle,
    Lock
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const estadoSchema = z.object({
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
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    
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
        setFieldErrors({});
        setSaving(true);

        try {
            // Validar solo el estado
            estadoSchema.parse({ estado: formData.estado });

            const payload = {
                estado: formData.estado
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
                title: "¡Estado Actualizado!", 
                description: "El estado del tratamiento se actualizó correctamente.",
                className: "bg-green-600 text-white"
            });
            
            router.push("/salud");

        } catch (err: any) {
            if (err instanceof z.ZodError) {
                const errors: Record<string, string> = {};
                err.errors.forEach(e => {
                    if (e.path[0]) errors[e.path[0].toString()] = e.message;
                });
                setFieldErrors(errors);
            } else {
                toast({ title: "Error", description: err.message, variant: "destructive" });
            }
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

    // Obtener nombres para mostrar
    const animalNombre = animales.find(a => a.animal_id.toString() === formData.animalId)?.arete || 'Animal';
    const tipoNombre = tipos.find(t => t.id.toString() === formData.tipoId)?.nombre || 'Tratamiento';

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
                    <CardDescription>Solo puedes modificar el estado del tratamiento</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Datos no editables - solo lectura */}
                        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-gray-600">Animal</Label>
                                    <div className="p-2 border border-gray-200 rounded-md bg-white flex items-center gap-2">
                                        <Lock className="h-4 w-4 text-gray-400" />
                                        <span>{animalNombre}</span>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-gray-600">Tipo de Tratamiento</Label>
                                    <div className="p-2 border border-gray-200 rounded-md bg-white flex items-center gap-2">
                                        <Lock className="h-4 w-4 text-gray-400" />
                                        <span>{tipoNombre}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-gray-600">Fecha</Label>
                                    <div className="p-2 border border-gray-200 rounded-md bg-white flex items-center gap-2">
                                        <Lock className="h-4 w-4 text-gray-400" />
                                        <span>{new Date(formData.fecha).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-gray-600">Descripción</Label>
                                    <div className="p-2 border border-gray-200 rounded-md bg-white min-h-[40px]">
                                        {formData.descripcion || 'Sin descripción'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Único campo editable: Estado */}
                        <div className="space-y-2">
                            <Label htmlFor="estado" className="flex items-center gap-1">
                                Estado del Tratamiento <span className="text-red-500">*</span>
                            </Label>
                            <Select 
                                value={formData.estado} 
                                onValueChange={(v) => setFormData({...formData, estado: v})}
                            >
                                <SelectTrigger className={fieldErrors.estado ? "border-red-500 focus-visible:ring-red-500" : ""}>
                                    <SelectValue placeholder="Selecciona el estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                                    <SelectItem value="ACTIVO">Activo</SelectItem>
                                    <SelectItem value="COMPLETADO">Completado</SelectItem>
                                    <SelectItem value="CANCELADO">Cancelado</SelectItem>
                                </SelectContent>
                            </Select>
                            {fieldErrors.estado && (
                                <p className="text-sm text-red-500 mt-1">{fieldErrors.estado}</p>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4 border-t">
                            <Button type="submit" disabled={saving} className="bg-emerald-600">
                                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                {saving ? "Guardando..." : "Actualizar Estado"}
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