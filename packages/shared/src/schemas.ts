import { z } from "zod";

const ipv4Regex =
  /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

const nullableTrimmed = z
  .string()
  .trim()
  .max(240)
  .optional()
  .transform((value) => (value && value.length > 0 ? value : null));

export const printerFormSchema = z.object({
  name: z.string().trim().min(1).max(120),
  ipAddress: z
    .string()
    .trim()
    .regex(ipv4Regex, "Zadejte platnou IPv4 adresu."),
  location: nullableTrimmed,
  department: nullableTrimmed,
  notes: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
  model: nullableTrimmed,
  snmpCommunity: z.string().trim().min(1).max(120),
  profileId: nullableTrimmed,
  isActive: z.boolean().optional().default(true)
});

export const settingsFormSchema = z.object({
  pollIntervalSeconds: z.number().int().min(60).max(86400),
  tonerWarningThreshold: z.number().int().min(1).max(99),
  historyRetentionDays: z
    .number()
    .int()
    .min(1)
    .max(3650)
    .nullable()
    .optional()
    .default(90)
});

export type PrinterFormInput = z.infer<typeof printerFormSchema>;
export type SettingsFormInput = z.infer<typeof settingsFormSchema>;
