"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Stethoscope, Loader2, Save, Calendar, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const hoyStr = new Date().toISOString().split("T")[0];

// ESQUEMA ZOD
const diagnosticoSchema = z.object({
  metodo: z.enum(["Palpación", "Ecografía", "Observación"]),
  resultado: z.enum(["Positivo", "Negativo"]),
  fecha_programacion: z.string()
    .min(1, "La fecha de evaluación es obligatoria.")
    .refine((date) => date <= hoyStr, { message: "No puedes registrar fechas futuras." }),
});

function DiagnosticoForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const montaId = searchParams.get("montaId");
    const { toast } = useToast();
    
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    
    const [formData, setFormData] = useState({
        metodo: "Palpación" as "Palpación" | "Ecografía" | "Observación",
        resultado: "Positivo" as "Positivo" | "Negativo",
        fecha_programacion: new Date().toISOString().split('T')[0]
    });

    if (!montaId) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">Error: No se recibió el ID del servicio a evaluar.</p>
                <Link href="/reproduccion"><Button variant="outline">Volver</Button></Link>
            </div>
        );
    }

    const validateField = (field: keyof typeof formData, value: any) => {
        try {
            const fieldSchema = diagnosticoSchema.shape[field as keyof typeof diagnosticoSchema.shape];
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
            const valid = diagnosticoSchema.parse(formData);
            const token = localStorage.getItem('token');
            const payload = {
                montaId: Number(montaId),
                metodo: valid.metodo,
                resultado: valid.resultado,
                fecha_programacion: valid.fecha_programacion
            };

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reproduccion/diagnosticos`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(payload)
            });

            const isJson = res.headers.get("content-type")?.includes("application/json");
            let data;
            if (isJson) {
                data = await res.json();
            } else {
                const errorText = await res.text();
                throw new Error("El servidor falló de forma inesperada. Revisa la consola.");
            }

            if (!res.ok) {
                throw new Error(data.message || "Error al registrar el diagnóstico");
            }

            toast({ 
                title: "¡Diagnóstico Registrado!", 
                description: `La vaca ahora está ${formData.resultado === 'Positivo' ? 'Gestante' : 'Vacía'}.`, 
                className: "bg-green-600 text-white" 
            });
            
            router.push("/reproduccion");
            
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

    return (
        <Card className="max-w-2xl mx-auto border-blue-100 shadow-sm">
            <CardHeader className="bg-blue-50/50 border-b border-blue-100 pb-6">
                <div className="flex items-center gap-2">
                    <Stethoscope className="h-6 w-6 text-blue-600" />
                    <CardTitle>Evaluar Preñez</CardTitle>
                </div>
                <CardDescription>Registra el resultado de la evaluación para el servicio seleccionado.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Método de Evaluación</Label>
                            <Select value={formData.metodo} onValueChange={(v: any) => setFormData({...formData, metodo: v})}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Palpación">Palpación Rectal</SelectItem>
                                    <SelectItem value="Ecografía">Ecografía / Ultrasonido</SelectItem>
                                    <SelectItem value="Observación">Observación de Celo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Fecha de Evaluación *</Label>
                            <div className="relative">
                                <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                <Input type="date"  max={hoyStr}  className={`pl-8 ${fieldErrors.fecha_programacion ? "border-red-500 focus-visible:ring-red-500" : ""}`} 
                                    value={formData.fecha_programacion} 
                                    onChange={(e) => {
                                        setFormData({...formData, fecha_programacion: e.target.value});
                                        validateField('fecha_programacion', e.target.value);
                                    }} 
                                    required 
                                />
                            </div>
                            {fieldErrors.fecha_programacion && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{fieldErrors.fecha_programacion}</p>}
                        </div>
                    </div>

                    <div className="space-y-2 p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
                        <Label className="text-md font-bold text-zinc-800">Resultado Final</Label>
                        <Select value={formData.resultado} onValueChange={(v: any) => setFormData({...formData, resultado: v})}>
                            <SelectTrigger className="h-12 text-lg font-bold"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Positivo" className="text-emerald-600 font-bold">Positivo (Preñada)</SelectItem>
                                <SelectItem value="Negativo" className="text-red-600 font-bold">Negativo (Vacía)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Link href="/reproduccion">
                            <Button type="button" variant="outline">Cancelar</Button>
                        </Link>
                        
                        <Button 
                            type="submit" 
                            disabled={loading} 
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Confirmar Diagnóstico
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

// Envolvemos el componente que usa useSearchParams en un Suspense
export default function DiagnosticoPage() {
    return (
        <div className="min-h-screen bg-zinc-50 p-8">
            <Link href="/reproduccion">
                <Button variant="ghost" size="sm" className="mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Volver
                </Button>
            </Link>
            <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>}>
                <DiagnosticoForm />
            </Suspense>
        </div>
    );
}