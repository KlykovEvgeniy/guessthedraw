import type { AuthenticatedSocket } from "../middlewares/auth/isSocketAuth";

class PaintController {
    async startDrawing(socket: AuthenticatedSocket, data: { roomId: string; x: number; y: number; color: string; lineWidth?: number }) {
        const { roomId, x, y, color } = data;
        if (!roomId) return;
        const lineWidth = Number.isFinite(data.lineWidth)
            ? Math.min(30, Math.max(1, Number(data.lineWidth)))
            : 5;
        socket.to(roomId).emit("draw:start", { x, y, color, lineWidth });
    }

    async drawMove(socket: AuthenticatedSocket, data: { roomId: string; x: number; y: number }) {
        const { roomId, x, y } = data;
        if (!roomId) return;
        socket.to(roomId).emit("draw:move", { x, y });
    }

    async clearCanvas(socket: AuthenticatedSocket, data: { roomId: string }) {
        const { roomId } = data;
        if (!roomId) return;
        socket.to(roomId).emit("draw:clear");
    }

    async fillArea(socket: AuthenticatedSocket, data: { roomId: string; x: number; y: number; color: string }) {
        const { roomId, x, y, color } = data;
        if (!roomId || !Number.isFinite(x) || !Number.isFinite(y) || !/^#[0-9a-f]{6}$/i.test(color)) return;
        socket.to(roomId).emit("draw:fill", { x, y, color });
    }
}

export const paintController = new PaintController();
