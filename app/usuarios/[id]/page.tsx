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
    User,
    Shield,
    Phone,
    AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { usuariosApi } from "@/lib/api/usuarios";

const usuarioSchema = z.object({
    nombre: z.string().min(2, "El nombre es muy corto").max(150, "El nombre es muy largo"),
    telefono: z.string().min(10, "Teléfono inválido").max(20),
    rol: z.enum(['Propietario', 'Veterinario', 'Operario']),
    estado: z.enum(['Activo', 'Invitado', 'Bloqueado']),
});

type Finca = { finca_id: number; nombre: string; };

export default function EditarUsuarioPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { toast } = useToast();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [fincas, setFincas] = useState<Finca[]>([]);
    
    const [formData, setFormData] = useState({
        nombre: "",
        telefono: "",
        rol: "Operario" as "Propietario" | "Veterinario" | "Operario",
        estado: "Activo" as "Activo" | "Invitado" | "Bloqueado",
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

                const [usuarioRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuarios/${id}`, { headers })
                ]);

                if (!usuarioRes.ok) throw new Error("Usuario no encontrado");

                const usuario = await usuarioRes.json();
                
                setFormData({
                    nombre: usuario.nombre || "",
                    telefono: usuario.telefono || "",
                    rol: usuario.rol || "Operario",
                    fincaId: usuario.finca?.finca_id?.toString() || "",
                    estado: usuario.estado || "Activo",
                });

            } catch (err: any) {
                setError(err.message);
                toast({ title: "Error", description: err.message, variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, router, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const valid = usuarioSchema.parse(formData);

            const payload = {
                nombre: valid.nombre,
                telefono: valid.telefono,
                rol: valid.rol,
                estado: valid.estado,
            };

            const token = localStorage.getItem('token');
            if (!token) throw new Error('No autorizado');

            const response = await usuariosApi.update(id, payload, token);

            toast({ 
                title: "¡Usuario Actualizado!", 
                description: "Los cambios se guardaron correctamente.",
                className: "bg-purple-600 text-white" 
            });
            
            router.push("/usuarios");

        } catch (err: any) {
            const mensaje = err instanceof z.ZodError ? err.errors[0].message : err.message;
            toast({ title: "Error", description: mensaje, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 p-8 flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-zinc-50 p-8">
                <div className="flex flex-col items-center justify-center h-64 text-center p-6 bg-red-50 rounded-lg border border-red-100">
                    <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                    <h3 className="text-lg font-bold text-red-700 mb-2">Error al cargar usuario</h3>
                    <p className="text-muted-foreground max-w-md">{error}</p>
                    <Button className="mt-4" onClick={() => router.push("/usuarios")}>
                        Volver a la lista
                    </Button>
                </div>
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
                    <CardTitle className="text-2xl">Editar Usuario</CardTitle>
                    <CardDescription>Modifica los datos del usuario</CardDescription>
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
                                    />
                                </div>
                            </div>
                        </div>

                            <div>
                                <Label>Estado *</Label>
                                <Select value={formData.estado} 
                                    onValueChange={(v: "ACTIVO" | "INVITADO" | "BLOQUEADO") => setFormData({...formData, estado: v})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACTIVO">Activo</SelectItem>
                                        <SelectItem value="INVITADO">Invitado</SelectItem>
                                        <SelectItem value="BLOQUEADO">Suspendido</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label>Rol *</Label>
                                <Select value={formData.rol} 
                                    onValueChange={(v: "PROPIETARIO" | "VETERINARIO" | "OPERARIO") => setFormData({...formData, rol: v})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="OPERARIO">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                Operario
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="VETERINARIO">
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-4 h-4" />
                                                Veterinario
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="PROPIETARIO">
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-4 h-4" />
                                                Propietario
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" disabled={saving} className="bg-purple-600 hover:bg-purple-700">
                                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                {saving ? "Guardando..." : "Guardar Cambios"}
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