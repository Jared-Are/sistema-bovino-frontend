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
    Stethoscope,
    AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const hoy = new Date();
const año = hoy.getFullYear();
const mes = String(hoy.getMonth() + 1).padStart(2, '0');
const dia = String(hoy.getDate()).padStart(2, '0');
const fechaHoy = `${año}-${mes}-${dia}`;

const tratamientoSchema = z.object({
    tipoId: z.string().min(1, "Selecciona el tipo de tratamiento"),
    animalId: z.string().min(1, "Selecciona el animal"),
    fecha: z.string()
        .min(1, "La fecha es requerida")
        .refine(val => val >= fechaHoy, "La fecha no puede ser anterior a hoy"),
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
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    
    const [animales, setAnimales] = useState<AnimalSimple[]>([]);
    const [tipos, setTipos] = useState<TipoSimple[]>([]);
    
    const [formData, setFormData] = useState({
        tipoId: "",
        animalId: "",
        fecha: fechaHoy,
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

    const validateField = (field: keyof typeof formData, value: any) => {
        try {
            const fieldSchema = z.object({ [field]: tratamientoSchema.shape[field] });
            fieldSchema.parse({ [field]: value });
            setFieldErrors(prev => ({ ...prev, [field]: "" }));
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const message = error.errors[0]?.message || "Campo inválido";
                setFieldErrors(prev => ({ ...prev, [field]: message }));
            }
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});
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
                                <Label className="flex items-center gap-1">
                                    Tipo de Tratamiento <span className="text-red-500">*</span>
                                </Label>
                                <Select 
                                    value={formData.tipoId} 
                                    onValueChange={(v) => {
                                        setFormData({...formData, tipoId: v});
                                        validateField('tipoId', v);
                                    }}
                                >
                                    <SelectTrigger className={fieldErrors.tipoId ? "border-red-500 focus-visible:ring-red-500" : ""}>
                                        <SelectValue placeholder="Selecciona" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tipos.map((t) => (
                                            <SelectItem key={t.id} value={t.id.toString()}>{t.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldErrors.tipoId && (
                                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {fieldErrors.tipoId}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-1">
                                    Animal <span className="text-red-500">*</span>
                                </Label>
                                <Select 
                                    value={formData.animalId} 
                                    onValueChange={(v) => {
                                        setFormData({...formData, animalId: v});
                                        validateField('animalId', v);
                                    }}
                                >
                                    <SelectTrigger className={fieldErrors.animalId ? "border-red-500 focus-visible:ring-red-500" : ""}>
                                        <SelectValue placeholder="Selecciona" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {animales.map((a) => (
                                            <SelectItem key={a.animal_id} value={a.animal_id.toString()}>
                                                {a.arete} - {a.nombre || 'Sin nombre'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldErrors.animalId && (
                                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {fieldErrors.animalId}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1">
                                    Fecha <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input 
                                        type="date" 
                                        className={`pl-8 ${fieldErrors.fecha ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                        value={formData.fecha}
                                        min={fechaHoy} 
                                        onChange={(e) => {
                                            setFormData({...formData, fecha: e.target.value});
                                            validateField('fecha', e.target.value);
                                        }}
                                        required 
                                    />
                                </div>
                                {fieldErrors.fecha && (
                                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {fieldErrors.fecha}
                                    </p>
                                )}
                                <p className="text-xs text-zinc-500">Solo se permiten fechas desde hoy</p>
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