'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Building2,
  Users,
  TrendingUp,
  AlertCircle,
  DollarSign,
  Home,
} from 'lucide-react';
import { motion } from 'framer-motion';

type ReportData = {
  totalProperties: number;
  totalRentals: number;
  propertiesByStatus: { status: string; _count: number }[];
  propertiesByType: { type: string; _count: number }[];
  totalClients: number;
  monthlyRevenue: {
    month: number;
    totalRent: number;
    totalCommission: number;
  }[];
  currentMonthRevenue: {
    month: number;
    totalRent: number;
    totalCommission: number;
  };
  pendingDeliveries: number;
  pendingDeliveriesAmount: number;
  topProperties: { name: string; revenue: number }[];
  expiringContracts: number;
};

const MONTHS = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [year]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?year=${year}`);
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#600096]"></div>
      </div>
    );
  }

  const totalYearRent = data.monthlyRevenue.reduce(
    (sum, m) => sum + m.totalRent,
    0
  );
  const totalYearCommission = data.monthlyRevenue.reduce(
    (sum, m) => sum + m.totalCommission,
    0
  );
  const currentMonthName = MONTHS[new Date().getMonth()];

  const availableProperties =
    data.propertiesByStatus.find((s) => s.status === 'AVAILABLE')?._count || 0;
  const rentedProperties =
    data.propertiesByStatus.find((s) => s.status === 'RENTED')?._count || 0;
  const rentProperties =
    data.propertiesByType.find((t) => t.type === 'RENT')?._count || 0;
  const saleProperties =
    data.propertiesByType.find((t) => t.type === 'SALE')?._count || 0;

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-600 mt-2">Análisis y métricas del negocio</p>
        </div>
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="px-4 py-2 border rounded-lg"
        >
          {Array.from(
            { length: 5 },
            (_, i) => new Date().getFullYear() - i
          ).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Métricas principales */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item}>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-xs text-green-700 mb-1">
                Ingresos {currentMonthName}
              </p>
              <p className="text-xl font-bold text-green-900">
                ${data.currentMonthRevenue.totalRent.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-[#600096]" />
              </div>
              <p className="text-xs text-purple-700 mb-1">
                Comisiones {currentMonthName}
              </p>
              <p className="text-xl font-bold text-purple-900">
                ${data.currentMonthRevenue.totalCommission.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-xs text-blue-700 mb-1">Propiedades</p>
              <p className="text-xl font-bold text-blue-900">
                {data.totalProperties}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-indigo-600" />
              </div>
              <p className="text-xs text-indigo-700 mb-1">Clientes</p>
              <p className="text-xl font-bold text-indigo-900">
                {data.totalClients}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Home className="w-8 h-8 text-violet-600" />
              </div>
              <p className="text-xs text-violet-700 mb-1">Alquileres</p>
              <p className="text-xl font-bold text-violet-900">
                {data.totalRentals}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="w-8 h-8 text-orange-600" />
              </div>
              <p className="text-xs text-orange-700 mb-1">Por Vencer</p>
              <p className="text-xl font-bold text-orange-900">
                {data.expiringContracts}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Propiedades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Propiedades por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Disponibles</span>
                <span className="font-semibold">{availableProperties}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Alquiladas</span>
                <span className="font-semibold">{rentedProperties}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Propiedades por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">En Alquiler</span>
                <span className="font-semibold">{rentProperties}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">En Venta</span>
                <span className="font-semibold">{saleProperties}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pagos pendientes */}
      {data.pendingDeliveries > 0 && (
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-800 font-medium">
                  Pagos Pendientes de Entrega
                </p>
                <p className="text-2xl font-bold text-orange-900">
                  ${data.pendingDeliveriesAmount.toLocaleString()}
                </p>
              </div>
              <div className="text-orange-600">
                <AlertCircle className="w-8 h-8" />
              </div>
            </div>
            <p className="text-sm text-orange-700 mt-2">
              {data.pendingDeliveries} pagos sin entregar
            </p>
          </CardContent>
        </Card>
      )}

      {/* Ingresos mensuales */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Ingresos Mensuales {year}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mes</TableHead>
                  <TableHead className="text-right">Alquileres</TableHead>
                  <TableHead className="text-right">Comisiones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.monthlyRevenue.map((m) => (
                  <TableRow key={m.month}>
                    <TableCell className="font-medium">
                      {MONTHS[m.month - 1]}
                    </TableCell>
                    <TableCell className="text-right">
                      ${m.totalRent.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-[#600096]">
                      ${m.totalCommission.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Top propiedades */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Top 5 Propiedades por Ingresos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Propiedad</TableHead>
                  <TableHead className="text-right">Ingresos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topProperties.map((p, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-right">
                      ${p.revenue.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
