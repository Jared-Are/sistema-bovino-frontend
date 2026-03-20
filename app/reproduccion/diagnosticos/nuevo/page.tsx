"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Stethoscope, Loader2, Save, Calendar } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

function DiagnosticoForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const montaId = searchParams.get("montaId");
    const { toast } = useToast();
    
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        metodo: "Palpación",
        resultado: "Positivo",
        fecha_programacion: new Date().toISOString().split('T')[0]
    });

    // Si el usuario entró a la página sin un ID de monta, no lo dejamos avanzar
    if (!montaId) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">Error: No se recibió el ID del servicio a evaluar.</p>
                <Link href="/reproduccion"><Button variant="outline">Volver</Button></Link>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        console.log("🚀 Iniciando envío de diagnóstico...");

        try {
            const token = localStorage.getItem('token');
            const payload = {
                montaId: Number(montaId),
                metodo: formData.metodo,
                resultado: formData.resultado,
                fecha_programacion: formData.fecha_programacion
            };

            console.log("📦 Payload a enviar al backend:", payload);

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reproduccion/diagnosticos`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(payload)
            });

            console.log("📡 Status del backend:", res.status);

            // Blindaje: Verificamos si la respuesta realmente es JSON
            const isJson = res.headers.get("content-type")?.includes("application/json");
            let data;
            
            if (isJson) {
                data = await res.json();
            } else {
                // Si el backend colapsó y mandó HTML, lo atrapamos aquí
                const errorText = await res.text();
                console.error("❌ El backend devolvió texto/HTML en lugar de JSON:", errorText);
                throw new Error("El servidor falló de forma inesperada. Revisa la consola.");
            }

            if (!res.ok) {
                throw new Error(data.message || "Error al registrar el diagnóstico");
            }

            console.log("✅ ¡Diagnóstico guardado con éxito!");

            toast({ 
                title: "¡Diagnóstico Registrado!", 
                description: `La vaca ahora está ${formData.resultado === 'Positivo' ? 'Gestante' : 'Vacía'}.`, 
                className: "bg-emerald-600 text-white" 
            });
            
            router.push("/reproduccion");
            
        } catch (err: any) {
            console.error("🚨 Error capturado en el catch:", err);
            toast({ 
                title: "Error", 
                description: err.message, 
                variant: "destructive" 
            });
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
                {/* Le quitamos el onSubmit al form para que no interfiera */}
                <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Método de Evaluación</Label>
                            <Select value={formData.metodo} onValueChange={(v) => setFormData({...formData, metodo: v})}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Palpación">Palpación Rectal</SelectItem>
                                    <SelectItem value="Ecografía">Ecografía / Ultrasonido</SelectItem>
                                    <SelectItem value="Observación">Observación de Celo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Fecha de Evaluación</Label>
                            <div className="relative">
                                <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                <Input type="date" className="pl-8" value={formData.fecha_programacion} onChange={(e) => setFormData({...formData, fecha_programacion: e.target.value})} required />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
                        <Label className="text-md font-bold text-zinc-800">Resultado Final</Label>
                        <Select value={formData.resultado} onValueChange={(v) => setFormData({...formData, resultado: v})}>
                            <SelectTrigger className="h-12 text-lg font-bold"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Positivo" className="text-emerald-600 font-bold">Positivo (Preñada)</SelectItem>
                                <SelectItem value="Negativo" className="text-red-600 font-bold">Negativo (Vacía)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Link href="/reproduccion"><Button type="button" variant="outline">Cancelar</Button></Link>
                        
                        {/* Botón blindado con el onClick directo */}
                        <Button 
                            type="button" 
                            onClick={handleSubmit} 
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

// Envolvemos el componente que usa useSearchParams en un Suspense (Requisito de Next.js)
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