'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
    Beef,
    Scale,
    Hash
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { produccionApi } from "@/lib/api/produccion";
import { z } from "zod";

const lecheSchema = z.object({
    animalId: z.string().min(1, "Selecciona un animal"),
    numero_produccion: z.string().min(1, "El número de producción es obligatorio"),
    cantidad: z.coerce.number().min(0.1, "Mínimo 0.1 litros").max(60, "Máximo 60 litros"),
});

const carneSchema = z.object({
    animalId: z.string().min(1, "Selecciona un animal"),
    peso_canal: z.coerce.number().min(10, "Mínimo 10 kg").max(600, "Máximo 600 kg"),
});

type AnimalSimple = {
    animal_id: number;
    arete: string;
    nombre: string;
    sexo: string;
    estado_reproductivo: string;
    fecha_nacimiento: string;
    peso_actual: number;
};

export default function NuevaProduccionPage() {
    const router = useRouter();
    const { toast } = useToast();

    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [animales, setAnimales] = useState<AnimalSimple[]>([]);
    const [maxId, setMaxId] = useState(0);

    const [tipo, setTipo] = useState<'leche' | 'carne'>('leche');
    const [formData, setFormData] = useState({
        animalId: "",
        numero_produccion: "",
        cantidad: "",
        peso_canal: "",
    });

    const calculateAge = (birthDateStr: string) => {
        const birthDate = new Date(birthDateStr);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const filteredAnimales = animales.filter(a => {
        if (tipo === 'leche') {
            return a.sexo === 'Hembra' && (
                a.estado_reproductivo?.toLowerCase() === 'lactando' ||
                a.estado_reproductivo?.toLowerCase() === 'parida'
            );
        } else {
            // Carne: Macho >= 6 años
            return a.sexo === 'Macho' && calculateAge(a.fecha_nacimiento) >= 6;
        }
    });

    // Reset animalId if tipo changes and current animal is no longer in filtered list
    useEffect(() => {
        if (formData.animalId && !filteredAnimales.some(a => a.animal_id.toString() === formData.animalId)) {
            setFormData(prev => ({ ...prev, animalId: "" }));
        }
    }, [tipo, filteredAnimales]);

    useEffect(() => {
        const fetchData = async () => {
            setDataLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) { router.push('/login'); return; }

                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };

                const animalesRes = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/animales?limit=200`,
                    { headers }
                );

                if (animalesRes.ok) {
                    const data = await animalesRes.json();
                    setAnimales(Array.isArray(data) ? data : data.data || []);
                }

                // Fetch productions to find max ID for the tag
                const [lecheRes, carneRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/produccion/leche`, { headers }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/produccion/carne`, { headers })
                ]);

                if (lecheRes.ok && carneRes.ok) {
                    const leche = await lecheRes.json();
                    const carne = await carneRes.json();
                    const allIds = [
                        ...(Array.isArray(leche) ? leche : []).map((r: any) => r.id),
                        ...(Array.isArray(carne) ? carne : []).map((r: any) => r.id)
                    ];
                    if (allIds.length > 0) {
                        setMaxId(Math.max(...allIds));
                    }
                }
            } catch (err) {
                toast({ title: "Error", description: "No se pudieron cargar los animales.", variant: "destructive" });
            } finally {
                setDataLoading(false);
            }
        };
        fetchData();
    }, [router, toast]);

    useEffect(() => {
        if (formData.animalId) {
            const date = new Date();
            const ddmmyy = date.getDate().toString().padStart(2, '0') +
                (date.getMonth() + 1).toString().padStart(2, '0') +
                date.getFullYear().toString().slice(-2);

            let nuevoNumero = "";
            if (tipo === 'leche') {
                nuevoNumero = `L-${ddmmyy}-${(maxId + 1).toString().padStart(3, '0')}`;
            } else {
                nuevoNumero = `C-${ddmmyy}-${formData.animalId.padStart(3, '0')}`;
            }

            setFormData(prev => ({
                ...prev,
                numero_produccion: nuevoNumero
            }));
        }
    }, [tipo, formData.animalId, maxId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) { router.push('/login'); return; }

            if (tipo === 'leche') {
                const valid = lecheSchema.parse({
                    animalId: formData.animalId,
                    numero_produccion: formData.numero_produccion,
                    cantidad: formData.cantidad ? Number(formData.cantidad) : undefined,
                });

                await produccionApi.createLeche({
                    numero_produccion: valid.numero_produccion,
                    cantidad: valid.cantidad,
                    animalId: Number(valid.animalId),
                }, token);
            } else {
                const valid = carneSchema.parse({
                    animalId: formData.animalId,
                    peso_canal: formData.peso_canal ? Number(formData.peso_canal) : undefined,
                });

                await produccionApi.createCarne({
                    peso_canal: valid.peso_canal,
                    animalId: Number(valid.animalId),
                }, token);
            }

            toast({
                title: "¡Registro Creado!",
                description: `Producción de ${tipo} registrada correctamente.`,
                className: "bg-green-600 text-white"
            });

            router.push("/produccion");

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
            <Link href="/produccion">
                <Button variant="ghost" size="sm" className="mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Volver
                </Button>
            </Link>

            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl">Registrar Producción</CardTitle>
                    <CardDescription>Campos con * son obligatorios</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Tipo */}
                        <div>
                            <Label>Tipo de Producción *</Label>
                            <Select value={tipo} onValueChange={(v: 'leche' | 'carne') => setTipo(v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="leche">
                                        <span className="flex items-center gap-2">
                                            <Droplets className="w-4 h-4 text-blue-600" /> Leche
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="carne">
                                        <span className="flex items-center gap-2">
                                            <Beef className="w-4 h-4 text-amber-600" /> Carne
                                        </span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Animal */}
                        <div>
                            <Label>Animal *</Label>
                            <Select
                                value={formData.animalId}
                                onValueChange={(v) => setFormData({ ...formData, animalId: v })}
                                disabled={filteredAnimales.length === 0}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={filteredAnimales.length === 0 ? "No hay animales aptos" : "Selecciona un animal"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredAnimales.map((a) => (
                                        <SelectItem key={a.animal_id} value={a.animal_id.toString()}>
                                            {a.nombre || 'Sin nombre'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Campos condicionales */}
                        {tipo === 'leche' ? (
                            <>
                                <div>
                                    <Label>Número de Producción</Label>
                                    <div className="relative">
                                        <Hash className="absolute left-2 top-2.5 h-4 w-4 text-blue-400" />
                                        <Input
                                            className="pl-8 bg-zinc-50 border-zinc-200 text-zinc-500 font-mono"
                                            readOnly
                                            placeholder="Generando..."
                                            value={formData.numero_produccion}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label>Cantidad (Litros) *</Label>
                                    <div className="relative">
                                        <Droplets className="absolute left-2 top-2.5 h-4 w-4 text-blue-400" />
                                        <Input
                                            type="number" step="0.1" min="0.1" max="60" className="pl-8"
                                            placeholder="Ej: 12.5"
                                            value={formData.cantidad}
                                            onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <Label>Número de Producción</Label>
                                    <div className="relative">
                                        <Hash className="absolute left-2 top-2.5 h-4 w-4 text-amber-400" />
                                        <Input
                                            className="pl-8 bg-zinc-50 border-zinc-200 text-zinc-500 font-mono"
                                            readOnly
                                            placeholder="Generando..."
                                            value={formData.numero_produccion}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label>Peso en Canal (kg) *</Label>
                                    <div className="relative">
                                        <Scale className="absolute left-2 top-2.5 h-4 w-4 text-amber-400" />
                                        <Input
                                            type="number"
                                            step="0.1"
                                            min="10"
                                            className="pl-8"
                                            placeholder="Ej: 250"
                                            value={formData.peso_canal}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setFormData({ ...formData, peso_canal: val });

                                                // Validación personalizada (62% del peso actual)
                                                const selectedAnimal = animales.find(a => a.animal_id.toString() === formData.animalId);
                                                if (selectedAnimal && val) {
                                                    const currentWeight = Number(selectedAnimal.peso_actual) || (selectedAnimal as any).ultimo_peso || (selectedAnimal as any).ultimoPeso || 0;
                                                    const maxAllowed = currentWeight * 0.62;
                                                    if (Number(val) > maxAllowed) {
                                                        e.target.setCustomValidity(`El peso del canal (${val} kg) excede el rendimiento máximo del 62% (${maxAllowed.toFixed(2)} kg) para un animal de ${currentWeight} kg`);
                                                    } else {
                                                        e.target.setCustomValidity("");
                                                    }
                                                } else {
                                                    e.target.setCustomValidity("");
                                                }
                                            }}
                                            onInvalid={(e) => {
                                                // El mensaje ya está seteado por setCustomValidity
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                {loading ? "Registrando..." : "Registrar"}
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
