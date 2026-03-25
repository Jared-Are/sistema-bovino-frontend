'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Loader2, Calendar, Activity, Stethoscope, Syringe, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// 👇 FIX TYPESCRIPT: Separamos el esquema base de la condición refine
const baseReproduccionSchema = z.object({
    animalId: z.string().min(1, "Selecciona la vaca o novilla."),
    tipoServicio: z.enum(['Monta Natural', 'Inseminación Artificial']),
    fechaServicio: z.string().min(1, "La fecha del servicio es requerida."),
    toroId: z.string().optional(),
    codigo_pajilla: z.string().optional() 
});

const reproduccionSchema = baseReproduccionSchema.refine(data => {
    if (data.tipoServicio === "Inseminación Artificial" && (!data.codigo_pajilla || data.codigo_pajilla.length < 2)) {
        return false;
    }
    return true;
}, {
    message: "El código de pajilla es obligatorio para IA.",
    path: ["codigo_pajilla"]
});

type AnimalSimple = { animal_id: number; arete: string; nombre: string; sexo: string; };

export default function NuevoRegistroReproduccionPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    
    const [vacas, setVacas] = useState<AnimalSimple[]>([]);
    const [toros, setToros] = useState<AnimalSimple[]>([]);
    
    const [formData, setFormData] = useState({
        animalId: "",
        tipoServicio: "Monta Natural" as "Monta Natural" | "Inseminación Artificial",
        fechaServicio: new Date().toISOString().split('T')[0],
        toroId: "sin-toro",
        codigo_pajilla: "" 
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        const fetchData = async () => {
            setDataLoading(true);
            try {
                const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
                const animalesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/animales?limit=200`, { headers });
                if (animalesRes.ok) {
                    const animalesData: AnimalSimple[] = await animalesRes.json();
                    setVacas(animalesData.filter(a => a.sexo.toLowerCase() === 'hembra'));
                    setToros(animalesData.filter(a => a.sexo.toLowerCase() === 'macho'));
                }
            } catch (err) {
                toast({ title: "Error", description: "No se pudieron cargar los animales.", variant: "destructive" });
            } finally {
                setDataLoading(false);
            }
        };
        fetchData();
    }, [router, toast]);

    const validateField = (field: keyof typeof formData, value: any) => {
        try {
            // 👇 Usamos el base schema aquí para evitar el error de shape
            const fieldSchema = baseReproduccionSchema.shape[field as keyof typeof baseReproduccionSchema.shape];
            if (fieldSchema) fieldSchema.parse(value);
            setFieldErrors(prev => ({ ...prev, [field]: "" }));
        } catch (error) {
            if (error instanceof z.ZodError) {
                const message = error.errors[0]?.message || "Campo inválido";
                setFieldErrors(prev => ({ ...prev, [field]: message }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});
        setLoading(true);

        try {
            // 👇 Usamos el esquema completo (con refine) para validar antes de guardar
            const valid = reproduccionSchema.parse(formData);
            const codigoAutomatico = `M-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

            const payload: any = {
                numero_monta: codigoAutomatico,
                tipo_monta: valid.tipoServicio,
                estado: "En Evaluación", 
                fecha_programacion: valid.fechaServicio,
                animal_hembra_id: Number(valid.animalId)
            };

            if (valid.tipoServicio === "Monta Natural" && valid.toroId && valid.toroId !== "sin-toro") {
                payload.animal_macho_id = Number(valid.toroId);
            } else if (valid.tipoServicio === "Inseminación Artificial" && valid.codigo_pajilla) {
                payload.codigo_pajilla = valid.codigo_pajilla; 
            }

            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reproduccion/montas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload),
            });

            const responseText = await response.text();

            if (!response.ok) {
                let errorData;
                try { errorData = JSON.parse(responseText); } catch { errorData = { message: responseText }; }
                throw new Error(errorData.message || "Error al registrar servicio reproductivo");
            }

            toast({ title: "¡Registro Exitoso!", description: `El servicio se guardó correctamente.`, className: "bg-green-600 text-white" });
            router.push("/reproduccion"); 

        } catch (err: any) {
            if (err instanceof z.ZodError) {
                const errors: Record<string, string> = {};
                err.errors.forEach(e => { if (e.path[0]) errors[e.path[0].toString()] = e.message; });
                setFieldErrors(errors);
            } else {
                toast({ title: "Error al guardar", description: err.message, variant: "destructive" });
            }
        } finally {
            setLoading(false);
        }
    };

    if (dataLoading) return <div className="min-h-screen bg-zinc-50 p-8 flex justify-center items-center"><Loader2 className="h-10 w-10 animate-spin text-emerald-600" /></div>;

    return (
        <div className="min-h-screen bg-zinc-50 p-8">
            <Link href="/reproduccion"><Button variant="ghost" size="sm" className="mb-6"><ArrowLeft className="h-4 w-4 mr-2" /> Volver</Button></Link>
            <Card className="max-w-3xl mx-auto border-emerald-100 shadow-sm">
                <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 pb-6">
                    <div className="flex items-center gap-2"><Activity className="h-6 w-6 text-emerald-600" /><CardTitle>Registrar Servicio Reproductivo</CardTitle></div>
                    <CardDescription>Anota una nueva monta o inseminación para llevar el control de gestación.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label>Vaca o Novilla (Hembra) *</Label>
                            <Select value={formData.animalId} onValueChange={(v) => {
                                setFormData({...formData, animalId: v});
                                validateField('animalId', v);
                            }}>
                                <SelectTrigger className={fieldErrors.animalId ? "border-red-500 focus-visible:ring-red-500" : ""}><SelectValue placeholder="Selecciona la vaca a servir" /></SelectTrigger>
                                <SelectContent>
                                    {vacas.map((v) => <SelectItem key={v.animal_id} value={v.animal_id.toString()}>{v.arete} - {v.nombre || 'Sin nombre'}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {fieldErrors.animalId && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{fieldErrors.animalId}</p>}
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tipo de Servicio *</Label>
                                <Select value={formData.tipoServicio} 
                                    onValueChange={(v: "Monta Natural" | "Inseminación Artificial") => setFormData({...formData, tipoServicio: v, toroId: "sin-toro", codigo_pajilla: ""})}>
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
                                    <Input type="date" className={`pl-8 ${fieldErrors.fechaServicio ? "border-red-500 focus-visible:ring-red-500" : ""}`} value={formData.fechaServicio}
                                        onChange={(e) => {
                                            setFormData({...formData, fechaServicio: e.target.value});
                                            validateField('fechaServicio', e.target.value);
                                        }} required />
                                </div>
                            </div>
                        </div>

                        {formData.tipoServicio === "Monta Natural" ? (
                            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                                <Label className="flex items-center gap-2 mb-2"><Stethoscope className="h-4 w-4 text-emerald-600" /> Semental (Toro)</Label>
                                <Select value={formData.toroId} onValueChange={(v) => setFormData({...formData, toroId: v})}>
                                    <SelectTrigger className="bg-white"><SelectValue placeholder="Selecciona el toro (Opcional)" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sin-toro">Toro externo / Desconocido</SelectItem>
                                        {toros.map((t) => <SelectItem key={t.animal_id} value={t.animal_id.toString()}>{t.arete} - {t.nombre || 'Sin nombre'}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <Label className="flex items-center gap-2 mb-2"><Syringe className="h-4 w-4 text-blue-600" /> Código de Pajilla (Semen) *</Label>
                                <Input placeholder="Ej. BR-1045" className={`bg-white ${fieldErrors.codigo_pajilla ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                    value={formData.codigo_pajilla} 
                                    onChange={(e) => {
                                        setFormData({...formData, codigo_pajilla: e.target.value});
                                        setFieldErrors(prev => ({...prev, codigo_pajilla: ""}));
                                    }} 
                                />
                                {fieldErrors.codigo_pajilla && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{fieldErrors.codigo_pajilla}</p>}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Link href="/reproduccion"><Button type="button" variant="outline">Cancelar</Button></Link>
                            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Registrar Servicio
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}