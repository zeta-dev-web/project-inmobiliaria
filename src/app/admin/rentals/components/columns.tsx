"use client";

import { Rental } from "@/src/generated/prisma";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

type RentalWithRelations = Rental & {
  property: {
    address: string;
  };
  client: {
    name: string;
  };
};

export const columns: ColumnDef<RentalWithRelations>[] = [
  {
    accessorKey: "property.address",
    header: "Propiedad",
  },
  {
    accessorKey: "client.name",
    header: "Cliente",
  },
  {
    accessorKey: "startDate",
    header: "Fecha de Inicio",
    cell: ({ row }) => {
      const date = new Date(row.getValue("startDate"));
      return date.toLocaleDateString();
    },
  },
  {
    accessorKey: "endDate",
    header: "Fecha de Fin",
    cell: ({ row }) => {
      const date = new Date(row.getValue("endDate"));
      return date.toLocaleDateString();
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Estado del Pago",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const rental = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(rental.id)}
            >
              Copiar ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <Link href={`/admin/rentals/edit/${rental.id}`}>
              <DropdownMenuItem>Editar</DropdownMenuItem>
            </Link>
            <DropdownMenuItem>Eliminar</DropdownMenuItem>
            <DropdownMenuSeparator />
            <Link href={`/admin/rentals/payments/${rental.id}`}>
              <DropdownMenuItem>Ver Pagos</DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
