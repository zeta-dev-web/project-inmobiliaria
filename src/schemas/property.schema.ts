import * as z from "zod";

export const propertySchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  address: z.string().min(1, "La dirección es requerida"),
  clientId: z.string().min(1, "El cliente es requerido"),
  type: z.enum(["RENT", "SALE"], { required_error: "Debe seleccionar un tipo" }),
  price: z.number({ required_error: "El precio es requerido", invalid_type_error: "El precio debe ser un número" }).positive("El precio debe ser mayor a 0"),
  saleCommission: z.number().min(0).max(100).optional(),
  description: z.string().optional(),
  status: z.enum(["AVAILABLE", "RENTED", "SOLD", "UNAVAILABLE"]).optional(),
  requirements: z.string().optional(),
  documentation: z.string().optional(),
});

export type PropertyFormData = z.infer<typeof propertySchema>;
