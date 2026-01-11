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
import { Client, Property } from "@/src/generated/prisma";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DatePicker } from "@/components/ui/date-picker";

async function getProperties(): Promise<Property[]> {
  const { data } = await clientAxios.get("/properties");
  return data;
}

async function getClients(): Promise<Client[]> {
  const { data } = await clientAxios.get("/clients");
  return data;
}

export default function NewRentalPage() {
  const [propertyId, setPropertyId] = useState("");
  const [clientId, setClientId] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { data: properties, isLoading: isLoadingProperties } = useQuery({
    queryKey: ["properties"],
    queryFn: getProperties,
  });

  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await clientAxios.post("/rentals", {
        propertyId,
        clientId,
        startDate,
        endDate,
      });

      toast.success("Alquiler creado con éxito.");

      router.push("/admin/rentals");
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
          <CardTitle>Crear Nuevo Alquiler</CardTitle>
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
              <Label htmlFor="client">Cliente</Label>
              <Select
                value={clientId}
                onValueChange={(value) => setClientId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un cliente" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingClients ? (
                    <SelectItem value="loading" disabled>
                      Cargando...
                    </SelectItem>
                  ) : (
                    clients?.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha de Inicio</Label>
              <DatePicker date={startDate} setDate={setStartDate} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha de Fin</Label>
              <DatePicker date={endDate} setDate={setEndDate} />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Cargando..." : "Crear Alquiler"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
