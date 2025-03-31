import { z } from "zod";

// Define Zod schemas for validation

export const TenantSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal code is required"),
});

export const LandlordTypeSchema = z.enum(["private", "social", "company"]);

export const LandlordSchema = z.object({
  type: LandlordTypeSchema,
  name: z.string().min(1, "Landlord name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
});

export const UnpaidReasonSchema = z.enum([
  "unemployment",
  "health",
  "separation",
  "financial",
  "other",
]);

export const UnpaidAmountSchema = z.object({
  amount: z.number().min(0, "Amount must be a positive number"),
  months: z.number().int().min(1, "Months must be at least 1"),
  since: z.string().min(1, "Date of first unpaid is required"),
  reason: UnpaidReasonSchema,
  previousActions: z.string().optional(),
});

export const DossierStatusSchema = z.enum([
  "en_attente",
  "en_cours",
  "procedure_judiciaire",
  "plan_apurement",
  "resolu",
  "expulsion_programmee",
]);

export const DossierCreateSchema = z.object({
  dossierNumber: z.string().min(1, "Dossier number is required"),
  creationDate: z.string().min(1, "Creation date is required"),
  status: DossierStatusSchema,
  tenant: TenantSchema,
  landlord: LandlordSchema,
  unpaidAmount: UnpaidAmountSchema,
  nextDeadline: z.string().optional(),
  nextAction: z.string().optional(),
  additionalNotes: z.string().optional(),
});

export const DossierUpdateSchema = z.object({
  status: DossierStatusSchema.optional(),
  tenant: TenantSchema.partial().optional(),
  landlord: LandlordSchema.partial().optional(),
  unpaidAmount: UnpaidAmountSchema.partial().optional(),
  nextDeadline: z.string().optional(),
  nextAction: z.string().optional(),
  additionalNotes: z.string().optional(),
});
