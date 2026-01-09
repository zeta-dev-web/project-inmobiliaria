"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Users, Search, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import clientAxios from "@/utils/clientAxios";
import { Client } from "@/generated/prisma";
import { ModernTable } from "@/components/ui/modern-table";
import { ClientModal } from "../properties/components/client-modal";
import { ClientViewModal } from "./components/client-view-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, Eye } from "lucide-react";
import { toast } from 'react-toastify';
import { cn } from "@/lib/shadcn/utils";

export default function ClientsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: response, isLoading, error } = useQuery({
    queryKey: ["clients", page],
    queryFn: async () => {
      const { data } = await clientAxios.get(`/clients?page=${page}&limit=10`);
      return data;
    },
  });

  const data = response?.data || [];
  const totalPages = response?.totalPages || 1;

  const filteredData = data.filter((client: Client) => {
    const matchesSearch = !search || 
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.email.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => clientAxios.delete(`/clients/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Cliente eliminado exitosamente");
    },
    onError: () => {
      toast.error("Error al eliminar el cliente");
    },
  });

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setModalOpen(true);
  };

  const handleView = async (client: Client) => {
    const { data } = await clientAxios.get(`/clients/${client.id}`);
    setSelectedClient(data);
    setViewModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedClient(undefined);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedClient(undefined);
  };

  const columns = [
    {
      key: "name",
      label: "Cliente",
      render: (client: Client) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-[#600096]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900 truncate">{client.name}</p>
            <p className="text-sm text-gray-500 truncate">{client.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Teléfono",
      render: (client: Client) => (
        <span className="text-gray-900">{client.phone}</span>
      ),
    },
    {
      key: "lastEditedBy",
      label: "Editado por",
      render: (client: any) => (
        <span className="text-gray-600">{client.lastEditedBy?.name || "-"}</span>
      ),
    },
  ];

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error al cargar los clientes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">👥 Clientes</h1>
          <p className="text-gray-600 mt-1">
            Gestión de clientes de la inmobiliaria
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-[#600096] hover:bg-[#500080] text-white shadow-lg hover:shadow-xl transition-all h-11"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Buscador */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 border-gray-300 focus:border-[#600096] focus:ring-[#600096]"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <ModernTable
        data={filteredData}
        columns={columns}
        isLoading={isLoading}
        emptyMessage={search ? "No se encontraron clientes con los filtros aplicados" : "No hay clientes registrados"}
        actions={(client) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white">
              <DropdownMenuItem onClick={() => handleView(client)} className="cursor-pointer">
                <Eye className="mr-2 h-4 w-4" />
                Ver
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(client)} className="cursor-pointer">
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => deleteMutation.mutate(client.id)}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            variant="outline"
            className="h-10 px-4 bg-white hover:bg-gray-50 border-gray-300 disabled:opacity-50"
          >
            Anterior
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                onClick={() => setPage(p)}
                variant={page === p ? "default" : "outline"}
                className={cn(
                  "h-10 w-10",
                  page === p 
                    ? "bg-[#600096] hover:bg-[#500080] text-white" 
                    : "bg-white hover:bg-gray-50 border-gray-300 text-gray-700"
                )}
              >
                {p}
              </Button>
            ))}
          </div>
          <Button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            variant="outline"
            className="h-10 px-4 bg-white hover:bg-gray-50 border-gray-300 disabled:opacity-50"
          >
            Siguiente
          </Button>
        </div>
      )}

      <ClientModal
        open={modalOpen}
        onOpenChange={handleCloseModal}
        client={selectedClient}
      />

      <ClientViewModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        client={selectedClient}
      />
    </div>
  );
}