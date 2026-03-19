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
    User,
    Shield,
    Phone,
    Mail,
    MapPin
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { usuariosApi } from "@/lib/api/usuarios";

const usuarioSchema = z.object({
    nombre: z.string().min(2, "El nombre es muy corto").max(150, "El nombre es muy largo"),
    telefono: z.string().min(10, "Teléfono inválido").max(20),
    rol: z.enum(['Propietario', 'Veterinario', 'Operario']),
});

export default function NuevoUsuarioPage() {
    const router = useRouter();
    const { toast } = useToast();
    
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    
    const [fincas, setFincas] = useState<Finca[]>([]);
    
    const [formData, setFormData] = useState({
        nombre: "",
        telefono: "",
        rol: "Operario" as "Propietario" | "Veterinario" | "Operario",
    });

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

            } catch (err) {
                toast({ title: "Error", description: "No se pudieron cargar los datos.", variant: "destructive" });
            } finally {
                setDataLoading(false);
            }
        };
        fetchData();
    }, [router, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const valid = usuarioSchema.parse(formData);

            const payload = {
                nombre: valid.nombre,
                telefono: valid.telefono,
                rol: valid.rol,
                debe_cambiar_contrasena: true,
            };

            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await usuariosApi.create(payload, token);

            toast({ 
                title: "¡Usuario Creado!", 
                description: `Usuario ${valid.nombre} registrado correctamente.`,
                className: "bg-purple-600 text-white" 
            });
            
            router.push("/usuarios");

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
                <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 p-8">
            <Link href="/usuarios">
                <Button variant="ghost" size="sm" className="mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Volver
                </Button>
            </Link>

            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Crear Nuevo Usuario</CardTitle>
                    <CardDescription>Campos con * son obligatorios</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Datos básicos */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="nombre">Nombre Completo *</Label>
                                <Input 
                                    id="nombre" 
                                    value={formData.nombre} 
                                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                    required 
                                />
                            </div>
                            <div>
                                <Label htmlFor="telefono">Teléfono *</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input 
                                        id="telefono" 
                                        className="pl-10"
                                        value={formData.telefono}
                                        onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                                        required 
                                    />
                                </div>
                            </div>
                        </div>

                            <div>
                                <Label>Rol *</Label>
                                <Select value={formData.rol} 
                                    onValueChange={(v: "PROPIETARIO" | "OPERARIO" | "VETERINARIO") => setFormData({...formData, rol: v})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PROPIETARIO">
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-4 h-4" />
                                                Propietario
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="OPERARIO">
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-4 h-4" />
                                                Operario
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="VETERINARIO">
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-4 h-4" />
                                                Veterinario
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700">
                                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                {loading ? "Creando..." : "Crear Usuario"}
                            </Button>
                            <Link href="/usuarios">
                                <Button type="button" variant="outline">Cancelar</Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}