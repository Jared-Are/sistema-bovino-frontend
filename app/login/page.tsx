"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tractor, Loader2, Lock, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Aquí irá la conexión real a NestJS después.
      // Por ahora, simulamos que el servidor está verificando la base de datos...
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (identifier === "" || password === "") {
        toast.error("Datos incompletos", { 
            description: "Por favor ingresa tu usuario y contraseña." 
        });
        setLoading(false);
        return;
      }

      // Simulamos un inicio de sesión exitoso
      toast.success("¡Acceso concedido!", {
          description: "Entrando al panel de la finca..."
      });
      
      // Simulación de redirección (luego lo conectaremos a tu dashboard real según el rol)
      // router.push("/dashboard");

    } catch (err) {
      toast.error("Error de conexión", {
          description: "No se pudo conectar con el servidor."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-stone-100 to-emerald-100 p-4 font-sans">
      <Card className="w-full max-w-md shadow-2xl border-t-4 border-t-emerald-600 bg-white/90 backdrop-blur-sm">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center shadow-inner border border-emerald-200">
            <Tractor className="w-10 h-10 text-emerald-700" />
          </div>
          <CardTitle className="text-3xl font-extrabold text-stone-800 tracking-tight">
            Gestión Bovina
          </CardTitle>
          <CardDescription className="text-stone-500 font-medium text-base">
            Ingresa a tu finca
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-stone-700 font-bold">Usuario, Teléfono o Correo</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-5 w-5 text-stone-400" />
                <Input
                    id="identifier"
                    className="pl-10 bg-stone-50 focus:bg-white h-12 border-stone-200 focus-visible:ring-emerald-500"
                    placeholder="Ej: luis.operario o 88881234"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-stone-700 font-bold">Contraseña / PIN</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-stone-400" />
                <Input
                    id="password"
                    type="password"
                    className="pl-10 bg-stone-50 focus:bg-white h-12 border-stone-200 focus-visible:ring-emerald-500"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                />
              </div>
            </div>

            <Button 
                type="submit" 
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg transition-all shadow-md hover:shadow-lg mt-4" 
                disabled={loading}
            >
              {loading ? (
                 <>
                   <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verificando...
                 </>
              ) : (
                 "Iniciar Sesión"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}