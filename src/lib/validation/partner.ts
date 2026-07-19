import { z } from "zod";

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

export const partnerSchema = z.object({
  name: z.string().trim().min(2, "Ad en az 2 karakter olmalı."),
  phone: optionalString,
  email: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || z.string().email().safeParse(value).success, {
      message: "Geçerli bir e-posta girin.",
    })
    .transform((value) => (value ? value : undefined)),
  address: optionalString,
  taxNumber: optionalString,
});

export type PartnerFormValues = z.infer<typeof partnerSchema>;
