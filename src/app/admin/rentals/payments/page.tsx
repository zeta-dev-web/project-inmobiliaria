"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, FileText, ArrowUpDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import clientAxios from "@/utils/clientAxios";
import { ModernTable } from "@/components/ui/modern-table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PaymentsHistoryPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [filterDelivered, setFilterDelivered] = useState("all");

  const { data: payments, isLoading } = useQuery({
    queryKey: ["all-payments"],
    queryFn: async () => {
      const { data } = await clientAxios.get("/payments");
      return data;
    },
  });

  const filteredAndSortedData = useMemo(() => {
    if (!payments) return [];

    let filtered = payments;

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((payment: any) =>
        payment.rental.property.name.toLowerCase().includes(searchLower) ||
        payment.rental.property.address.toLowerCase().includes(searchLower) ||
        payment.rental.tenant.name.toLowerCase().includes(searchLower) ||
        payment.receiptNumber.toLowerCase().includes(searchLower)
      );
    }

    if (filterDelivered !== "all") {
      filtered = filtered.filter((payment: any) =>
        filterDelivered === "delivered" ? payment.delivered : !payment.delivered
      );
    }

    const sorted = [...filtered].sort((a: any, b: any) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime();
        case "date-asc":
          return new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime();
        case "property":
          return a.rental.property.name.localeCompare(b.rental.property.name);
        case "tenant":
          return a.rental.tenant.name.localeCompare(b.rental.tenant.name);
        default:
          return 0;
      }
    });

    return sorted;
  }, [payments, search, sortBy, filterDelivered]);

  const formatPeriod = (periodMonth: string) => {
    const [year, month] = periodMonth.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  };

  const columns = [
    {
      key: "receiptNumber",
      label: "N° Recibo",
      width: "12%",
      render: (payment: any) => (
        <span className="font-semibold text-gray-900">{payment.receiptNumber}</span>
      ),
    },
    {
      key: "property",
      label: "Propiedad",
      width: "25%",
      render: (payment: any) => (
        <div>
          <p className="font-medium text-gray-900">{payment.rental.property.name}</p>
          <p className="text-sm text-gray-500">{payment.rental.property.address}</p>
        </div>
      ),
    },
    {
      key: "tenant",
      label: "Inquilino",
      width: "15%",
      hideOnMobile: true,
      render: (payment: any) => (
        <span className="text-gray-900">{payment.rental.tenant.name}</span>
      ),
    },
    {
      key: "period",
      label: "Período",
      width: "15%",
      render: (payment: any) => (
        <span className="text-gray-900">{formatPeriod(payment.periodMonth)}</span>
      ),
    },
    {
      key: "amount",
      label: "Monto",
      width: "12%",
      render: (payment: any) => (
        <span className="font-semibold text-gray-900">${payment.amount.toLocaleString()}</span>
      ),
    },
    {
      key: "delivered",
      label: "Entregado",
      width: "10%",
      render: (payment: any) => (
        <Badge
          variant="outline"
          className={payment.delivered
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-yellow-50 text-yellow-700 border-yellow-200"
          }
        >
          {payment.delivered ? "Sí" : "No"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      width: "11%",
      render: (payment: any) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.open(`/api/payments/${payment.id}/receipt`, "_blank")}
          className="h-8"
        >
          <FileText className="h-4 w-4 mr-1" />
          Ver Recibo
        </Button>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">📋 Historial de Pagos</h1>
        <p className="text-gray-600 mt-1">
          Todos los pagos registrados en el sistema
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por propiedad, inquilino o número de recibo..."
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

        <div className="flex gap-3">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[200px]">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Fecha (más reciente)</SelectItem>
              <SelectItem value="date-asc">Fecha (más antigua)</SelectItem>
              <SelectItem value="property">Propiedad (A-Z)</SelectItem>
              <SelectItem value="tenant">Inquilino (A-Z)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterDelivered} onValueChange={setFilterDelivered}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="delivered">Entregados</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ModernTable
        data={filteredAndSortedData}
        columns={columns}
        isLoading={isLoading}
        emptyMessage={search ? "No se encontraron pagos con los filtros aplicados" : "No hay pagos registrados"}
      />
    </div>
  );
}
