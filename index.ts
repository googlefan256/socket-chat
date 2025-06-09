import { Hono } from "hono";
import { createBunWebSocket, serveStatic } from "hono/bun";
import type { ServerWebSocket } from "bun";
import type { WSContext } from "hono/ws";
import {
    ClientMessageSchema,
    safeParse,
    type ServerMessage,
} from "./src/proto";

const app = new Hono();

const connections = new Set<WSContext<ServerWebSocket>>();

const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();

function broadcastMessage(message: ServerMessage) {
    const messageString = JSON.stringify(message);
    for (const ws of connections) {
        if (ws.readyState === 1) {
            ws.send(messageString);
        }
    }
}

app.get(
    "/ws",
    upgradeWebSocket((c) => {
        return {
            onOpen(event, ws) {
                connections.add(ws);
            },
            onMessage(event, ws) {
                const data = safeParse(
                    ClientMessageSchema,
                    JSON.parse(event.data.toString()),
                );
                if (!data) {
                    return;
                }
                const message = {
                    username: data.username || "匿名",
                    message: data.message,
                    timestamp: new Date().toISOString(),
                    type: "chat" as const,
                };
                broadcastMessage(message);
            },
            onClose(event, ws) {
                connections.delete(ws);
            },
            onError(event, ws) {
                connections.delete(ws);
            },
        };
    }),
);

app.use("/*", serveStatic({ root: "./assets" }));

export default {
    fetch: app.fetch,
    websocket,
};
