"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import clientAxios from "@/utils/clientAxios";
import { toast } from "react-toastify";
import { Calculator } from "lucide-react";

type PricePeriod = {
  id: string;
  startMonth: number;
  endMonth: number;
  price: number | null;
};

type UpdatePriceModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rentalId: string;
  periods: PricePeriod[];
  startDate: Date;
};

export function UpdatePriceModal({ open, onOpenChange, rentalId, periods, startDate }: UpdatePriceModalProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [price, setPrice] = useState("");
  const [calculating, setCalculating] = useState(false);
  const [iclData, setIclData] = useState<any>(null);
  const queryClient = useQueryClient();

  const safePeriods = periods || [];

  const calculateWithICL = async () => {
    if (!selectedPeriod) {
      toast.error("Selecciona un período primero");
      return;
    }

    const period = periods.find(p => p.id === selectedPeriod);
    if (!period) return;

    const previousPeriod = periods.find(p => p.endMonth === period.startMonth - 1);
    if (!previousPeriod?.price) {
      toast.error("No hay precio anterior para calcular");
      return;
    }

    setCalculating(true);
    try {
      const iclStartDate = new Date(startDate);
      iclStartDate.setMonth(startDate.getMonth() + previousPeriod.startMonth - 1);
      iclStartDate.setDate(1);
      
      const iclEndDate = new Date(startDate);
      iclEndDate.setMonth(startDate.getMonth() + previousPeriod.endMonth);
      iclEndDate.setDate(0);

      const desde = iclStartDate.toISOString().split('T')[0];
      const hasta = iclEndDate.toISOString().split('T')[0];

      const { data } = await clientAxios.post('/icl/calculate', {
        basePrice: previousPeriod.price,
        startDate: desde,
        endDate: hasta,
      });

      setIclData(data);
      setPrice(data.updatedPrice.toString());
      toast.success(`Precio calculado con ICL: $${data.updatedPrice.toLocaleString()}`);
    } catch (error) {
      toast.error("Error al calcular con ICL");
    } finally {
      setCalculating(false);
    }
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      await clientAxios.patch(`/rentals/${rentalId}/price-periods/${selectedPeriod}`, {
        price: parseFloat(price),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      toast.success("Precio actualizado exitosamente");
      onOpenChange(false);
      setSelectedPeriod("");
      setPrice("");
      setIclData(null);
    },
    onError: () => {
      toast.error("Error al actualizar el precio");
    },
  });

  const getMonthName = (monthNumber: number) => {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + monthNumber - 1);
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Actualizar Precio de Alquiler</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Período</Label>
            <select
              value={selectedPeriod}
              onChange={(e) => {
                setSelectedPeriod(e.target.value);
                setPrice("");
                setIclData(null);
              }}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#600096]"
            >
              <option value="">Seleccionar período</option>
              {periods.map((period) => (
                <option key={period.id} value={period.id}>
                  Mes {period.startMonth} - {period.endMonth} ({getMonthName(period.startMonth)} - {getMonthName(period.endMonth)})
                  {period.price && ` - Actual: $${period.price.toLocaleString()}`}
                </option>
              ))}
            </select>
          </div>

          {selectedPeriod && (
            <Button
              type="button"
              onClick={calculateWithICL}
              disabled={calculating}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Calculator className="mr-2 h-4 w-4" />
              {calculating ? "Calculando..." : "Calcular con ICL"}
            </Button>
          )}

          {iclData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <p className="font-semibold mb-2">Cálculo ICL:</p>
              <p>Precio base: ${iclData.basePrice.toLocaleString()}</p>
              <p>ICL inicial: {iclData.iclInicial}</p>
              <p>ICL final: {iclData.iclFinal}</p>
              <p>Variación: {iclData.variation}%</p>
              <p className="font-bold text-blue-700 mt-2">Precio actualizado: ${iclData.updatedPrice.toLocaleString()}</p>
            </div>
          )}

          <div>
            <Label>Nuevo Precio</Label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Ingrese el nuevo precio"
              className="mt-1"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => updateMutation.mutate()}
              disabled={!selectedPeriod || !price || updateMutation.isPending}
              className="bg-[#600096] hover:bg-[#500080]"
            >
              {updateMutation.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
