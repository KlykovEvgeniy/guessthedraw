import { useEffect, useRef, useState, type FC, type PointerEvent } from "react";
import styles from "../styles/styles.module.css";
import type { IPaintBoard } from "../model/PaintBoard";
import { socket } from "../../../app";

type Point = { x: number; y: number };
type DrawStart = Point & { color: string; lineWidth: number };
type PaintTool = "brush" | "fill";
const palette = [
    { name: "Ink", color: "#000000" },
    { name: "Red", color: "#e45f4d" },
    { name: "Orange", color: "#ef9b42" },
    { name: "Yellow", color: "#f4cf55" },
    { name: "Green", color: "#65a66a" },
    { name: "Blue", color: "#548bd4" },
    { name: "Purple", color: "#9870c4" },
    { name: "Eraser", color: "#ffffff" },
];

const fillArea = (canvas: HTMLCanvasElement, point: Point, color: string) => {
    const context = canvas.getContext("2d");
    if (!context) return;

    const { width, height } = canvas;
    const startX = Math.floor(point.x);
    const startY = Math.floor(point.y);
    if (startX < 0 || startY < 0 || startX >= width || startY >= height) return;

    const image = context.getImageData(0, 0, width, height);
    const pixels = image.data;
    const startIndex = (startY * width + startX) * 4;
    const target = [
        pixels[startIndex],
        pixels[startIndex + 1],
        pixels[startIndex + 2],
        pixels[startIndex + 3],
    ];
    const fill = [
        Number.parseInt(color.slice(1, 3), 16),
        Number.parseInt(color.slice(3, 5), 16),
        Number.parseInt(color.slice(5, 7), 16),
        255,
    ];
    if (target.every((channel, index) => channel === fill[index])) return;

    const matchesTarget = (index: number) =>
        Math.abs(pixels[index] - target[0]) <= 32 &&
        Math.abs(pixels[index + 1] - target[1]) <= 32 &&
        Math.abs(pixels[index + 2] - target[2]) <= 32 &&
        Math.abs(pixels[index + 3] - target[3]) <= 32;

    const visited = new Uint8Array(width * height);
    const queue = new Int32Array(width * height);
    let read = 0;
    let write = 0;
    const startPixel = startY * width + startX;
    queue[write++] = startPixel;
    visited[startPixel] = 1;

    while (read < write) {
        const pixel = queue[read++];
        const index = pixel * 4;
        if (!matchesTarget(index)) continue;

        pixels[index] = fill[0];
        pixels[index + 1] = fill[1];
        pixels[index + 2] = fill[2];
        pixels[index + 3] = fill[3];

        const x = pixel % width;
        const neighbors = [
            x > 0 ? pixel - 1 : -1,
            x < width - 1 ? pixel + 1 : -1,
            pixel >= width ? pixel - width : -1,
            pixel < width * (height - 1) ? pixel + width : -1,
        ];
        for (const neighbor of neighbors) {
            if (neighbor >= 0 && !visited[neighbor]) {
                visited[neighbor] = 1;
                queue[write++] = neighbor;
            }
        }
    }

    context.putImageData(image, 0, 0);
};

const resetCanvas = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
};

export const PaintBoard: FC<IPaintBoard> = ({ roomId, isPainter = false }) => {
    const [color, setColor] = useState("#000000");
    const [lineWidth, setLineWidth] = useState(5);
    const [tool, setTool] = useState<PaintTool>("brush");
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const isDrawing = useRef(false);

    useEffect(() => {
        const handleRemoteStart = ({ x, y, color: strokeColor, lineWidth: strokeWidth }: DrawStart) => {
            const context = canvasRef.current?.getContext("2d");
            if (!context) return;
            context.beginPath();
            context.lineCap = "round";
            context.lineJoin = "round";
            context.lineWidth = strokeWidth;
            context.strokeStyle = strokeColor;
            context.moveTo(x, y);
        };
        const handleRemoteMove = ({ x, y }: Point) => {
            const context = canvasRef.current?.getContext("2d");
            if (!context) return;
            context.lineTo(x, y);
            context.stroke();
        };
        const handleRemoteFill = ({ x, y, color: fillColor }: Point & { color: string }) => {
            const canvas = canvasRef.current;
            if (canvas) fillArea(canvas, { x, y }, fillColor);
        };
        const handleRemoteClear = () => resetCanvas(canvasRef.current);

        socket.on("draw:start", handleRemoteStart);
        socket.on("draw:move", handleRemoteMove);
        socket.on("draw:fill", handleRemoteFill);
        socket.on("draw:clear", handleRemoteClear);
        return () => {
            socket.off("draw:start", handleRemoteStart);
            socket.off("draw:move", handleRemoteMove);
            socket.off("draw:fill", handleRemoteFill);
            socket.off("draw:clear", handleRemoteClear);
        };
    }, []);

    useEffect(() => {
        resetCanvas(canvasRef.current);
    }, [isPainter, roomId]);

    const getCanvasPoint = (event: PointerEvent<HTMLCanvasElement>): Point => {
        const bounds = event.currentTarget.getBoundingClientRect();
        return {
            x: (event.clientX - bounds.left) * (event.currentTarget.width / bounds.width),
            y: (event.clientY - bounds.top) * (event.currentTarget.height / bounds.height),
        };
    };

    const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
        if (!isPainter) return;
        const canvas = event.currentTarget;
        const point = getCanvasPoint(event);
        if (tool === "fill") {
            fillArea(canvas, point, color);
            socket.emit("draw:fill", { roomId, ...point, color });
            return;
        }

        const context = canvas.getContext("2d");
        if (!context) return;
        isDrawing.current = true;
        canvas.setPointerCapture(event.pointerId);
        context.beginPath();
        context.lineCap = "round";
        context.lineJoin = "round";
        context.lineWidth = lineWidth;
        context.strokeStyle = color;
        context.moveTo(point.x, point.y);
        socket.emit("draw:start", { roomId, ...point, color, lineWidth });
    };

    const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
        if (!isPainter || !isDrawing.current) return;
        const point = getCanvasPoint(event);
        const context = event.currentTarget.getContext("2d");
        if (!context) return;
        context.lineTo(point.x, point.y);
        context.stroke();
        socket.emit("draw:move", { roomId, ...point });
    };

    const stopDrawing = () => {
        isDrawing.current = false;
    };

    const clearCanvas = () => {
        if (!isPainter) return;
        isDrawing.current = false;
        resetCanvas(canvasRef.current);
        socket.emit("draw:clear", { roomId });
    };

    return (
        <div className={styles.paintBoardContainer}>
            {isPainter && (
                <div className={styles.paintBoardControls}>
                    <div className={styles.toolbarTop}>
                        <div>
                            <span className={styles.toolbarEyebrow}>YOUR CANVAS</span>
                            <strong className={styles.toolbarTitle}>Drawing tools</strong>
                        </div>
                        <button className={styles.clearButton} type="button" onClick={clearCanvas}>
                            Clear canvas
                        </button>
                    </div>
                    <div className={styles.toolbarRow}>
                        <div className={styles.toolGroup} role="group" aria-label="Drawing tools">
                            <button
                                type="button"
                                className={tool === "brush" ? styles.activeTool : styles.toolButton}
                                aria-pressed={tool === "brush"}
                                onClick={() => setTool("brush")}
                            >
                                <span aria-hidden="true">✎</span> Brush
                            </button>
                            <button
                                type="button"
                                className={tool === "fill" ? styles.activeTool : styles.toolButton}
                                aria-pressed={tool === "fill"}
                                onClick={() => setTool("fill")}
                            >
                                <span aria-hidden="true">◩</span> Fill
                            </button>
                        </div>
                        <label className={styles.brushSize}>
                            <span>Size <strong>{lineWidth}px</strong></span>
                            <input
                                type="range"
                                min="1"
                                max="30"
                                value={lineWidth}
                                onChange={(event) => setLineWidth(Number(event.target.value))}
                                disabled={tool !== "brush"}
                                aria-label="Brush size"
                            />
                        </label>
                    </div>
                    <div className={styles.paletteRow}>
                        <span className={styles.paletteLabel}>Pencil colors</span>
                        <div className={styles.paintBoardColorGroup} role="group" aria-label="Pencil colors">
                            {palette.map((swatch) => (
                                <button
                                    key={swatch.name}
                                    type="button"
                                    className={`${styles.colorSwatch} ${color === swatch.color ? styles.selectedColor : ''}`}
                                    style={{ backgroundColor: swatch.color }}
                                    onClick={() => setColor(swatch.color)}
                                    aria-label={swatch.name}
                                    aria-pressed={color === swatch.color}
                                />
                            ))}
                            <label className={styles.customColor}>
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(event) => setColor(event.target.value)}
                                    aria-label="Choose a custom color"
                                />
                                <span aria-hidden="true">+</span>
                            </label>
                        </div>
                    </div>
                </div>
            )}
            <section className={styles.canvasFrame} aria-label="Drawing board">
                <div className={styles.canvasHeader}>
                    <span className={styles.canvasDot} />
                    <span>{isPainter ? "Make your masterpiece!" : "Watch the drawing and guess!"}</span>
                    <span className={styles.canvasDimensions}>600 × 400</span>
                </div>
                <div className={styles.canvasSurface}>
                    <canvas
                        ref={canvasRef}
                        width={600}
                        height={400}
                        className={styles.paintBoardCanvas}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={stopDrawing}
                        onPointerCancel={stopDrawing}
                        onLostPointerCapture={stopDrawing}
                        style={{
                            cursor: isPainter ? (tool === "fill" ? "cell" : "crosshair") : "not-allowed",
                        }}
                        aria-label="Shared drawing canvas"
                    />
                </div>
            </section>
        </div>
    );
};
