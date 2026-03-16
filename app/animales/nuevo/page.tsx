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
    Upload,
    Image as ImageIcon,
    X,
    Calendar,
    Weight,
    Scale
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const soloLetrasRegex = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/;
const areteRegex = /^[A-Z0-9]{3,10}$/;

const animalSchema = z.object({
    arete: z.string()
        .min(3, "El arete es muy corto (mín 3 caracteres).")
        .max(10, "El arete es muy largo (máx 10).")
        .regex(areteRegex, "Solo letras mayúsculas y números."),
    nombre: z.string()
        .min(2, "El nombre es muy corto.")
        .max(40, "El nombre es muy largo.")
        .regex(soloLetrasRegex, "El nombre solo debe contener letras.")
        .optional()
        .or(z.literal('')),
    sexo: z.enum(['Macho', 'Hembra']),
    razaId: z.string().min(1, "Selecciona una raza."),
    loteId: z.string().optional(),
    potreroId: z.string().optional(),
    fechaNacimiento: z.string().min(1, "La fecha de nacimiento es requerida."),
    fechaDestete: z.string().optional(),
    pesoNacimiento: z.coerce.number()
        .min(20, "El peso mínimo al nacer es 20 kg.")
        .max(50, "El peso máximo al nacer es 50 kg.")
        .optional(),
    pesoActual: z.coerce.number()
        .min(20, "El peso mínimo es 20 kg.")
        .max(800, "El peso máximo es 800 kg.")
        .optional(),
    animalMadreId: z.string().optional(),
    animalPadreId: z.string().optional(),
});

type Raza = { raza_id: number; nombre: string; };
type Lote = { lote_id: number; nombre: string; };
type Potrero = { potrero_id: number; nombre: string; };
type AnimalSimple = { animal_id: number; arete: string; nombre: string; };

export default function NuevoAnimalPage() {
    const router = useRouter();
    const { toast } = useToast();
    
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    
    const [fotoUrl, setFotoUrl] = useState("");
    
    const [razas, setRazas] = useState<Raza[]>([]);
    const [lotes, setLotes] = useState<Lote[]>([]);
    const [potreros, setPotreros] = useState<Potrero[]>([]);
    const [animales, setAnimales] = useState<AnimalSimple[]>([]);
    
    const [formData, setFormData] = useState({
        arete: "",
        nombre: "",
        sexo: "Hembra",
        razaId: "",
        loteId: "",
        potreroId: "",
        fechaNacimiento: new Date().toISOString().split('T')[0],
        fechaDestete: "",
        pesoNacimiento: "",
        pesoActual: "",
        animalMadreId: "",
        animalPadreId: "",
    });

    useEffect(() => {
        if (formData.pesoNacimiento && !formData.pesoActual) {
            setFormData(prev => ({ ...prev, pesoActual: prev.pesoNacimiento }));
        }
    }, [formData.pesoNacimiento]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
        }
    }, [router]);

    useEffect(() => {
        const fetchData = async () => {
            setDataLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    router.push('/login');
                    return;
                }

                const headers = { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };

                const [razasRes, lotesRes, potrerosRes, animalesRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/parametros/razas`, { headers }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/parametros/lotes`, { headers }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/parametros/potreros`, { headers }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/animales?limit=100`, { headers })
                ]);

                if (razasRes.ok) setRazas(await razasRes.json());
                if (lotesRes.ok) setLotes(await lotesRes.json());
                if (potrerosRes.ok) setPotreros(await potrerosRes.json());
                if (animalesRes.ok) setAnimales(await animalesRes.json());

            } catch (err) {
                toast({ title: "Error", description: "No se pudieron cargar los datos.", variant: "destructive" });
            } finally {
                setDataLoading(false);
            }
        };
        fetchData();
    }, [router, toast]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!e.target.files?.length) return;
            
            setUploading(true);
            const file = e.target.files[0];

            if (!file.type.startsWith('image/')) throw new Error("Solo imágenes");
            if (file.size > 5 * 1024 * 1024) throw new Error("Máximo 5MB");

            const fileExt = file.name.split('.').pop();
            const fileName = `animal_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `animales/${fileName}`;

            const formData = new FormData();
            formData.append('file', file);

            const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

            const response = await fetch(
                `${SUPABASE_URL}/storage/v1/object/ganado/${filePath}`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                        'apikey': SUPABASE_ANON_KEY!,
                    },
                    body: formData,
                }
            );

            if (!response.ok) throw new Error("Error al subir");

            const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/ganado/${filePath}`;
            setFotoUrl(publicUrl);
            toast({ title: "Imagen subida" });

        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = () => setFotoUrl("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const datosParaValidar = {
                ...formData,
                pesoNacimiento: formData.pesoNacimiento ? Number(formData.pesoNacimiento) : undefined,
                pesoActual: formData.pesoActual ? Number(formData.pesoActual) : undefined,
            };

            const valid = animalSchema.parse(datosParaValidar);

            const payload = {
                arete: valid.arete.toUpperCase(),
                nombre: valid.nombre || null,
                sexo: valid.sexo,
                raza_id: Number(valid.razaId),
                lote_id: valid.loteId === "sin-lote" ? null : valid.loteId ? Number(valid.loteId) : null,
                potrero_id: valid.potreroId === "sin-potrero" ? null : valid.potreroId ? Number(valid.potreroId) : null,
                fecha_nacimiento: valid.fechaNacimiento,
                fecha_destete: valid.fechaDestete || null,
                peso_nacimiento: valid.pesoNacimiento || 0,
                peso_actual: valid.pesoActual || valid.pesoNacimiento || 0,
                animal_madre_id: valid.animalMadreId === "sin-madre" ? null : valid.animalMadreId ? Number(valid.animalMadreId) : null,
                animal_padre_id: valid.animalPadreId === "sin-padre" ? null : valid.animalPadreId ? Number(valid.animalPadreId) : null,
                imagen: fotoUrl || null,
            };

            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/animales`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            const responseText = await response.text();

            if (!response.ok) {
                let errorData;
                try { errorData = JSON.parse(responseText); } 
                catch { errorData = { message: responseText }; }
                throw new Error(errorData.message || "Error al registrar");
            }

            toast({ 
                title: "¡Animal Registrado!", 
                description: `Animal con arete ${valid.arete} registrado.`,
                className: "bg-green-600 text-white" 
            });
            
            router.push("/animales");

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
            <Link href="/animales">
                <Button variant="ghost" size="sm" className="mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Volver
                </Button>
            </Link>

            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>Registrar Nuevo Animal</CardTitle>
                    <CardDescription>Campos con * son obligatorios</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Foto */}
                        <div className="space-y-2">
                            <Label>Fotografía</Label>
                            <div className="flex items-start gap-6 border p-4 rounded-lg bg-gray-50">
                                <div className="relative h-32 w-48 bg-white rounded-md border flex items-center justify-center overflow-hidden shrink-0">
                                    {uploading ? (
                                        <Loader2 className="h-8 w-8 animate-spin" />
                                    ) : fotoUrl ? (
                                        <>
                                            <img src={fotoUrl} alt="Vista previa" className="h-full w-full object-cover" />
                                            <button type="button" onClick={handleRemoveImage} 
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="text-center p-2">
                                            <ImageIcon className="h-8 w-8 text-gray-300 mx-auto mb-1" />
                                            <span className="text-xs text-gray-400">Sin imagen</span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="foto-upload" className="cursor-pointer">
                                        <div className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-md">
                                            <Upload className="h-4 w-4" /> 
                                            {fotoUrl ? "Cambiar" : "Subir"}
                                        </div>
                                    </Label>
                                    <Input id="foto-upload" type="file" accept="image/*" 
                                        className="hidden" onChange={handleImageUpload} 
                                        disabled={uploading || loading} />
                                </div>
                            </div>
                        </div>

                        {/* Datos básicos */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="arete">Arete *</Label>
                                <Input id="arete" value={formData.arete} 
                                    onChange={(e) => setFormData({...formData, arete: e.target.value.toUpperCase()})}
                                    required maxLength={10} />
                            </div>
                            <div>
                                <Label htmlFor="nombre">Nombre</Label>
                                <Input id="nombre" value={formData.nombre} 
                                    onChange={(e) => /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]*$/.test(e.target.value) && 
                                        setFormData({...formData, nombre: e.target.value})} />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label>Sexo *</Label>
                                <Select value={formData.sexo} 
                                    onValueChange={(v: "Macho" | "Hembra") => setFormData({...formData, sexo: v})}>
                                    <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Hembra">Hembra</SelectItem>
                                        <SelectItem value="Macho">Macho</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Raza *</Label>
                                <Select value={formData.razaId} onValueChange={(v) => setFormData({...formData, razaId: v})}>
                                    <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                                    <SelectContent>
                                        {razas.map((r) => (
                                            <SelectItem key={r.raza_id} value={r.raza_id.toString()}>{r.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label>Lote</Label>
                                <Select value={formData.loteId} onValueChange={(v) => setFormData({...formData, loteId: v})}>
                                    <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sin-lote">Sin lote</SelectItem>
                                        {lotes.map((l) => (
                                            <SelectItem key={l.lote_id} value={l.lote_id.toString()}>{l.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Potrero</Label>
                                <Select value={formData.potreroId} onValueChange={(v) => setFormData({...formData, potreroId: v})}>
                                    <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sin-potrero">Sin potrero</SelectItem>
                                        {potreros.map((p) => (
                                            <SelectItem key={p.potrero_id} value={p.potrero_id.toString()}>{p.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label>Fecha Nacimiento *</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input type="date" className="pl-8" value={formData.fechaNacimiento}
                                        onChange={(e) => setFormData({...formData, fechaNacimiento: e.target.value})}
                                        required />
                                </div>
                            </div>
                            <div>
                                <Label>Fecha Destete</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input type="date" className="pl-8" value={formData.fechaDestete}
                                        onChange={(e) => setFormData({...formData, fechaDestete: e.target.value})} />
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label>Peso al Nacer (kg)</Label>
                                <div className="relative">
                                    <Weight className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input type="number" step="0.1" min="20" max="50" className="pl-8"
                                        value={formData.pesoNacimiento}
                                        onChange={(e) => setFormData({...formData, pesoNacimiento: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <Label>Peso Actual (kg)</Label>
                                <div className="relative">
                                    <Scale className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input type="number" step="0.1" min="20" max="800" className="pl-8"
                                        value={formData.pesoActual}
                                        onChange={(e) => setFormData({...formData, pesoActual: e.target.value})} />
                                </div>
                                <p className="text-xs mt-1">Si no se ingresa, se usa el peso al nacer</p>
                            </div>
                        </div>

                        {/* Padres */}
                        <div className="border-t pt-4">
                            <h3 className="text-sm font-semibold mb-4">Genealogía (Opcional)</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Madre</Label>
                                    <Select value={formData.animalMadreId} 
                                        onValueChange={(v) => setFormData({...formData, animalMadreId: v})}>
                                        <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="sin-madre">Sin madre</SelectItem>
                                            {animales.filter(a => a.animal_id !== Number(formData.animalPadreId))
                                                .map((a) => (
                                                    <SelectItem key={a.animal_id} value={a.animal_id.toString()}>
                                                        {a.arete} - {a.nombre || 'Sin nombre'}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Padre</Label>
                                    <Select value={formData.animalPadreId} 
                                        onValueChange={(v) => setFormData({...formData, animalPadreId: v})}>
                                        <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="sin-padre">Sin padre</SelectItem>
                                            {animales.filter(a => a.animal_id !== Number(formData.animalMadreId))
                                                .map((a) => (
                                                    <SelectItem key={a.animal_id} value={a.animal_id.toString()}>
                                                        {a.arete} - {a.nombre || 'Sin nombre'}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" disabled={loading || uploading} className="bg-emerald-600">
                                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                {loading ? "Registrando..." : "Registrar"}
                            </Button>
                            <Link href="/animales">
                                <Button type="button" variant="outline">Cancelar</Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}