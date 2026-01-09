import { z } from "zod";

export const rentalSchema = z.object({
  propertyId: z.string().min(1, "La propiedad es requerida"),
  tenantId: z.string().min(1, "El inquilino es requerido"),
  landlordId: z.string().min(1, "El propietario es requerido"),
  guarantorIds: z.array(z.string()).min(1, "Al menos un garante es requerido"),
  rentalPrice: z.number({ required_error: "El precio es requerido", invalid_type_error: "Debe ser un número válido" }).positive("El precio debe ser mayor a 0"),
  updateFrequency: z.number({ required_error: "La frecuencia es requerida", invalid_type_error: "Debe ser un número válido" }).int("Debe ser un número entero").positive("La frecuencia debe ser mayor a 0"),
  startDate: z.date({ required_error: "La fecha de inicio es requerida", invalid_type_error: "Fecha inválida" }),
  endDate: z.date({ required_error: "La fecha de vencimiento es requerida", invalid_type_error: "Fecha inválida" }),
  paymentDueDay: z.number({ required_error: "El día de vencimiento es requerido", invalid_type_error: "Debe ser un número válido" }).int("Debe ser un número entero").min(1, "Mínimo 1").max(31, "Máximo 31"),
  lateFee: z.number({ required_error: "La multa es requerida", invalid_type_error: "Debe ser un número válido" }).min(0, "La multa no puede ser negativa"),
  administrationAmount: z.number({ required_error: "El monto de administración es requerido", invalid_type_error: "Debe ser un número válido" }).positive("El monto debe ser mayor a 0"),
  administrationType: z.enum(["PERCENTAGE", "FIXED"]),
});

export type RentalFormData = z.infer<typeof rentalSchema>;
