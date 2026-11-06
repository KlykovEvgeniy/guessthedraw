import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().trim().email('Invalid email address'),
    password: z
        .string()
        .min(6, 'Password must be at least 6 characters long')
        .max(32, 'Password must be at most 32 characters long'),
});

export type ILoginSchema = z.infer<typeof loginSchema>;