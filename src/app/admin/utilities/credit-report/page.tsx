'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Search, FileText, History, AlertCircle, CheckCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DebtEntity {
  entidad: string;
  situacion: number;
  fechaSit1?: string;
  monto: number;
  diasAtrasoPago: number;
  refinanciaciones: boolean;
  recategorizacionOblig: boolean;
  situacionJuridica: boolean;
  irrecDisposicionTecnica: boolean;
  enRevision: boolean;
  procesoJud: boolean;
}

interface DebtPeriod {
  periodo: string;
  entidades: DebtEntity[];
}

interface HistoricalDebtEntity {
  entidad: string;
  situacion: number;
  monto: number;
  enRevision: boolean;
  procesoJud: boolean;
}

interface HistoricalDebtPeriod {
  periodo: string;
  entidades: HistoricalDebtEntity[];
}

interface CreditReportResponse {
  status: number;
  results?: {
    identificacion: number;
    denominacion: string;
    periodos: DebtPeriod[];
  };
  errorMessages?: string[];
}

interface HistoricalReportResponse {
  status: number;
  results?: {
    identificacion: number;
    denominacion: string;
    periodos: HistoricalDebtPeriod[];
  };
  errorMessages?: string[];
}

export default function CreditReportPage() {
  const [cuil, setCuil] = useState('');
  const [selectedReport, setSelectedReport] = useState<'current' | 'historical' | null>(null);
  const [creditReport, setCreditReport] = useState<CreditReportResponse | null>(null);
  const [historicalReport, setHistoricalReport] = useState<HistoricalReportResponse | null>(null);

  const currentDebtMutation = useMutation({
    mutationFn: async (cuilToSearch: string) => {
      const res = await fetch('/api/credit-report/current', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cuil: cuilToSearch }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al consultar');
      }
      return res.json();
    },
    onSuccess: (data) => {
      setCreditReport(data);
      setSelectedReport('current');
      toast.success('Consulta realizada exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const historicalDebtMutation = useMutation({
    mutationFn: async (cuilToSearch: string) => {
      const res = await fetch('/api/credit-report/historical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cuil: cuilToSearch }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al consultar');
      }
      return res.json();
    },
    onSuccess: (data) => {
      setHistoricalReport(data);
      setSelectedReport('historical');
      toast.success('Consulta histórica realizada exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSearchCurrent = () => {
    if (!cuil.trim()) {
      toast.error('Ingrese el CUIL de la persona');
      return;
    }
    currentDebtMutation.mutate(cuil.replace(/-/g, ''));
  };

  const handleSearchHistorical = () => {
    if (!cuil.trim()) {
      toast.error('Ingrese el CUIL de la persona');
      return;
    }
    historicalDebtMutation.mutate(cuil.replace(/-/g, ''));
  };

  const getSituacionLabel = (situacion: number) => {
    const situaciones: Record<number, string> = {
      0: 'Normal',
      1: 'Con mora',
      2: 'Mora grave',
      3: 'En gestión de cobranza',
      4: 'Incobrable',
      5: 'Cancelado',
    };
    return situaciones[situacion] || 'Desconocida';
  };

  const getSituacionColor = (situacion: number) => {
    const colors: Record<number, string> = {
      0: 'bg-green-100 text-green-800',
      1: 'bg-yellow-100 text-yellow-800',
      2: 'bg-orange-100 text-orange-800',
      3: 'bg-red-100 text-red-800',
      4: 'bg-red-800 text-white',
      5: 'bg-blue-100 text-blue-800',
    };
    return colors[situacion] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount * 1000);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const isLoading = currentDebtMutation.isPending || historicalDebtMutation.isPending;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold">Antecedentes Crediticios</h1>

      <Card>
        <CardHeader>
          <CardTitle>Buscar Antecedentes Crediticios por CUIL</CardTitle>
          <CardDescription>
            Ingresá el CUIL de la persona para consultar sus antecedentes crediticios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <Label htmlFor="cuil">CUIL</Label>
              <div className="relative">
                <Input
                  id="cuil"
                  placeholder="20-12345678-9"
                  value={cuil}
                  onChange={(e) => setCuil(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchCurrent()}
                  className="pr-12 h-11 border-gray-300 focus:border-[#600096] focus:ring-[#600096]"
                  maxLength={13}
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button
                onClick={handleSearchCurrent}
                disabled={isLoading || !cuil.trim()}
                className="flex-1 md:flex-none bg-[#600096] hover:bg-[#500080] text-white"
              >
                <FileText className="mr-2 h-4 w-4" />
                Deudas Actuales
              </Button>
              <Button
                onClick={handleSearchHistorical}
                disabled={isLoading || !cuil.trim()}
                variant="outline"
                className="flex-1 md:flex-none border-[#600096] text-[#600096] hover:bg-purple-50"
              >
                <History className="mr-2 h-4 w-4" />
                Histórico
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#600096]"></div>
        </div>
      )}

      <AnimatePresence>
        {!isLoading && selectedReport === 'current' && creditReport && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#600096]" />
                  Informe de Deudas Actuales
                </CardTitle>
                <CardDescription>
                  CUIL: {creditReport.results?.identificacion || cuil} - {creditReport.results?.denominacion || 'Sin datos'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {creditReport.results?.periodos && creditReport.results.periodos.length > 0 ? (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      {creditReport.results.periodos.map((periodo, idx) => (
                        <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-lg text-gray-900">
                              Período: {periodo.periodo}
                            </h4>
                            <Badge variant="outline">{periodo.entidades.length} entidades</Badge>
                          </div>
                          <div className="space-y-2">
                            {periodo.entidades.map((entidad, eIdx) => (
                              <div
                                key={eIdx}
                                className="bg-white p-3 rounded border border-gray-200"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="font-medium text-gray-900">{entidad.entidad}</p>
                                      <Badge className={getSituacionColor(entidad.situacion)}>
                                        {getSituacionLabel(entidad.situacion)}
                                      </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                                      <div>
                                        <span className="text-gray-500">Monto:</span>
                                        <p className="font-medium">{formatCurrency(entidad.monto)}</p>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Fecha:</span>
                                        <p className="font-medium">{formatDate(entidad.fechaSit1)}</p>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Días atraso:</span>
                                        <p className="font-medium">{entidad.diasAtrasoPago}</p>
                                      </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {entidad.refinanciaciones && (
                                        <Badge variant="secondary" className="text-xs">Refinanciación</Badge>
                                      )}
                                      {entidad.recategorizacionOblig && (
                                        <Badge variant="secondary" className="text-xs">Recategorización</Badge>
                                      )}
                                      {entidad.situacionJuridica && (
                                        <Badge variant="secondary" className="text-xs">Situación Jurídica</Badge>
                                      )}
                                      {entidad.irrecDisposicionTecnica && (
                                        <Badge variant="secondary" className="text-xs">Irrecuperable</Badge>
                                      )}
                                      {entidad.enRevision && (
                                        <Badge variant="secondary" className="text-xs">En Revisión</Badge>
                                      )}
                                      {entidad.procesoJud && (
                                        <Badge variant="secondary" className="text-xs">Proceso Judicial</Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                    <p className="text-lg font-medium text-gray-900">Sin deudas registradas</p>
                    <p className="text-gray-600">No se encontraron deudas activas para este CUIL</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {!isLoading && selectedReport === 'historical' && historicalReport && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-[#600096]" />
                  Informe Histórico de Deudas
                </CardTitle>
                <CardDescription>
                  CUIL: {historicalReport.results?.identificacion || cuil} - {historicalReport.results?.denominacion || 'Sin datos'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {historicalReport.results?.periodos && historicalReport.results.periodos.length > 0 ? (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      {historicalReport.results.periodos.map((periodo, idx) => (
                        <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-lg text-gray-900">
                              Período: {periodo.periodo}
                            </h4>
                            <Badge variant="outline">{periodo.entidades.length} entidades</Badge>
                          </div>
                          <div className="space-y-2">
                            {periodo.entidades.map((entidad, eIdx) => (
                              <div
                                key={eIdx}
                                className="bg-white p-3 rounded border border-gray-200"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="font-medium text-gray-900">{entidad.entidad}</p>
                                      <Badge className={getSituacionColor(entidad.situacion)}>
                                        {getSituacionLabel(entidad.situacion)}
                                      </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
                                      <div>
                                        <span className="text-gray-500">Monto:</span>
                                        <p className="font-medium">{formatCurrency(entidad.monto)}</p>
                                      </div>
                                      {entidad.enRevision && (
                                        <div>
                                          <span className="text-gray-500">Estado:</span>
                                          <p className="font-medium">En Revisión</p>
                                        </div>
                                      )}
                                      {entidad.procesoJud && (
                                        <div>
                                          <span className="text-gray-500">Judicial:</span>
                                          <p className="font-medium">En Proceso</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                    <p className="text-lg font-medium text-gray-900">Sin historial de deudas</p>
                    <p className="text-gray-600">No se encontró historial de deudas para este CUIL</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Información</p>
              <p className="text-sm text-blue-700 mt-1">
                Los datos son provistos por el Banco Central de la República Argentina (BCRA) 
                a través del Central de Deudores. La información refleja la situación crediticia 
                de la persona consultada en el sistema financiero.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
