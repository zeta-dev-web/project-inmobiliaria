"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import Link from "next/link";
import {
  Building2,
  Users,
  FileText,
  Home,
  CreditCard,
} from "lucide-react";
import { toast } from 'react-toastify';

export default function AdminPage() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();

  const menuItems = [
    {
      title: "Propiedades",
      description: "Gestiona el inventario de propiedades disponibles",
      href: "/admin/properties",
      icon: Building2,
      color: "bg-blue-500",
      stats: `${stats?.properties || 0} activas`,
    },
    {
      title: "Clientes",
      description: "Administra la base de datos de clientes",
      href: "/admin/clients",
      icon: Users,
      color: "bg-green-500",
      stats: `${stats?.clients || 0} registrados`,
    },
    {
      title: "Ofertas",
      description: "Revisa y gestiona las ofertas recibidas",
      href: "/admin/offers",
      icon: FileText,
      color: "bg-orange-500",
      stats: "pendientes",
    },
    {
      title: "Alquileres",
      description: "Controla los contratos de alquiler activos",
      href: "/admin/rentals",
      icon: Home,
      color: "bg-[#600096]",
      stats: `${stats?.rentals || 0} activos`,
    },
  ];

  return (
    <div className="p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bienvenido, {user?.name || 'Administrador'}
        </h1>
        <p className="text-gray-600">
          Gestiona tu negocio inmobiliario desde este panel de control
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Propiedades</p>
                <p className="text-2xl font-bold text-gray-900">{isLoading ? '...' : stats?.properties || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clientes</p>
                <p className="text-2xl font-bold text-gray-900">{isLoading ? '...' : stats?.clients || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alquileres</p>
                <p className="text-2xl font-bold text-gray-900">{isLoading ? '...' : stats?.rentals || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-[#600096]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos</p>
                <p className="text-2xl font-bold text-gray-900">{isLoading ? '...' : `$${stats?.totalRevenue?.toLocaleString() || 0}`}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Card className="bg-white shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer group">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {item.stats}
                    </span>
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-[#600096] transition-colors">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  <Button 
                    className="w-full bg-[#600096] hover:bg-[#4a0075] text-white"
                    size="sm"
                  >
                    Gestionar {item.title}
                  </Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button 
            className="bg-[#600096] hover:bg-[#4a0075] text-white h-12"
            asChild
          >
            <Link href="/admin/properties/new">
              <Building2 className="w-4 h-4 mr-2" />
              Nueva Propiedad
            </Link>
          </Button>
          
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white h-12"
            asChild
          >
            <Link href="/admin/clients/new">
              <Users className="w-4 h-4 mr-2" />
              Nuevo Cliente
            </Link>
          </Button>
          
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white h-12"
            asChild
          >
            <Link href="/admin/rentals/new">
              <Home className="w-4 h-4 mr-2" />
              Nuevo Alquiler
            </Link>
          </Button>
          
          <Button 
            className="bg-orange-600 hover:bg-orange-700 text-white h-12"
            asChild
          >
            <Link href="/admin/payments/generate">
              <CreditCard className="w-4 h-4 mr-2" />
              Generar Comprobante
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
