"use client";

import { useState } from "react";
import { Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import clientAxios from "@/utils/clientAxios";
import { Client } from "@/generated/prisma";
import { ClientModal } from "./client-modal";
import { SearchableSelect } from "@/components/ui/searchable-select";

interface ClientComboboxProps {
  value?: string;
  onChange: (value: string) => void;
}

export function ClientCombobox({ value, onChange }: ClientComboboxProps) {
  const [clientModalOpen, setClientModalOpen] = useState(false);

  const { data: clients = [], refetch } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data } = await clientAxios.get(`/clients`);
      return data.data as Client[];
    },
  });

  const clientOptions = clients.map((client) => ({
    value: client.id,
    label: client.name,
    subtitle: client.email,
    icon: <User className="h-4 w-4 text-gray-400" />,
  }));

  const handleClientCreated = (clientId: string) => {
    onChange(clientId);
    refetch();
  };

  return (
    <>
      <div className="flex gap-2">
        <SearchableSelect
          options={clientOptions}
          value={value}
          onChange={onChange}
          placeholder="Seleccionar cliente..."
          searchPlaceholder="Buscar cliente..."
          emptyMessage="No se encontraron clientes"
          className="flex-1"
        />
        
        <Button
          type="button"
          onClick={() => setClientModalOpen(true)}
          className="h-11 w-11 p-0 bg-[#600096] hover:bg-[#500080] text-white shadow-lg hover:shadow-xl transition-all"
          title="Crear nuevo cliente"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      <ClientModal
        open={clientModalOpen}
        onOpenChange={setClientModalOpen}
        onClientCreated={handleClientCreated}
      />
    </>
  );
}