import { z } from "zod";

// Login Schema
export const loginSchema = z.object({
    phone: z
        .string()
        .regex(/^98\d{8}$/, "Phone number must start with 98 and have 10 digits (e.g. 9841234567)"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Register Schema (no role here anymore)
export const registerSchema = z
    .object({
        fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
        phone: z
            .string()
            .regex(/^98\d{8}$/, "Phone number must start with 98 and have 10 digits (e.g. 9841234567)"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type RegisterInput = z.infer<typeof registerSchema>;
