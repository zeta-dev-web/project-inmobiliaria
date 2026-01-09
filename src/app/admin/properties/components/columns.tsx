"use client";

import { Property } from "@/generated/prisma";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import clientAxios from "@/utils/clientAxios";
import { toast } from 'react-toastify';

const getStatusBadge = (status: string) => {
  const variants = {
    AVAILABLE: "bg-green-100 text-green-800",
    RENTED: "bg-blue-100 text-blue-800",
    MAINTENANCE: "bg-yellow-100 text-yellow-800",
  };
  
  const labels = {
    AVAILABLE: "Disponible",
    RENTED: "Alquilado",
    MAINTENANCE: "Mantenimiento",
  };
  
  return (
    <Badge className={variants[status as keyof typeof variants]}>
      {labels[status as keyof typeof labels]}
    </Badge>
  );
};

interface ColumnsProps {
  onEdit: (property: Property) => void;
}

export const createColumns = ({ onEdit }: ColumnsProps): ColumnDef<Property>[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.getValue("name")}</p>
        <p className="text-sm text-muted-foreground">{row.original.address}</p>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.getValue("type") === "RENT" ? "Alquiler" : "Venta"}
      </Badge>
    ),
  },
  {
    accessorKey: "price",
    header: "Precio",
    cell: ({ row }) => {
      const price = row.getValue("price") as number;
      return (
        <div className="font-medium">
          ${price.toLocaleString()}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => getStatusBadge(row.getValue("status")),
  },
  {
    accessorKey: "createdAt",
    header: "Creado",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return date.toLocaleDateString();
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const property = row.original;
      const queryClient = useQueryClient();
      
      const deleteMutation = useMutation({
        mutationFn: () => clientAxios.delete(`/properties/${property.id}`),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["properties"] });
          toast.success("Propiedad eliminada exitosamente");
        },
        onError: () => {
          toast.error("Error al eliminar la propiedad");
        },
      });

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(property)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => deleteMutation.mutate()}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
