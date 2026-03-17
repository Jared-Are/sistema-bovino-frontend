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
    Upload,
    Image as ImageIcon,
    X,
    Calendar,
    Scale,
    AlertTriangle,
    Droplets,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase"; 
import { z } from "zod";

const hoy = new Date();
const año = hoy.getFullYear();
const mes = String(hoy.getMonth() + 1).padStart(2, '0');
const dia = String(hoy.getDate()).padStart(2, '0');
const fechaHoy = `${año}-${mes}-${dia}`;

const updateAnimalSchema = z.object({
    nombre: z.string().max(40).optional().or(z.literal('')),
    loteId: z.string().optional(),
    potreroId: z.string().optional(),
    fechaDestete: z.string().optional(),
    pesoActual: z.coerce.number()
        .min(20, "El peso mínimo es 20 kg")
        .max(800, "El peso máximo es 800 kg")
        .optional(),
    animalMadreId: z.string().optional(),
    animalPadreId: z.string().optional(),
    estadoReproductivo: z.string().optional(),
});

type Raza = { raza_id: number; nombre: string; };
type Lote = { lote_id: number; nombre: string; };
type Potrero = { potrero_id: number; nombre: string; };
type AnimalSimple = { animal_id: number; arete: string; nombre: string; sexo: string; };

export default function EditarAnimalPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { toast } = useToast();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    
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
        fechaNacimiento: "",
        fechaDestete: "",
        pesoNacimiento: "",
        pesoActual: "",
        animalMadreId: "",
        animalPadreId: "",
        estadoReproductivo: "Vacía",
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

                const [animalRes, razasRes, lotesRes, potrerosRes, animalesRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/animales/${id}`, { headers }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/parametros/razas`, { headers }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/parametros/lotes`, { headers }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/parametros/potreros`, { headers }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/animales?limit=100`, { headers })
                ]);

                if (!animalRes.ok) throw new Error("Animal no encontrado");

                const animal = await animalRes.json();
                
                setFormData({
                    arete: animal.arete || "",
                    nombre: animal.nombre || "",
                    sexo: animal.sexo || "Hembra",
                    razaId: animal.raza?.raza_id?.toString() || "",
                    loteId: animal.lote?.lote_id?.toString() || "",
                    potreroId: animal.potrero?.potrero_id?.toString() || "",
                    fechaNacimiento: animal.fecha_nacimiento?.split('T')[0] || "",
                    fechaDestete: animal.fecha_destete?.split('T')[0] || "",
                    pesoNacimiento: animal.peso_nacimiento?.toString() || "",
                    pesoActual: animal.peso_actual?.toString() || "",
                    animalMadreId: animal.animal_madre_id?.toString() || "",
                    animalPadreId: animal.animal_padre_id?.toString() || "",
                    estadoReproductivo: animal.estado_reproductivo || "Vacía",
                });

                if (animal.imagen) setFotoUrl(animal.imagen);

                if (razasRes.ok) setRazas(await razasRes.json());
                if (lotesRes.ok) setLotes(await lotesRes.json());
                if (potrerosRes.ok) setPotreros(await potrerosRes.json());
                if (animalesRes.ok) setAnimales(await animalesRes.json());

            } catch (err: any) {
                setError(err.message);
                toast({ title: "Error", description: err.message, variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, router, toast]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!e.target.files || e.target.files.length === 0) return;
            
            setUploading(true);
            const file = e.target.files[0];

            if (!file.type.startsWith('image/')) throw new Error("Solo imágenes");
            if (file.size > 5 * 1024 * 1024) throw new Error("Máximo 5MB");

            const fileExt = file.name.split('.').pop();
            const fileName = `animal_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `animales/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('ganado')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('ganado').getPublicUrl(filePath);
            setFotoUrl(data.publicUrl);
            
            toast({ title: "Imagen actualizada" });

        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = () => setFotoUrl("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});
        setSaving(true);

        try {
            const datosParaValidar = {
                nombre: formData.nombre,
                loteId: formData.loteId,
                potreroId: formData.potreroId,
                fechaDestete: formData.fechaDestete,
                pesoActual: formData.pesoActual ? Number(formData.pesoActual) : undefined,
                animalMadreId: formData.animalMadreId,
                animalPadreId: formData.animalPadreId,
                estadoReproductivo: formData.estadoReproductivo,
            };

            // Validar solo si hay algún cambio (opcional)
            if (Object.values(datosParaValidar).some(val => val !== undefined && val !== '')) {
                updateAnimalSchema.parse(datosParaValidar);
            }

            // Construir payload solo con campos que cambiaron
            const payload: any = {};

            if (formData.nombre !== undefined) payload.nombre = formData.nombre || null;
            if (formData.pesoActual) payload.peso_actual = Number(formData.pesoActual);
            if (formData.fechaDestete) payload.fecha_destete = formData.fechaDestete;
            if (formData.loteId) payload.lote_id = formData.loteId === "sin-lote" ? null : Number(formData.loteId);
            if (formData.potreroId) payload.potrero_id = formData.potreroId === "sin-potrero" ? null : Number(formData.potreroId);
            if (formData.animalMadreId) payload.animal_madre_id = formData.animalMadreId === "sin-madre" ? null : Number(formData.animalMadreId);
            if (formData.animalPadreId) payload.animal_padre_id = formData.animalPadreId === "sin-padre" ? null : Number(formData.animalPadreId);
            if (formData.estadoReproductivo) payload.estado_reproductivo = formData.estadoReproductivo;
            if (fotoUrl !== undefined) payload.imagen = fotoUrl || null;

            // Si no hay cambios, mostrar mensaje
            if (Object.keys(payload).length === 0) {
                toast({ title: "Sin cambios", description: "No hay cambios para guardar" });
                setSaving(false);
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) throw new Error('No autorizado');

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/animales/${id}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Error al actualizar");
            }

            toast({ 
                title: "¡Animal Actualizado!", 
                description: "Los cambios se guardaron correctamente.",
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
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 p-8 flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-zinc-50 p-8">
                <div className="flex flex-col items-center justify-center h-64 text-center p-6 bg-red-50 rounded-lg border border-red-100">
                    <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                    <h3 className="text-lg font-bold text-red-700 mb-2">Error al cargar animal</h3>
                    <p className="text-muted-foreground max-w-md">{error}</p>
                    <Button className="mt-4" onClick={() => router.push("/animales")}>
                        Volver a la lista
                    </Button>
                </div>
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
                    <CardTitle className="text-2xl">Editar Animal</CardTitle>
                    <CardDescription>Modifica los datos del animal</CardDescription>
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
                                        disabled={uploading || saving} />
                                </div>
                            </div>
                        </div>

                        {/* Datos no editables (solo lectura) */}
                        <div className="grid md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                            <div>
                                <Label className="text-gray-600">Arete</Label>
                                <div className="p-2 border border-gray-200 rounded-md bg-white">
                                    {formData.arete}
                                </div>
                            </div>
                            <div>
                                <Label className="text-gray-600">Sexo</Label>
                                <div className="p-2 border border-gray-200 rounded-md bg-white">
                                    {formData.sexo}
                                </div>
                            </div>
                            <div>
                                <Label className="text-gray-600">Raza</Label>
                                <div className="p-2 border border-gray-200 rounded-md bg-white">
                                    {razas.find(r => r.raza_id.toString() === formData.razaId)?.nombre || 'No especificada'}
                                </div>
                            </div>
                            <div>
                                <Label className="text-gray-600">Fecha Nacimiento</Label>
                                <div className="p-2 border border-gray-200 rounded-md bg-white">
                                    {new Date(formData.fechaNacimiento).toLocaleDateString()}
                                </div>
                            </div>
                            <div>
                                <Label className="text-gray-600">Peso al Nacer</Label>
                                <div className="p-2 border border-gray-200 rounded-md bg-white">
                                    {formData.pesoNacimiento} kg
                                </div>
                            </div>
                        </div>

                        {/* Campos editables */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-zinc-900">Campos Editables</h3>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Nombre</Label>
                                    <Input 
                                        value={formData.nombre} 
                                        onChange={(e) => {
                                            if (/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]*$/.test(e.target.value) || e.target.value === '') {
                                                setFormData({...formData, nombre: e.target.value});
                                            }
                                        }}
                                        placeholder="Nombre del animal"
                                    />
                                </div>
                                <div>
                                    <Label>Lote</Label>
                                    <Select 
                                        value={formData.loteId} 
                                        onValueChange={(v) => setFormData({...formData, loteId: v})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona lote" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="sin-lote">Sin lote</SelectItem>
                                            {lotes.map((l) => (
                                                <SelectItem key={l.lote_id} value={l.lote_id.toString()}>{l.nombre}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Potrero</Label>
                                    <Select 
                                        value={formData.potreroId} 
                                        onValueChange={(v) => setFormData({...formData, potreroId: v})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona potrero" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="sin-potrero">Sin potrero</SelectItem>
                                            {potreros.map((p) => (
                                                <SelectItem key={p.potrero_id} value={p.potrero_id.toString()}>{p.nombre}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Fecha Destete</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input 
                                            type="date" 
                                            className="pl-8"
                                            value={formData.fechaDestete}
                                            max={fechaHoy}
                                            onChange={(e) => setFormData({...formData, fechaDestete: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Peso Actual (kg)</Label>
                                    <div className="relative">
                                        <Scale className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input 
                                            type="number" 
                                            step="0.1" 
                                            min="20" 
                                            max="800" 
                                            className="pl-8"
                                            value={formData.pesoActual}
                                            onChange={(e) => setFormData({...formData, pesoActual: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label>Estado Reproductivo</Label>
                                    <Select 
                                        value={formData.estadoReproductivo} 
                                        onValueChange={(v) => setFormData({...formData, estadoReproductivo: v})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Vacía">Vacía</SelectItem>
                                            <SelectItem value="Gestante">Gestante</SelectItem>
                                            <SelectItem value="Lactando">Lactando</SelectItem>
                                            <SelectItem value="Seca">Seca</SelectItem>
                                            <SelectItem value="En celo">En celo</SelectItem>
                                            <SelectItem value="Inseminada">Inseminada</SelectItem>
                                            <SelectItem value="Parida">Parida</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Padres */}
                            <div className="border-t pt-4">
                                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                                    <Droplets className="w-4 h-4" /> Genealogía
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Madre</Label>
                                        <Select 
                                            value={formData.animalMadreId} 
                                            onValueChange={(v) => setFormData({...formData, animalMadreId: v})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona la madre" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="sin-madre">Sin madre</SelectItem>
                                                {animales
                                                    .filter(a => a.sexo?.toLowerCase() === 'hembra')
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
                                        <Select 
                                            value={formData.animalPadreId} 
                                            onValueChange={(v) => setFormData({...formData, animalPadreId: v})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona el padre" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="sin-padre">Sin padre</SelectItem>
                                                {animales
                                                    .filter(a => a.sexo?.toLowerCase() === 'macho')
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
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" disabled={saving || uploading} className="bg-emerald-600">
                                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                {saving ? "Guardando..." : "Guardar Cambios"}
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