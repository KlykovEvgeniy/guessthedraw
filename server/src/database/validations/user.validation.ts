import { z } from 'zod';

export const RegisterSchema = z.object({
    username: z
        .string()
        .trim()
        .min(3, 'Username must be at least 3 characters long')
        .max(20, 'Username must be at most 20 characters long'),

    email: z.string().trim().email('Invalid email address'),

    password: z
        .string()
        .min(6, 'Password must be at least 6 characters long')
        .max(32, 'Password must be at most 32 characters long'),

    googleId: z.string().optional(),
    avatar: z.string().url('Avatar must be a valid URL').optional(),
});

export const LoginSchema = z.object({
    email: z.email('Invalid email address').trim(),
    password: z.string().min(1, 'Password is required'),
});


export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
