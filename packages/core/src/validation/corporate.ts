import { z } from "zod";

export const corporateLeadSchema = z.object({
  companyName: z.string().trim().min(2).max(200),
  contactName: z.string().trim().min(2).max(150),
  email: z.string().trim().email(),
  phone: z.string().trim().max(30).optional(),
  employeeCountRange: z.string().trim().max(50).optional(),
  message: z.string().trim().max(1000).optional(),
});
