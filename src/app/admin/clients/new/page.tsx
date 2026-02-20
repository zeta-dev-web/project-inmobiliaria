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
import { toast } from 'react-toastify';
import { clientAxios } from "@/utils/clientAxios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewClientPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cbu, setCbu] = useState("");
  const [alias, setAlias] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await clientAxios.post("/clients", {
        name,
        email,
        phone,
        cbu,
        alias,
      });

      toast.success("Cliente creado con éxito.");

      router.push("/admin/clients");
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
          <CardTitle>Crear Nuevo Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                type="text"
                placeholder="Nombre del cliente"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email del cliente"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="text"
                placeholder="Teléfono del cliente"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cbu">CBU</Label>
              <Input
                id="cbu"
                type="text"
                placeholder="CBU para transferencias"
                maxLength={22}
                value={cbu}
                onChange={(e) => setCbu(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alias">Alias</Label>
              <Input
                id="alias"
                type="text"
                placeholder="Alias para transferencias"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Cargando..." : "Crear Cliente"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
