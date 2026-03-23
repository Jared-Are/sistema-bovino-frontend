"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Baby, Loader2, CheckCircle2, Sparkles, Save, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// 👇 FIX TYPESCRIPT: El esquema base y su refinamiento separados
const basePartoSchema = z.object({
    numero_parto: z.string().min(3, "El código del parto es requerido."),
    tipo_parto: z.enum(["Normal", "Distocico", "Aborto"]),
    nombre_cria: z.string().optional(),
    sexo_cria: z.enum(["Hembra", "Macho"]),
});

const partoSchema = basePartoSchema.refine(data => {
    if (data.tipo_parto !== "Aborto" && (!data.nombre_cria || data.nombre_cria.length < 2)) {
        return false;
    }
    return true;
}, {
    message: "Debes ingresar un nombre válido para la cría.",
    path: ["nombre_cria"] 
});

export default function PantallaPartosPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    
    const [vacasGestantes, setVacasGestantes] = useState<any[]>([]);
    const [selectedDiag, setSelectedDiag] = useState<any>(null);

    const [formParto, setFormParto] = useState({
        numero_parto: `P-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
        tipo_parto: "Normal" as "Normal" | "Distocico" | "Aborto",
        nombre_cria: "",
        sexo_cria: "Hembra" as "Hembra" | "Macho"
    });

    useEffect(() => {
        const fetchGestantes = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reproduccion/diagnosticos`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                setVacasGestantes(Array.isArray(data) ? data.filter((d: any) => d.resultado === 'Positivo') : []);
            } catch (err) {
                toast({ title: "Error", description: "No se pudieron cargar los datos.", variant: "destructive" });
            } finally {
                setDataLoading(false);
            }
        };
        fetchGestantes();
    }, [toast]);

    const validateField = (field: keyof typeof formParto, value: any) => {
        try {
            // Usamos basePartoSchema aquí
            const fieldSchema = basePartoSchema.shape[field as keyof typeof basePartoSchema.shape];
            if (fieldSchema) fieldSchema.parse(value);
            setFieldErrors(prev => ({ ...prev, [field]: "" }));
        } catch (error) {
            if (error instanceof z.ZodError) {
                const message = error.errors[0]?.message || "Campo inválido";
                setFieldErrors(prev => ({ ...prev, [field]: message }));
            }
        }
    };

    const handleRegistrarParto = async () => {
        if (!selectedDiag) return toast({ title: "Atención", description: "Selecciona una vaca de la lista.", variant: "destructive" });
        
        setFieldErrors({});
        setLoading(true);

        try {
            // Usamos el esquema completo (partoSchema) para enviar datos
            const valid = partoSchema.parse(formParto);

            const token = localStorage.getItem('token');
            const payload = {
                diagnosticoId: Number(selectedDiag.id),
                numero_parto: valid.numero_parto,
                tipo_parto: valid.tipo_parto,
                nombre_animal: valid.tipo_parto === "Aborto" ? null : valid.nombre_cria,
                sexo: valid.tipo_parto === "Aborto" ? null : valid.sexo_cria
            };

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reproduccion/partos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            const resData = await res.json();

            if (!res.ok) throw new Error(resData.message || "Error al guardar el parto");

            toast({ title: "¡Parto Exitoso!", description: "El registro ha sido procesado correctamente.", className: "bg-emerald-600 text-white" });
            router.push("/reproduccion");
        } catch (err: any) {
            if (err instanceof z.ZodError) {
                const errors: Record<string, string> = {};
                err.errors.forEach(e => {
                    if (e.path[0]) errors[e.path[0].toString()] = e.message;
                });
                setFieldErrors(errors);
            } else {
                toast({ title: "Error del servidor", description: err.message, variant: "destructive" });
            }
        } finally {
            setLoading(false);
        }
    };

    if (dataLoading) return <div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin h-10 w-10 text-emerald-600" /></div>;

    return (
        <div className="min-h-screen bg-zinc-50 p-8">
            <Link href="/reproduccion"><Button variant="ghost" className="mb-6"><ArrowLeft className="mr-2 h-4 w-4" /> Volver</Button></Link>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold text-zinc-800 flex items-center gap-2">
                        <Baby className="text-emerald-600 h-6 w-6" /> Vacas Gestantes
                    </h2>
                    
                    <div className="grid gap-3">
                        {vacasGestantes.length === 0 ? (
                            <p className="text-zinc-500 italic p-6 bg-white rounded-lg border border-dashed border-zinc-300 text-center">No hay vacas esperando parto en este momento.</p>
                        ) : (
                            vacasGestantes.map((diag: any) => (
                                <Card 
                                    key={diag.id} 
                                    className={`cursor-pointer border-l-4 transition-all ${selectedDiag?.id === diag.id ? 'border-l-emerald-500 shadow-md bg-emerald-50/30' : 'border-l-zinc-300 hover:border-l-emerald-400'}`}
                                    onClick={() => setSelectedDiag(diag)}
                                >
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-zinc-900">{diag.monta.hembra.arete} - {diag.monta.hembra.nombre}</p>
                                            <p className="text-xs text-zinc-500">Confirmada el {new Date(diag.fecha_creacion).toLocaleDateString()}</p>
                                        </div>
                                        {selectedDiag?.id === diag.id && <CheckCircle2 className="text-emerald-500 h-5 w-5" />}
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <Card className="border-zinc-200 shadow-sm sticky top-6">
                        <CardHeader className="bg-zinc-50 border-b">
                            <CardTitle className="text-md flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-amber-500" /> Datos del Nacimiento
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            {!selectedDiag ? (
                                <div className="text-center py-6 text-zinc-400 text-sm italic">Selecciona una vaca gestante a la izquierda para comenzar.</div>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <Label>Código de Parto</Label>
                                        <Input 
                                            value={formParto.numero_parto} 
                                            onChange={(e) => {
                                                setFormParto({...formParto, numero_parto: e.target.value});
                                                validateField("numero_parto", e.target.value);
                                            }} 
                                            className={fieldErrors.numero_parto ? "border-red-500 focus-visible:ring-red-500" : ""}
                                        />
                                        {fieldErrors.numero_parto && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{fieldErrors.numero_parto}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Tipo de Parto</Label>
                                        <Select value={formParto.tipo_parto} onValueChange={(v: "Normal" | "Distocico" | "Aborto") => setFormParto({...formParto, tipo_parto: v})}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Normal">Normal</SelectItem>
                                                <SelectItem value="Distocico">Asistido / Distócico</SelectItem>
                                                <SelectItem value="Aborto">Aborto</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {formParto.tipo_parto !== "Aborto" && (
                                        <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-lg space-y-4 mt-4">
                                            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Datos de la Cría</p>
                                            <div className="space-y-2">
                                                <Label>Nombre del Ternero/a <span className="text-red-500">*</span></Label>
                                                <Input 
                                                    placeholder="Ej: Lucero" 
                                                    value={formParto.nombre_cria} 
                                                    onChange={(e) => {
                                                        setFormParto({...formParto, nombre_cria: e.target.value});
                                                        setFieldErrors(prev => ({...prev, nombre_cria: ""})); 
                                                    }} 
                                                    className={`bg-white ${fieldErrors.nombre_cria ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                                />
                                                {fieldErrors.nombre_cria && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{fieldErrors.nombre_cria}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Sexo</Label>
                                                <Select value={formParto.sexo_cria} onValueChange={(v: "Macho" | "Hembra") => setFormParto({...formParto, sexo_cria: v})}>
                                                    <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Hembra">Hembra</SelectItem>
                                                        <SelectItem value="Macho">Macho</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    )}

                                    <Button onClick={handleRegistrarParto} disabled={loading} className="w-full bg-zinc-900 hover:bg-zinc-800 text-white mt-4 h-12">
                                        {loading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Save className="mr-2 h-5 w-5" />}
                                        Finalizar Registro
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}