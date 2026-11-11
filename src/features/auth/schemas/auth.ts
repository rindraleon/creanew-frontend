import { z } from "zod";
import {
  isDisposableEmail,
  normalizeEmail,
  DISPOSABLE_EMAIL_MESSAGE,
} from "../../../shared/validators/email";

export const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
  .max(128, "Le mot de passe ne peut pas dépasser 128 caractères.")
  .regex(/[A-Za-z]/, "Le mot de passe doit contenir au moins une lettre.")
  .regex(/\d/, "Le mot de passe doit contenir au moins un chiffre.");

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Au moins 3 caractères.")
  .max(30, "30 caractères max.")
  .regex(/^[a-zA-Z0-9._-]+$/, "Lettres, chiffres, . _ - uniquement.");

// Helper zod pour email non jetable
export const emailSchema = z
  .string()
  .transform(normalizeEmail)
  .pipe(
    z
      .string()
      .max(190, "Adresse e-mail trop longue.")
      .min(1, "L'adresse e-mail est requise.")
      .email("Adresse e-mail invalide.")
      .superRefine((val, ctx) => {
        if (isDisposableEmail(val))
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: DISPOSABLE_EMAIL_MESSAGE });
      }),
  );

export const loginSchema = z
  .object({
    identifier: z.string().trim().min(1, "Email ou nom d’utilisateur requis."),
    password: z.string().min(1, "Le mot de passe est requis."),
  })
  .superRefine((data, ctx) => {
    // Si identifier ressemble à un email, vérifier disposable sans révéler existence
    if (data.identifier.includes("@") && isDisposableEmail(data.identifier)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: DISPOSABLE_EMAIL_MESSAGE,
        path: ["identifier"],
      });
    }
  });

export const registerSchema = z
  .object({
    username: usernameSchema,
    firstName: z.string().trim().max(120).optional().or(z.literal("")),
    lastName: z.string().trim().min(1, "Le nom est requis.").max(120),
    email: emailSchema,
    phone: z
      .string()
      .trim()
      .regex(/^[+0-9 ().-]*$/, "Numéro de téléphone invalide.")
      .optional()
      .or(z.literal("")),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirmez votre mot de passe."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirmez votre mot de passe."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Saisissez votre mot de passe actuel."),
    newPassword: z
      .string()
      .min(10, "Le nouveau mot de passe doit contenir au moins 10 caractères.")
      .regex(/[A-Za-z]/, "Le mot de passe doit contenir au moins une lettre.")
      .regex(/\d/, "Le mot de passe doit contenir au moins un chiffre."),
    confirmPassword: z.string().min(1, "Confirmez le nouveau mot de passe."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  username: usernameSchema,
  firstName: z.string().trim().max(120).optional().or(z.literal("")),
  lastName: z.string().trim().min(1, "Le nom est requis.").max(120),
  email: emailSchema,
  phone: z
    .string()
    .trim()
    .regex(/^[+0-9 ().-]*$/, "Numéro de téléphone invalide.")
    .optional()
    .or(z.literal("")),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterFormInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormInput = z.infer<typeof changePasswordSchema>;
export type ProfileFormInput = z.infer<typeof profileSchema>;
