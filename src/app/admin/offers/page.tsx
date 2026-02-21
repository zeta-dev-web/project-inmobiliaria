"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import clientAxios from "@/utils/clientAxios";
import { Property } from "@/generated/prisma";
import { ModernTable } from "@/components/ui/modern-table";
import { Badge } from "@/components/ui/badge";
import { Building2, Search, Filter, X, ArrowUpDown, Eye, Globe, Share2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/shadcn/utils";
import { toast } from 'react-toastify';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type PropertyForOffers = Property & {
  client?: { name: string };
};

export default function OffersPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const shareProperty = (property: PropertyForOffers) => {
    const url = `${window.location.origin}/property/${property.id}`;
    const text = `Mira esta propiedad: ${property.name} - $${property.price.toLocaleString()}`;
    
    if (navigator.share) {
      navigator.share({ title: property.name, text, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Enlace copiado al portapapeles");
    }
  };

  const shareWhatsApp = (property: PropertyForOffers) => {
    const url = `${window.location.origin}/property/${property.id}`;
    const text = `Hola! Te comparto esta propiedad para que la veas:\n\n*${property.name}*\n\nUbicacion: ${property.address}\nPrecio: $${property.price.toLocaleString()}\n\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const { data: response, isLoading, error } = useQuery({
    queryKey: ["available-properties", search, typeFilter, sortOrder, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        status: "AVAILABLE",
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(typeFilter && { type: typeFilter }),
        ...(sortOrder && { sortBy: "price", order: sortOrder }),
      });
      const { data } = await clientAxios.get(`/properties?${params.toString()}`);
      return data;
    },
  });

  const data = response?.data || [];
  const totalPages = response?.totalPages || 1;

  const togglePublished = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      await clientAxios.put(`/properties/${id}`, { published });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["available-properties"] });
      toast.success("Estado de publicación actualizado");
    },
    onError: () => {
      toast.error("Error al actualizar la publicación");
    },
  });

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("");
    setSortOrder("");
  };

  const hasActiveFilters = search || typeFilter || sortOrder;

  const columns = [
    {
      key: "name",
      label: "Propiedad",
      render: (property: PropertyForOffers) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-[#600096]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900 truncate">{property.name}</p>
            <p className="text-sm text-gray-500 truncate">{property.address}</p>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Tipo",
      render: (property: PropertyForOffers) => (
        <Badge 
          variant="outline" 
          className={cn(
            "whitespace-nowrap",
            property.type === "RENT" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-green-50 text-green-700 border-green-200"
          )}
        >
          {property.type === "RENT" ? "🏠 Alquiler" : "💰 Venta"}
        </Badge>
      ),
    },
    {
      key: "price",
      label: "Precio",
      render: (property: PropertyForOffers) => (
        <span className="font-semibold text-gray-900 whitespace-nowrap">
          ${property.price.toLocaleString()}
        </span>
      ),
    },
    {
      key: "client",
      label: "Propietario",
      render: (property: PropertyForOffers) => (
        <span className="text-sm text-gray-600">
          {property.client?.name || "N/A"}
        </span>
      ),
    },
    {
      key: "published",
      label: "Estado",
      render: (property: PropertyForOffers) => (
        <div className="flex items-center gap-2">
          {(property as any).published ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Badge 
                  variant="outline" 
                  className="bg-green-50 text-green-700 border-green-200 cursor-pointer hover:bg-green-100"
                >
                  🌐 Publicada
                </Badge>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white">
                <DropdownMenuItem 
                  onClick={() => shareProperty(property)}
                  className="cursor-pointer"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Compartir enlace
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => shareWhatsApp(property)}
                  className="cursor-pointer"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Enviar por WhatsApp
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Badge 
              variant="outline" 
              className="bg-gray-50 text-gray-700 border-gray-200"
            >
              🔒 Privada
            </Badge>
          )}
        </div>
      ),
    },
  ];

  if (error) return <div className="p-6">Error al cargar las propiedades</div>;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">💼 Ofertas Disponibles</h1>
        <p className="text-gray-600 mt-1">
          Propiedades disponibles para alquiler y venta
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Buscador */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre o dirección..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 border-gray-300 focus:border-[#600096] focus:ring-[#600096]"
            />
          </div>

          {/* Filtro por tipo */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className={cn(
                  "h-11 min-w-[140px] justify-between bg-white hover:bg-gray-50 border-gray-300",
                  typeFilter && "border-[#600096] bg-purple-50 hover:bg-purple-100"
                )}
              >
                <span className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  {typeFilter ? (typeFilter === "RENT" ? "Alquiler" : "Venta") : "Tipo"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-white">
              <DropdownMenuItem onClick={() => setTypeFilter("")} className="cursor-pointer">
                Todos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter("RENT")} className="cursor-pointer">
                🏠 Alquiler
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter("SALE")} className="cursor-pointer">
                💰 Venta
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Ordenar por precio */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className={cn(
                  "h-11 min-w-[140px] justify-between bg-white hover:bg-gray-50 border-gray-300",
                  sortOrder && "border-[#600096] bg-purple-50 hover:bg-purple-100"
                )}
              >
                <span className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  {sortOrder ? (sortOrder === "asc" ? "Menor precio" : "Mayor precio") : "Ordenar"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-white">
              <DropdownMenuItem onClick={() => setSortOrder("")} className="cursor-pointer">
                Sin orden
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder("asc")} className="cursor-pointer">
                Menor precio
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder("desc")} className="cursor-pointer">
                Mayor precio
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Botón limpiar filtros */}
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              className="h-11 px-4 bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg transition-all"
            >
              <X className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          )}
        </div>

        {/* Indicadores de filtros activos */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {search && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Búsqueda: {search}
                <button onClick={() => setSearch("")} className="ml-2 hover:text-purple-900">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {typeFilter && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Tipo: {typeFilter === "RENT" ? "Alquiler" : "Venta"}
                <button onClick={() => setTypeFilter("")} className="ml-2 hover:text-purple-900">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {sortOrder && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Orden: {sortOrder === "asc" ? "Menor precio" : "Mayor precio"}
                <button onClick={() => setSortOrder("")} className="ml-2 hover:text-purple-900">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      <ModernTable
        data={data || []}
        columns={columns}
        isLoading={isLoading}
        emptyMessage={hasActiveFilters ? "No se encontraron propiedades con los filtros aplicados" : "No hay propiedades disponibles"}
        actions={(property) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Building2 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white">
              <DropdownMenuItem 
                onClick={() => togglePublished.mutate({ 
                  id: property.id, 
                  published: !(property as any).published 
                })}
                className="cursor-pointer"
              >
                <Globe className="mr-2 h-4 w-4" />
                {(property as any).published ? "Quitar publicación" : "Publicar"}
              </DropdownMenuItem>
              {(property as any).published && (
                <DropdownMenuItem 
                  onClick={() => window.open(`/property/${property.id}`, '_blank')}
                  className="cursor-pointer"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver publicación
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

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
    </div>
  );
}