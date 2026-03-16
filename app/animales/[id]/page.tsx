'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    ArrowLeft, 
    Save, 
    Loader2,
    Upload,
    Image as ImageIcon,
    X,
    AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase"; 
import { z } from "zod";

const animalSchema = z.object({
    arete: z.string().min(3).max(10),
    nombre: z.string().max(40).optional().or(z.literal('')),
    sexo: z.enum(['Macho', 'Hembra']),
    razaId: z.string().min(1),
    loteId: z.string().optional(),
    potreroId: z.string().optional(),
    fechaNacimiento: z.string().min(1),
    fechaDestete: z.string().optional(),  
    pesoNacimiento: z.coerce.number().min(20).max(50).optional(),
    animalMadreId: z.string().optional(),
    animalPadreId: z.string().optional(),
});

type Raza = { raza_id: number; nombre: string; };
type Lote = { lote_id: number; nombre: string; };
type Potrero = { potrero_id: number; nombre: string; };
type AnimalSimple = { animal_id: number; arete: string; nombre: string; };

export default function EditarAnimalPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { toast } = useToast();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
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
        pesoNacimiento: "",
        animalMadreId: "",
        animalPadreId: "",
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!id) {
                setError("ID no válido");
                setLoading(false);
                return;
            }

            try {
                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;
                if (!token) throw new Error("Sesión no válida");

                const headers = { 'Authorization': `Bearer ${token}` };

                const [animalRes, razasRes, lotesRes, potrerosRes, animalesRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/animales/${id}`, { headers }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/razas`, { headers }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/lotes?estado=activo`, { headers }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/potreros`, { headers }),
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
                    pesoNacimiento: animal.peso_nacimiento?.toString() || "",
                    animalMadreId: animal.animal_madre_id?.toString() || "",
                    animalPadreId: animal.animal_padre_id?.toString() || "",
                });

                if (animal.imagen) setFotoUrl(animal.imagen);

                if (razasRes.ok) setRazas(await razasRes.json());
                if (lotesRes.ok) setLotes(await lotesRes.json());
                if (potrerosRes.ok) setPotreros(await potrerosRes.json());
                if (animalesRes.ok) setAnimales(await animalesRes.json());

            } catch (err: any) {
                console.error("Error:", err);
                setError(err.message);
                toast({ title: "Error", description: err.message, variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, toast]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!e.target.files || e.target.files.length === 0) return;
            
            setUploading(true);
            const file = e.target.files[0];

            if (!file.type.startsWith('image/')) throw new Error("Solo se permiten archivos de imagen");
            if (file.size > 5 * 1024 * 1024) throw new Error("La imagen no puede ser mayor a 5MB");

            const fileExt = file.name.split('.').pop();
            const fileName = `animal_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `animales/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('ganado')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('ganado').getPublicUrl(filePath);
            setFotoUrl(data.publicUrl);
            
            toast({ title: "Imagen actualizada", description: "Recuerda guardar los cambios." });

        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = () => {
        setFotoUrl("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const datosParaValidar = {
                ...formData,
                pesoNacimiento: formData.pesoNacimiento ? Number(formData.pesoNacimiento) : undefined,
            };

            const valid = animalSchema.parse(datosParaValidar);

            const payload = {
                arete: valid.arete.toUpperCase(),
                nombre: valid.nombre || null,
                sexo: valid.sexo,
                raza_id: Number(valid.razaId),
                lote_id: valid.loteId ? Number(valid.loteId) : null,
                potrero_id: valid.potreroId ? Number(valid.potreroId) : null,
                fecha_nacimiento: valid.fechaNacimiento,
                fecha_destete: valid.fechaDestete || null,  
                peso_nacimiento: valid.pesoNacimiento || 0,
                animal_madre_id: valid.animalMadreId ? Number(valid.animalMadreId) : null,
                animal_padre_id: valid.animalPadreId ? Number(valid.animalPadreId) : null,
                imagen: fotoUrl || null,
            };

            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/animales/${id}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("Error al actualizar animal");

            toast({ 
                title: "¡Animal Actualizado!", 
                description: "Los cambios se guardaron correctamente.",
                className: "bg-green-600 text-white" 
            });
            
            router.push("/animales");
            router.refresh();

        } catch (err: any) {
            const mensaje = err instanceof z.ZodError ? err.errors[0].message : err.message;
            toast({ title: "Error", description: mensaje, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 p-8">
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    <p className="ml-3">Cargando animal...</p>
                </div>
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
        <div className="min-h-screen bg-zinc-50">
            <div className="p-8">
                <Link href="/animales">
                    <Button variant="ghost" size="sm" className="mb-6">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Volver a la lista
                    </Button>
                </Link>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Editar Animal</CardTitle>
                        <CardDescription>
                            Modifica los datos del animal.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            <div className="space-y-2">
                                <Label>Fotografía del Animal</Label>
                                <div className="flex items-start gap-6 border p-4 rounded-lg bg-gray-50">
                                    <div className="relative h-32 w-48 bg-white rounded-md border flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                                        {uploading ? (
                                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                        ) : fotoUrl ? (
                                            <>
                                                <img src={fotoUrl} alt="Vista previa" className="h-full w-full object-cover" />
                                                <button 
                                                    type="button" 
                                                    onClick={handleRemoveImage} 
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                >
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
                                    <div className="flex-1 space-y-2">
                                        <Label htmlFor="foto-upload" className="cursor-pointer inline-flex">
                                            <div className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2 rounded-md text-sm font-medium">
                                                <Upload className="h-4 w-4" /> 
                                                {fotoUrl ? "Cambiar Foto" : "Subir Foto"}
                                            </div>
                                            <Input id="foto-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading || saving} />
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Arete *</Label>
                                    <Input value={formData.arete} onChange={(e) => setFormData({...formData, arete: e.target.value.toUpperCase()})} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Nombre</Label>
                                    <Input value={formData.nombre} onChange={(e) => {
                                        if (!/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]*$/.test(e.target.value)) return;
                                        setFormData({...formData, nombre: e.target.value});
                                    }} />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" disabled={saving || uploading} className="bg-emerald-600 hover:bg-emerald-700">
                                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                    {saving ? "Guardando..." : "Guardar Cambios"}
                                </Button>
                                <Link href="/animales">
                                    <Button type="button" variant="outline" disabled={saving}>
                                        Cancelar
                                    </Button>
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}