import {z} from 'zod';

export const formValidationSchema = z.object({
    text: z.string().min(1, { message: "Text is required" }).max(500, { message: "Text must be less than 500 characters" }),
});