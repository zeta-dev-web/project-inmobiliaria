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
import { OfferStatus, Property } from "@/src/generated/prisma";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

async function getProperties(): Promise<Property[]> {
  const { data } = await clientAxios.get("/properties");
  return data;
}

export default function NewOfferPage() {
  const [propertyId, setPropertyId] = useState("");
  const [offeringPerson, setOfferingPerson] = useState("");
  const [status, setStatus] = useState<OfferStatus>(OfferStatus.PENDING);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { data: properties, isLoading: isLoadingProperties } = useQuery({
    queryKey: ["properties"],
    queryFn: getProperties,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await clientAxios.post("/offers", {
        propertyId,
        offeringPerson,
        status,
      });

      toast.success("Ofrecimiento creado con éxito.");

      router.push("/admin/offers");
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
          <CardTitle>Crear Nuevo Ofrecimiento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="property">Propiedad</Label>
              <Select
                value={propertyId}
                onValueChange={(value) => setPropertyId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una propiedad" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingProperties ? (
                    <SelectItem value="loading" disabled>
                      Cargando...
                    </SelectItem>
                  ) : (
                    properties?.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.address}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="offeringPerson">Persona Ofrecedora</Label>
              <Input
                id="offeringPerson"
                type="text"
                placeholder="Nombre de la persona"
                required
                value={offeringPerson}
                onChange={(e) => setOfferingPerson(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as OfferStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={OfferStatus.PENDING}>Pendiente</SelectItem>
                  <SelectItem value={OfferStatus.ACCEPTED}>Aceptado</SelectItem>
                  <SelectItem value={OfferStatus.REJECTED}>
                    Rechazado
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Cargando..." : "Crear Ofrecimiento"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
