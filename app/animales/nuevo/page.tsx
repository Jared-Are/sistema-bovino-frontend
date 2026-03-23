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
    Scale,
    Droplets,
    AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const soloLetrasRegex = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/;
const areteRegex = /^[A-Z0-9]{3,10}$/;

// Obtener fecha de hoy en formato YYYY-MM-DD
const hoy = new Date();
const año = hoy.getFullYear();
const mes = String(hoy.getMonth() + 1).padStart(2, '0');
const dia = String(hoy.getDate()).padStart(2, '0');
const fechaHoy = `${año}-${mes}-${dia}`;

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
    fechaNacimiento: z.string()
        .min(1, "La fecha de nacimiento es requerida.")
        .refine(val => val <= fechaHoy, "La fecha de nacimiento no puede ser futura"),
    fechaDestete: z.string()
        .optional()
        .refine(val => !val || val <= fechaHoy, "La fecha de destete no puede ser futura"),
    pesoNacimiento: z.coerce.number()
        .min(20, "El peso mínimo al nacer es 20 kg.")
        .max(50, "El peso máximo al nacer es 50 kg.")
        .refine(val => val > 0, "El peso de nacimiento es requerido"),
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
type AnimalSimple = { animal_id: number; arete: string; nombre: string; sexo: string; };

export default function NuevoAnimalPage() {
    const router = useRouter();
    const { toast } = useToast();
    
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    
    const [fotoUrl, setFotoUrl] = useState("");
    
    const [razas, setRazas] = useState<Raza[]>([]);
    const [lotes, setLotes] = useState<Lote[]>([]);
    const [potreros, setPotreros] = useState<Potrero[]>([]);
    const [animales, setAnimales] = useState<AnimalSimple[]>([]);
    
    const [formData, setFormData] = useState({
        arete: "",
        nombre: "",
        sexo: "Hembra" as "Macho" | "Hembra",
        razaId: "",
        loteId: "",
        potreroId: "",
        fechaNacimiento: fechaHoy,
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
            router.push('/');
        }
    }, [router]);

    useEffect(() => {
        const fetchData = async () => {
            setDataLoading(true);
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

    const validateField = (field: keyof typeof formData, value: any) => {
        try {
            const fieldSchema = animalSchema.shape[field as keyof typeof animalSchema.shape];
            fieldSchema.parse(value);
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
             if (formData.fechaDestete && formData.fechaDestete < formData.fechaNacimiento) {
            setFieldErrors(prev => ({
                ...prev,
                fechaDestete: "La fecha de destete no puede ser anterior a la fecha de nacimiento"
            }));
            setLoading(false);
            return;
        }
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
                peso_nacimiento: valid.pesoNacimiento,
                peso_actual: valid.pesoActual || valid.pesoNacimiento,
                animal_madre_id: valid.animalMadreId === "sin-madre" ? null : valid.animalMadreId ? Number(valid.animalMadreId) : null,
                animal_padre_id: valid.animalPadreId === "sin-padre" ? null : valid.animalPadreId ? Number(valid.animalPadreId) : null,
                imagen: fotoUrl || null,
            };

            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/');
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
            <Link href="/animales">
                <Button variant="ghost" size="sm" className="mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Volver
                </Button>
            </Link>

            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>Registrar Nuevo Animal</CardTitle>
                    <CardDescription>Los campos con * son obligatorios</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Foto - Opcional */}
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

                        {/* Campos Obligatorios */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="arete" className="flex items-center gap-1">
                                    Arete <span className="text-red-500">*</span>
                                </Label>
                                <Input 
                                    id="arete" 
                                    value={formData.arete} 
                                    onChange={(e) => {
                                        setFormData({...formData, arete: e.target.value.toUpperCase()});
                                        validateField('arete', e.target.value);
                                    }}
                                    className={fieldErrors.arete ? "border-red-500 focus-visible:ring-red-500" : ""} 
                                    maxLength={10} 
                                />
                                {fieldErrors.arete && (
                                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {fieldErrors.arete}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="nombre">Nombre <span className="text-zinc-400 text-xs">(opcional)</span></Label>
                                <Input 
                                    id="nombre" 
                                    value={formData.nombre} 
                                    onChange={(e) => /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]*$/.test(e.target.value) && 
                                        setFormData({...formData, nombre: e.target.value})} 
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label className="flex items-center gap-1">
                                    Sexo <span className="text-red-500">*</span>
                                </Label>
                                <Select 
                                    value={formData.sexo} 
                                    onValueChange={(v: "Macho" | "Hembra") => {
                                        setFormData({...formData, sexo: v});
                                        validateField('sexo', v);
                                    }}
                                >
                                    <SelectTrigger className={fieldErrors.sexo ? "border-red-500 focus-visible:ring-red-500" : ""}>
                                        <SelectValue placeholder="Selecciona" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Hembra">Hembra</SelectItem>
                                        <SelectItem value="Macho">Macho</SelectItem>
                                    </SelectContent>
                                </Select>
                                {fieldErrors.sexo && (
                                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {fieldErrors.sexo}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label className="flex items-center gap-1">
                                    Raza <span className="text-red-500">*</span>
                                </Label>
                                <Select 
                                    value={formData.razaId} 
                                    onValueChange={(v) => {
                                        setFormData({...formData, razaId: v});
                                        validateField('razaId', v);
                                    }}
                                >
                                    <SelectTrigger className={fieldErrors.razaId ? "border-red-500 focus-visible:ring-red-500" : ""}>
                                        <SelectValue placeholder="Selecciona" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {razas.map((r) => (
                                            <SelectItem key={r.raza_id} value={r.raza_id.toString()}>{r.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldErrors.razaId && (
                                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {fieldErrors.razaId}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label>Lote</Label>
                                <Select 
                                    value={formData.loteId} 
                                    onValueChange={(v) => setFormData({...formData, loteId: v})}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Opcional" />
                                    </SelectTrigger>
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
                                <Select 
                                    value={formData.potreroId} 
                                    onValueChange={(v) => setFormData({...formData, potreroId: v})}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Opcional" />
                                    </SelectTrigger>
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
                                <Label htmlFor="fechaNacimiento" className="flex items-center gap-1">
                                    Fecha Nacimiento <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input 
                                        type="date" 
                                        className={`pl-8 ${fieldErrors.fechaNacimiento ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                        value={formData.fechaNacimiento}
                                        max={fechaHoy} 
                                        onChange={(e) => {
                                            setFormData({...formData, fechaNacimiento: e.target.value});
                                            validateField('fechaNacimiento', e.target.value);
                                        }}
                                        required 
                                    />
                                </div>
                                {fieldErrors.fechaNacimiento && (
                                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {fieldErrors.fechaNacimiento}
                                    </p>
                                )}
                                <p className="text-xs text-zinc-500">No puede ser una fecha futura</p>
                            </div>
                            <div>
                                <Label htmlFor="fechaDestete">Fecha Destete</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input 
                                        type="date" 
                                        className={`pl-8 ${fieldErrors.fechaDestete ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                        value={formData.fechaDestete}
                                        max={fechaHoy}
                                        onChange={(e) => {
                                            setFormData({...formData, fechaDestete: e.target.value});
                                            validateField('fechaDestete', e.target.value);
                                        }}
                                    />
                                </div>
                                {fieldErrors.fechaDestete && (
                                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {fieldErrors.fechaDestete}
                                    </p>
                                )}
                                <p className="text-xs text-zinc-500">Opcional - No puede ser futura</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="pesoNacimiento" className="flex items-center gap-1">
                                    Peso al Nacer (kg) <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Weight className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input 
                                        id="pesoNacimiento"
                                        type="number" 
                                        step="0.1" 
                                        min="20" 
                                        max="50" 
                                        className={`pl-8 ${fieldErrors.pesoNacimiento ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                        value={formData.pesoNacimiento}
                                        onChange={(e) => {
                                            setFormData({...formData, pesoNacimiento: e.target.value});
                                            validateField('pesoNacimiento', e.target.value);
                                        }}
                                    />
                                </div>
                                {fieldErrors.pesoNacimiento && (
                                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {fieldErrors.pesoNacimiento}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="pesoActual">Peso Actual (kg)</Label>
                                <div className="relative">
                                    <Scale className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input 
                                        id="pesoActual"
                                        type="number" 
                                        step="0.1" 
                                        min="20" 
                                        max="800" 
                                        className="pl-8"
                                        value={formData.pesoActual}
                                        onChange={(e) => setFormData({...formData, pesoActual: e.target.value})}
                                    />
                                </div>
                                <p className="text-xs text-zinc-500 mt-1">Si no se ingresa, se usará el peso al nacer</p>
                            </div>
                        </div>


                        {/* Padres */}
                        <div className="border-t pt-4">
                            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                                <Droplets className="w-4 h-4" /> Genealogía
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Madre - Solo HEMBRAS */}
                                <div>
                                    <Label>Madre</Label>
                                    <Select value={formData.animalMadreId} 
                                        onValueChange={(v) => setFormData({...formData, animalMadreId: v})}>
                                        <SelectTrigger><SelectValue placeholder="Selecciona la madre" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="sin-madre">Sin madre</SelectItem>
                                            {animales
                                                .filter(a => 
                                                    a.sexo?.toLowerCase() === 'hembra' && 
                                                    a.animal_id !== Number(formData.animalPadreId)
                                                )
                                                .map((a) => (
                                                    <SelectItem key={a.animal_id} value={a.animal_id.toString()}>
                                                        {a.arete} - {a.nombre || 'Sin nombre'}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Padre - Solo MACHOS */}
                                <div>
                                    <Label>Padre</Label>
                                    <Select value={formData.animalPadreId} 
                                        onValueChange={(v) => setFormData({...formData, animalPadreId: v})}>
                                        <SelectTrigger><SelectValue placeholder="Selecciona el padre" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="sin-padre">Sin padre</SelectItem>
                                            {animales
                                                .filter(a => 
                                                    a.sexo?.toLowerCase() === 'macho' && 
                                                    a.animal_id !== Number(formData.animalMadreId)
                                                )
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
                                {loading ? "Registrando..." : "Registrar Animal"}
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