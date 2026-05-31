"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  Loader2,
  Calendar,
  Activity,
  Stethoscope,
  Syringe,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const hoyStr = new Date().toISOString().split("T")[0];

const baseEditarMontaSchema = z.object({
  numero_monta: z.string().min(3, "El número de servicio es obligatorio."),
  animal_hembra_id: z.string().min(1, "Debes seleccionar la vaca receptora."),
  tipo_monta: z.enum(["Monta Natural", "Inseminación Artificial"]),
  fecha_programacion: z.string()
    .min(1, "La fecha es requerida.")
    .refine((date) => date <= hoyStr, { message: "No puedes registrar fechas futuras." }),
  estado: z.string(),
  animal_macho_id: z.string().optional(),
  codigo_pajilla: z.string().optional(),
});

const editarMontaSchema = baseEditarMontaSchema.refine(
  (data) => {
    if (
      data.tipo_monta === "Inseminación Artificial" &&
      (!data.codigo_pajilla || data.codigo_pajilla.length < 2)
    ) {
      return false;
    }
    return true;
  },
  {
    message: "El código de pajilla es obligatorio para IA.",
    path: ["codigo_pajilla"],
  },
);

type AnimalSimple = {
  animal_id: number;
  arete: string;
  nombre: string;
  sexo: string;
  fecha_nacimiento: string;
};

export default function EditarReproduccionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [vacas, setVacas] = useState<AnimalSimple[]>([]);
  const [toros, setToros] = useState<AnimalSimple[]>([]);

  const [formData, setFormData] = useState({
    numero_monta: "",
    animal_hembra_id: "",
    tipo_monta: "Monta Natural" as "Monta Natural" | "Inseminación Artificial",
    fecha_programacion: "",
    animal_macho_id: "sin-toro",
    codigo_pajilla: "",
    estado: "En Evaluación",
  });

  const normalizarEstado = (estadoRaw: string) => {
    if (!estadoRaw) return "En Evaluación";
    const est = estadoRaw.toLowerCase();
    if (est.includes("confirmada")) return "Confirmada";
    if (est.includes("fallida")) return "Fallida";
    return "En Evaluación";
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    const fetchData = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };
        const [animalesRes, registroRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/animales?limit=200`, {
            headers,
          }),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/reproduccion/montas/${id}`,
            { headers },
          ),
        ]);

        if (animalesRes.ok) {
          const animalesData: AnimalSimple[] = await animalesRes.json();
          setVacas(
            animalesData.filter((a) => {
              const meses =
                (new Date().getFullYear() -
                  new Date(a.fecha_nacimiento).getFullYear()) *
                  12 +
                (new Date().getMonth() -
                  new Date(a.fecha_nacimiento).getMonth());
              return a.sexo.toLowerCase() === "hembra" && meses >= 15;
            }),
          );
          setToros(
            animalesData.filter((a) => a.sexo.toLowerCase() === "macho"),
          );
        }

        if (registroRes.ok) {
          const registro = await registroRes.json();
          setFormData({
            numero_monta: registro.numero_monta || "",
            animal_hembra_id: registro.hembra
              ? String(registro.hembra.animal_id)
              : "",
            tipo_monta: registro.tipo_monta || "Monta Natural",
            fecha_programacion: registro.fecha_programacion
              ? registro.fecha_programacion.split("T")[0]
              : "",
            animal_macho_id: registro.macho
              ? String(registro.macho.animal_id)
              : "sin-toro",
            codigo_pajilla: registro.codigo_pajilla || "",
            estado: normalizarEstado(registro.estado),
          });
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos.",
          variant: "destructive",
        });
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, [id, router, toast]);

  const validateField = (field: keyof typeof formData, value: any) => {
    try {
      const fieldSchema =
        baseEditarMontaSchema.shape[
          field as keyof typeof baseEditarMontaSchema.shape
        ];
      if (fieldSchema) fieldSchema.parse(value);
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.errors[0]?.message || "Campo inválido";
        setFieldErrors((prev) => ({ ...prev, [field]: message }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setLoading(true);

    try {
      const valid = editarMontaSchema.parse(formData);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reproduccion/montas/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...valid,
            animal_hembra_id: Number(valid.animal_hembra_id),
            animal_macho_id:
              valid.tipo_monta === "Monta Natural" &&
              valid.animal_macho_id !== "sin-toro"
                ? Number(valid.animal_macho_id)
                : null,
          }),
        },
      );

      if (!response.ok) throw new Error("Error al actualizar");

      toast({
        title: "¡Actualizado!",
        description: "Cambios guardados.",
        className: "bg-green-600 text-white",
      });
      router.push("/reproduccion");
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) errors[e.path[0].toString()] = e.message;
        });
        setFieldErrors(errors);
      } else {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    );

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <Link href="/reproduccion">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Button>
      </Link>
      <Card className="max-w-3xl mx-auto border-emerald-100 shadow-sm">
        <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 pb-6">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-emerald-600" />
            <CardTitle>Editar Servicio Reproductivo</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hembra Receptora *</Label>
                <Select
                  value={formData.animal_hembra_id}
                  onValueChange={(v) => {
                    setFormData({ ...formData, animal_hembra_id: v });
                    validateField("animal_hembra_id", v);
                  }}
                >
                  <SelectTrigger
                    className={
                      fieldErrors.animal_hembra_id ? "border-red-500" : ""
                    }
                  >
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    {vacas.map((v) => (
                      <SelectItem
                        key={v.animal_id}
                        value={v.animal_id.toString()}
                      >
                        {v.arete} - {v.nombre || "Sin nombre"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.animal_hembra_id && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {fieldErrors.animal_hembra_id}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(v) => setFormData({ ...formData, estado: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="En Evaluación">En Evaluación</SelectItem>
                    <SelectItem value="Confirmada">Confirmada</SelectItem>
                    <SelectItem value="Fallida">Fallida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Monta</Label>
                <Select
                  value={formData.tipo_monta}
                  onValueChange={(v: any) =>
                    setFormData({ ...formData, tipo_monta: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monta Natural">Monta Natural</SelectItem>
                    <SelectItem value="Inseminación Artificial">
                      Inseminación Artificial
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fecha</Label>
                <div className="relative">
                  <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="date"
                    max={hoyStr}
                    className={`pl-8 ${fieldErrors.fecha_programacion ? "border-red-500" : ""}`}
                    value={formData.fecha_programacion}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        fecha_programacion: e.target.value,
                      });
                      validateField("fecha_programacion", e.target.value);
                    }}
                  />
                </div>
                {fieldErrors.fecha_programacion && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {fieldErrors.fecha_programacion}
                  </p>
                )}
              </div>
            </div>

            {formData.tipo_monta?.includes("Natural") ? (
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                <Label className="flex items-center gap-2 mb-2">
                  <Stethoscope className="h-4 w-4 text-emerald-600" /> Semental
                  (Toro)
                </Label>
                <Select
                  value={formData.animal_macho_id}
                  onValueChange={(v) =>
                    setFormData({ ...formData, animal_macho_id: v })
                  }
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Selecciona el toro" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sin-toro">
                      Toro externo / Desconocido
                    </SelectItem>
                    {toros.map((t) => (
                      <SelectItem
                        key={t.animal_id}
                        value={t.animal_id.toString()}
                      >
                        {t.arete} - {t.nombre || "Sin nombre"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <Label className="flex items-center gap-2 mb-2">
                  <Syringe className="h-4 w-4 text-blue-600" /> Código de
                  Pajilla (Semen) *
                </Label>
                <Input
                  className={fieldErrors.codigo_pajilla ? "border-red-500" : ""}
                  value={formData.codigo_pajilla}
                  onChange={(e) =>
                    setFormData({ ...formData, codigo_pajilla: e.target.value })
                  }
                />
                {fieldErrors.codigo_pajilla && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {fieldErrors.codigo_pajilla}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Link href="/reproduccion">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Guardar Cambios
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}