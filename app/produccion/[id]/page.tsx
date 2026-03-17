'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    ArrowLeft,
    Save,
    Loader2,
    Droplets,
    Scale,
    Hash,
    AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { produccionApi } from "@/lib/api/produccion";
import { z } from "zod";

const lecheSchema = z.object({
    numero_produccion: z.string().min(1, "El número de producción es obligatorio"),
    cantidad: z.coerce.number().min(0.1, "Mínimo 0.1 litros").max(60, "Máximo 60 litros"),
});

const carneSchema = z.object({
    peso_canal: z.coerce.number().min(10, "Mínimo 10 kg").max(600, "Máximo 600 kg"),
});

type AnimalSimple = { animal_id: number; arete: string; nombre: string; };

export default function EditarProduccionPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { toast } = useToast();

    const [pageLoading, setPageLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [animales, setAnimales] = useState<AnimalSimple[]>([]);

    // Determinar el tipo basado en query param o detección
    const [tipo, setTipo] = useState<'leche' | 'carne'>('leche');
    const [formData, setFormData] = useState({
        animalId: "",
        numero_produccion: "",
        cantidad: "",
        peso_canal: "",
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) { router.push('/login'); return; }

                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };

                // Cargar animales
                const animalesRes = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/animales?limit=200`,
                    { headers }
                );
                if (animalesRes.ok) {
                    const data = await animalesRes.json();
                    setAnimales(Array.isArray(data) ? data : data.data || []);
                }

                // Intentar cargar como leche primero, luego como carne
                let found = false;

                // Intentar leche
                try {
                    const lecheData = await produccionApi.getLeche(token);
                    const registros = Array.isArray(lecheData) ? lecheData : [];
                    const registro = registros.find((r: any) => r.id.toString() === id);
                    if (registro) {
                        setTipo('leche');
                        setFormData({
                            animalId: registro.animal?.animal_id?.toString() || "",
                            numero_produccion: registro.numero_produccion || "",
                            cantidad: registro.cantidad?.toString() || "",
                            peso_canal: "",
                        });
                        found = true;
                    }
                } catch { }

                // Si no es leche, intentar carne
                if (!found) {
                    try {
                        const carneData = await produccionApi.getCarne(token);
                        const registros = Array.isArray(carneData) ? carneData : [];
                        const registro = registros.find((r: any) => r.id.toString() === id);
                        if (registro) {
                            setTipo('carne');
                            setFormData({
                                animalId: registro.animal?.animal_id?.toString() || "",
                                numero_produccion: "",
                                cantidad: "",
                                peso_canal: registro.peso_canal?.toString() || "",
                            });
                            found = true;
                        }
                    } catch { }
                }

                if (!found) {
                    setError("No se encontró el registro de producción.");
                }

            } catch (err: any) {
                setError(err.message);
                toast({ title: "Error", description: err.message, variant: "destructive" });
            } finally {
                setPageLoading(false);
            }
        };

        if (id) fetchData();
    }, [id, router, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) { router.push('/login'); return; }

            if (tipo === 'leche') {
                const valid = lecheSchema.parse({
                    numero_produccion: formData.numero_produccion,
                    cantidad: formData.cantidad ? Number(formData.cantidad) : undefined,
                });

                await produccionApi.updateLeche(id, {
                    numero_produccion: valid.numero_produccion,
                    cantidad: valid.cantidad,
                }, token);
            } else {
                const valid = carneSchema.parse({
                    peso_canal: formData.peso_canal ? Number(formData.peso_canal) : undefined,
                });

                await produccionApi.updateCarne(id, {
                    peso_canal: valid.peso_canal,
                }, token);
            }

            toast({
                title: "¡Registro Actualizado!",
                description: "Los cambios se guardaron correctamente.",
                className: "bg-green-600 text-white"
            });

            router.push("/produccion");

        } catch (err: any) {
            const mensaje = err instanceof z.ZodError ? err.errors[0].message : err.message;
            toast({ title: "Error", description: mensaje, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="min-h-screen bg-zinc-50 p-8 flex justify-center items-center">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-zinc-50 p-8">
                <div className="flex flex-col items-center justify-center h-64 text-center p-6 bg-red-50 rounded-lg border border-red-100 max-w-lg mx-auto">
                    <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                    <h3 className="text-lg font-bold text-red-700 mb-2">Error al cargar registro</h3>
                    <p className="text-sm text-zinc-600 mb-4">{error}</p>
                    <Link href="/produccion">
                        <Button>Volver a la lista</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 p-8">
            <Link href="/produccion">
                <Button variant="ghost" size="sm" className="mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Volver
                </Button>
            </Link>

            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl">
                        Editar Registro de {tipo === 'leche' ? 'Leche' : 'Carne'}
                    </CardTitle>
                    <CardDescription>Modifica los datos del registro #{id}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Animal (read-only info) */}
                        <div>
                            <Label>Animal</Label>
                            <Select value={formData.animalId} disabled>
                                <SelectTrigger className="bg-zinc-50">
                                    <SelectValue placeholder="Animal del registro" />
                                </SelectTrigger>
                                <SelectContent>
                                    {animales.map((a) => (
                                        <SelectItem key={a.animal_id} value={a.animal_id.toString()}>
                                            {a.arete} - {a.nombre || 'Sin nombre'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-zinc-400 mt-1">El animal no se puede cambiar</p>
                        </div>

                        {/* Campos condicionales */}
                        {tipo === 'leche' ? (
                            <>
                                <div>
                                    <Label>Número de Producción *</Label>
                                    <div className="relative">
                                        <Hash className="absolute left-2 top-2.5 h-4 w-4 text-blue-400" />
                                        <Input
                                            className="pl-8"
                                            placeholder="Ej: L-2026-001"
                                            value={formData.numero_produccion}
                                            onChange={(e) => setFormData({ ...formData, numero_produccion: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label>Cantidad (Litros) *</Label>
                                    <div className="relative">
                                        <Droplets className="absolute left-2 top-2.5 h-4 w-4 text-blue-400" />
                                        <Input
                                            type="number" step="0.1" min="0.1" max="60" className="pl-8"
                                            value={formData.cantidad}
                                            onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div>
                                <Label>Peso en Canal (kg) *</Label>
                                <div className="relative">
                                    <Scale className="absolute left-2 top-2.5 h-4 w-4 text-amber-400" />
                                    <Input
                                        type="number" step="0.1" min="10" max="600" className="pl-8"
                                        value={formData.peso_canal}
                                        onChange={(e) => setFormData({ ...formData, peso_canal: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                {saving ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                            <Link href="/produccion">
                                <Button type="button" variant="outline">Cancelar</Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
