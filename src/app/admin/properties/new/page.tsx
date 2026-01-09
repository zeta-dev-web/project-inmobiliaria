"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { toast } from 'react-toastify';
import { clientAxios } from "@/utils/clientAxios";
import { PropertyStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewPropertyPage() {
  const [address, setAddress] = useState("");
  const [rent, setRent] = useState(0);
  const [status, setStatus] = useState<PropertyStatus>(PropertyStatus.AVAILABLE);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await clientAxios.post("/properties", {
        address,
        rent,
        status,
      });

      toast.success("Propiedad creada con éxito.");

      router.push("/admin/properties");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Ocurrió un error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Crear Nueva Propiedad</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                type="text"
                placeholder="Dirección de la propiedad"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rent">Alquiler</Label>
              <Input
                id="rent"
                type="number"
                required
                value={rent}
                onChange={(e) => setRent(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as PropertyStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PropertyStatus.AVAILABLE}>
                    Disponible
                  </SelectItem>
                  <SelectItem value={PropertyStatus.RENTED}>
                    Alquilada
                  </SelectItem>
                  <SelectItem value={PropertyStatus.MAINTENANCE}>
                    Mantenimiento
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Cargando..." : "Crear Propiedad"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
