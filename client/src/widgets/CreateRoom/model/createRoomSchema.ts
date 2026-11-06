import { z } from 'zod';

export const createRoomShema = z.object({
    maxPlayers: z.number('Must be a number').int().positive().min(2, 'Max players setting must be higher or equal to 2').max(10, 'Max players setting must be lower or equal to 10'),
    maxRounds: z.number('Must be a number').int().positive().min(1, 'Max rounds setting must be higher or equal to 1').max(20, 'Max rounds setting must be lower or equal to 20'),
    drawTime: z.number('Must be a number').int().positive().min(30, 'Draw time setting must be higher or equal to 30 seconds').max(300, 'Draw time setting must be lower or equal to 300 seconds'),
    isPrivate: z.boolean().default(false).optional(),
});

export type ICreateRoom = z.infer<typeof createRoomShema>;